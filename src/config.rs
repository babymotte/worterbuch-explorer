use crate::utils::to_char;
use anyhow::{Context, Result};
use std::env;
#[cfg(feature = "server")]
use std::net::IpAddr;

#[derive(Debug, Clone, PartialEq)]
pub struct Config {
    pub separator: char,
    pub wildcard: char,
    pub multi_wildcard: char,
    pub tcp_port: u16,
    #[cfg(feature = "graphql")]
    pub graphql_port: u16,
    #[cfg(feature = "web")]
    pub web_port: u16,
    #[cfg(feature = "web")]
    pub proto: String,
    #[cfg(feature = "server")]
    pub bind_addr: IpAddr,
    #[cfg(feature = "web")]
    pub cert_path: Option<String>,
    #[cfg(feature = "web")]
    pub key_path: Option<String>,
    #[cfg(feature = "client")]
    pub host_addr: String,
}

impl Config {
    pub fn load_env(&mut self) -> Result<()> {
        if let Ok(val) = env::var("WORTERBUCH_SEPARATOR") {
            self.separator = to_char(val).context("separator must be a single char")?;
        }

        if let Ok(val) = env::var("WORTERBUCH_WILDCARD") {
            self.wildcard = to_char(val).context("wildcard must be a single char")?;
        }

        if let Ok(val) = env::var("WORTERBUCH_MULTI_WILDCARD") {
            self.multi_wildcard = to_char(val).context("multi-wildcard must be a single char")?;
        }

        #[cfg(feature = "web")]
        if let Ok(val) = env::var("WORTERBUCH_PROTO") {
            self.proto = val;
        }

        #[cfg(feature = "web")]
        if let Ok(val) = env::var("WORTERBUCH_WEB_PORT") {
            self.tcp_port = val.parse().context("port must be an integer")?;
        }

        if let Ok(val) = env::var("WORTERBUCH_TCP_PORT") {
            self.tcp_port = val.parse().context("port must be an integer")?;
        }

        #[cfg(feature = "graphql")]
        if let Ok(val) = env::var("WORTERBUCH_GRAPHQL_PORT") {
            self.graphql_port = val.parse().context("port must be an integer")?;
        }

        #[cfg(feature = "server")]
        if let Ok(val) = env::var("WORTERBUCH_BIND_ADDRESS") {
            let ip: IpAddr = val.parse()?;
            self.bind_addr = ip;
        }

        #[cfg(feature = "client")]
        if let Ok(val) = env::var("WORTERBUCH_HOST_ADDRESS") {
            self.host_addr = val;
        }

        Ok(())
    }

    pub fn new() -> Result<Self> {
        let mut config = Config::default();
        config.load_env()?;
        Ok(config)
    }
}

impl Default for Config {
    fn default() -> Self {
        Config {
            separator: '/',
            wildcard: '?',
            multi_wildcard: '#',
            tcp_port: 4242,
            #[cfg(feature = "graphql")]
            graphql_port: 4243,
            #[cfg(feature = "web")]
            web_port: 8080,
            #[cfg(feature = "web")]
            proto: "ws".to_owned(),
            #[cfg(feature = "server")]
            bind_addr: [127, 0, 0, 1].into(),
            #[cfg(feature = "web")]
            cert_path: None,
            #[cfg(feature = "web")]
            key_path: None,
            #[cfg(feature = "client")]
            host_addr: "localhost".to_owned(),
        }
    }
}
