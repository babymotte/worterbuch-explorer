use crate::error::ConnectionResult;
use crate::{
    client::Connection,
    codec::{encode_message, read_server_message},
};
use futures_util::{SinkExt, StreamExt};
use tokio::{spawn, sync::broadcast, sync::mpsc};
use tokio_tungstenite::{connect_async, tungstenite};

pub async fn connect(proto: &str, addr: &str, port: u16) -> ConnectionResult<Connection> {
    let url = format!("{proto}://{addr}:{port}");
    let (server, _) = connect_async(url).await?;
    let (mut ws_tx, mut ws_rx) = server.split();

    let (cmd_tx, mut cmd_rx) = mpsc::unbounded_channel();
    let (result_tx, result_rx) = broadcast::channel(1_000);
    let result_tx_recv = result_tx.clone();

    spawn(async move {
        while let Some(msg) = cmd_rx.recv().await {
            if let Ok(Some(data)) = encode_message(&msg).map(Some) {
                let msg = tungstenite::Message::Binary(data);
                if let Err(e) = ws_tx.send(msg).await {
                    eprintln!("failed to send tcp message: {e}");
                    break;
                }
            } else {
                break;
            }
        }
        // make sure initial rx is not dropped as long as stdin is read
        drop(result_rx);
    });

    spawn(async move {
        loop {
            if let Some(Ok(incoming_msg)) = ws_rx.next().await {
                if incoming_msg.is_binary() {
                    let data = incoming_msg.into_data();
                    match read_server_message(&*data).await {
                        Ok(Some(msg)) => {
                            if let Err(e) = result_tx_recv.send(msg) {
                                eprintln!("Error forwarding server message: {e}");
                            }
                        }
                        Ok(None) => {
                            eprintln!("Connection to server lost.");
                            break;
                        }
                        Err(e) => {
                            eprintln!("Error decoding message: {e}");
                        }
                    }
                }
            }
        }
    });

    Ok(Connection::new(cmd_tx, result_tx))
}
