use crate::Connection;
use anyhow::Result;
use async_trait::async_trait;
use tokio::{
    io::AsyncWriteExt,
    net::TcpStream,
    spawn,
    sync::mpsc::{self, UnboundedSender},
};
use worterbuch::{
    codec::{
        encode_export_message, encode_get_message, encode_import_message, encode_pget_message,
        encode_psubscribe_message, encode_set_message, encode_subscribe_message,
        read_server_message, ClientMessage as CM, Export, Get, Import, PGet, PSubscribe,
        ServerMessage as SM, Set, Subscribe,
    },
    config::Config,
};

#[derive(Clone)]
pub struct TcpConnection {
    cmd_tx: UnboundedSender<CM>,
    counter: u64,
}

#[async_trait]
impl Connection for TcpConnection {
    fn set(&mut self, key: &str, value: &str) -> Result<u64> {
        let i = self.counter;
        self.counter += 1;
        self.cmd_tx.send(CM::Set(Set {
            transaction_id: i,
            key: key.to_owned(),
            value: value.to_owned(),
        }))?;
        Ok(i)
    }

    fn get(&mut self, key: &str) -> Result<u64> {
        let i = self.counter;
        self.counter += 1;
        self.cmd_tx.send(CM::Get(Get {
            transaction_id: i,
            key: key.to_owned(),
        }))?;
        Ok(i)
    }

    fn pget(&mut self, key: &str) -> Result<u64> {
        let i = self.counter;
        self.counter += 1;
        self.cmd_tx.send(CM::PGet(PGet {
            transaction_id: i,
            request_pattern: key.to_owned(),
        }))?;
        Ok(i)
    }

    fn subscribe(&mut self, key: &str) -> Result<u64> {
        let i = self.counter;
        self.counter += 1;
        self.cmd_tx.send(CM::Subscribe(Subscribe {
            transaction_id: i,
            key: key.to_owned(),
        }))?;
        Ok(i)
    }

    fn psubscribe(&mut self, request_pattern: &str) -> Result<u64> {
        let i = self.counter;
        self.counter += 1;
        self.cmd_tx.send(CM::PSubscribe(PSubscribe {
            transaction_id: i,
            request_pattern: request_pattern.to_owned(),
        }))?;
        Ok(i)
    }

    fn export(&mut self, path: &str) -> Result<u64> {
        let i = self.counter;
        self.counter += 1;
        self.cmd_tx.send(CM::Export(Export {
            transaction_id: i,
            path: path.to_owned(),
        }))?;
        Ok(i)
    }

    fn import(&mut self, path: &str) -> Result<u64> {
        let i = self.counter;
        self.counter += 1;
        self.cmd_tx.send(CM::Import(Import {
            transaction_id: i,
            path: path.to_owned(),
        }))?;
        Ok(i)
    }
}

pub async fn connect() -> Result<TcpConnection> {
    let config = Config::new()?;

    let host_addr = config.host_addr;
    let port = config.tcp_port;

    eprintln!("Server address: {:?}:{:?}", host_addr, port);

    let server = TcpStream::connect(format!("{host_addr}:{port}")).await?;
    let (mut tcp_rx, mut tcp_tx) = server.into_split();

    let (cmd_tx, mut cmd_rx) = mpsc::unbounded_channel();

    spawn(async move {
        while let Some(msg) = cmd_rx.recv().await {
            match encode_message(&msg) {
                Ok(data) => {
                    if let Err(e) = tcp_tx.write_all(&data).await {
                        eprintln!("failed to send tcp message: {e}");
                        break;
                    }
                }
                Err(e) => {
                    eprintln!("error encoding message: {e}");
                }
            }
        }
    });

    spawn(async move {
        loop {
            match read_server_message(&mut tcp_rx).await {
                Ok(Some(SM::PState(msg))) => {
                    for (key, value) in msg.key_value_pairs {
                        println!("{key} = {value}");
                    }
                }
                Ok(Some(SM::State(msg))) => {
                    if let Some((key, value)) = msg.key_value {
                        println!("{} = {}", key, value);
                    } else {
                        println!("No result.");
                    }
                }
                Ok(Some(SM::Err(msg))) => {
                    eprintln!("server error {}: {}", msg.error_code, msg.metadata);
                }
                Ok(None) => {
                    eprintln!("Connection to server lost.");
                    break;
                }
                Err(e) => {
                    eprintln!("error decoding message: {e}");
                }
                _ => { /* ignore client messages */ }
            }
        }
    });

    let con = TcpConnection { cmd_tx, counter: 1 };

    Ok(con)
}

fn encode_message(msg: &CM) -> Result<Vec<u8>> {
    match msg {
        CM::Get(msg) => Ok(encode_get_message(msg)?),
        CM::PGet(msg) => Ok(encode_pget_message(msg)?),
        CM::Set(msg) => Ok(encode_set_message(msg)?),
        CM::Subscribe(msg) => Ok(encode_subscribe_message(msg)?),
        CM::PSubscribe(msg) => Ok(encode_psubscribe_message(msg)?),
        CM::Export(msg) => Ok(encode_export_message(msg)?),
        CM::Import(msg) => Ok(encode_import_message(msg)?),
    }
}
