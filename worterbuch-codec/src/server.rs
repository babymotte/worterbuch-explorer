use crate::{
    ErrorCode, KeyValuePair, KeyValuePairs, MessageType, MetaData, MultiWildcard, ProtocolVersions,
    RequestPattern, Separator, TransactionId, Wildcard,
};
use serde::{Deserialize, Serialize};
use std::fmt;

pub const PSTA: MessageType = 0b10000000;
pub const ACK: MessageType = 0b10000001;
pub const STA: MessageType = 0b10000010;
pub const ERR: MessageType = 0b10000011;
pub const HSHK: MessageType = 0b10000100;

pub const ILLEGAL_WILDCARD: ErrorCode = 0b00000000;
pub const ILLEGAL_MULTI_WILDCARD: ErrorCode = 0b00000001;
pub const MULTI_WILDCARD_AT_ILLEGAL_POSITION: ErrorCode = 0b00000010;
pub const IO_ERROR: ErrorCode = 0b00000011;
pub const SERDE_ERROR: ErrorCode = 0b00000100;
pub const NO_SUCH_VALUE: ErrorCode = 0b00000101;
pub const NOT_SUBSCRIBED: ErrorCode = 0b00000110;
pub const OTHER: ErrorCode = 0b11111111;

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ServerMessage {
    PState(PState),
    Ack(Ack),
    State(State),
    Err(Err),
    Handshake(Handshake),
}

impl ServerMessage {
    pub fn transaction_id(&self) -> u64 {
        match self {
            ServerMessage::PState(msg) => msg.transaction_id,
            ServerMessage::Ack(msg) => msg.transaction_id,
            ServerMessage::State(msg) => msg.transaction_id,
            ServerMessage::Err(msg) => msg.transaction_id,
            ServerMessage::Handshake(_) => 0,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PState {
    pub transaction_id: TransactionId,
    pub request_pattern: RequestPattern,
    pub key_value_pairs: KeyValuePairs,
}

impl fmt::Display for PState {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let kvps: Vec<String> = self
            .key_value_pairs
            .iter()
            .map(|&KeyValuePair { ref key, ref value }| format!("{key}={value}"))
            .collect();
        let joined = kvps.join("\n");
        write!(f, "{joined}")
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Ack {
    pub transaction_id: TransactionId,
}

impl fmt::Display for Ack {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "ack {}", self.transaction_id)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct State {
    pub transaction_id: TransactionId,
    pub key_value: KeyValuePair,
}

impl fmt::Display for State {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let KeyValuePair { key, value } = &self.key_value;
        write!(f, "{key}={value}")
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Err {
    pub transaction_id: TransactionId,
    pub error_code: ErrorCode,
    pub metadata: MetaData,
}

impl fmt::Display for Err {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "server error {}: {}", self.error_code, self.metadata)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Handshake {
    pub supported_protocol_versions: ProtocolVersions,
    pub separator: Separator,
    pub wildcard: Wildcard,
    pub multi_wildcard: MultiWildcard,
}

impl fmt::Display for Handshake {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "handshake: separator: '{}', wildcard: '{}', multi-wildcard: '{}', supported protocol versions: {}",
            self.separator, self.wildcard, self.multi_wildcard, self.supported_protocol_versions.iter().map(|v| format!("{}.{}",v.major,v.minor)).collect::<Vec<String>>().join(", ")
        )
    }
}
