import * as React from "react";
import TopicTree from "./TopicTree";
import SortedMap from "collections/sorted-map";
import BottomPanel from "./BottomPanel";
import { toUrl, useServers } from "./ServerManagement";
import Theme from "./Theme";
import { Stack } from "@mui/material";
import SetPanel from "./SetPanel";
import { sha256 } from "js-sha256";
import { EditContext } from "./EditButton";

let transactionId = 1;
function tid() {
  return transactionId++;
}

const STATES = {
  SWITCHING_SERVER: "SWITCHING_SERVER",
  NO_SERVER_SELECTED: "NO_SERVER_SELECTED",
  CONNECTING: "CONNECTING",
  ERROR: "ERROR",
  CONNECTED: "CONNECTED",
  HANDSHAKE_COMPLETE: "HANDSHAKE_COMPLETE",
  DISCONNECTED: "DISCONNECTED",
  RECONNECTING: "RECONNECTING",
};

function transitionValid(stateRef, newState) {
  const oldState = stateRef.current;
  if (newState === STATES.SWITCHING_SERVER) {
    return true;
  }
  if (newState === STATES.SWITCHING_SERVER) {
    return oldState === STATES.STARTED;
  }
  if (newState === STATES.CONNECTING) {
    return (
      oldState === STATES.SWITCHING_SERVER || oldState === STATES.RECONNECTING
    );
  }
  if (newState === STATES.ERROR) {
    return oldState === STATES.CONNECTING || oldState === STATES.CONNECTED;
  }
  if (newState === STATES.CONNECTED) {
    return oldState === STATES.CONNECTING;
  }
  if (newState === STATES.HANDSHAKE_COMPLETE) {
    return oldState === STATES.CONNECTED;
  }
  if (newState === STATES.DISCONNECTED) {
    return (
      oldState === STATES.CONNECTED || oldState === STATES.HANDSHAKE_COMPLETE
    );
  }
  if (newState === STATES.RECONNECTING) {
    return oldState === STATES.DISCONNECTED;
  }
}

export default function App() {
  const { selectedServer, knownServers, setConnectionStatus } = useServers();
  const [url, authToken] = toUrl(knownServers[selectedServer]);

  const dataRef = React.useRef(new SortedMap());
  const [data, setData] = React.useState(new SortedMap());
  const socketRef = React.useRef();
  const keepaliveIntervalRef = React.useRef();
  const stateRef = React.useRef(STATES.STARTED);
  const [state, setState] = React.useState(stateRef.current);
  const transitionState = React.useCallback(
    (newState, status) => {
      if (transitionValid(stateRef, newState)) {
        console.log(stateRef.current, "=>", newState);
        stateRef.current = newState;
        setState(newState);
        if (status) {
          setConnectionStatus(status);
        }
      }
    },
    [setConnectionStatus]
  );

  const clearData = React.useCallback(() => {
    dataRef.current = new SortedMap();
    setData(dataRef.current);
  }, []);

  const onMessage = React.useCallback(
    (e) => {
      const msg = JSON.parse(e.data);
      if (msg.welcome) {
        const supportedVersions = ["0.7"];
        if (!supportedVersions.includes(msg.welcome.info.protocolVersion)) {
          transitionState(STATES.ERROR, {
            status: "error",
            message: `Protocol version ${msg.welcome.info.protocolVersion} is not supported!`,
          });
          return;
        }
        if (msg.welcome.info.authenticationRequired) {
          console.log("Authenticating ...");
          const salted = msg.welcome.clientId + authToken;
          const hash = sha256.create();
          hash.update(salted);
          const token = hash.hex();
          socketRef.current.send(
            JSON.stringify({ authenticationRequest: { authToken: token } })
          );
        } else {
          transitionState(STATES.HANDSHAKE_COMPLETE, {
            status: "ok",
            message: "Connected to server",
          });
        }
      }
      if (msg.authenticated) {
        console.log("Authentication successful");
        transitionState(STATES.HANDSHAKE_COMPLETE, {
          status: "ok",
          message: "Connected to server",
        });
      }
      if (msg.pState) {
        if (msg.pState.keyValuePairs) {
          mergeKeyValuePairs(msg.pState.keyValuePairs, dataRef.current);
        }
        if (msg.pState.deleted) {
          removeKeyValuePairs(msg.pState.deleted, dataRef.current);
        }
        setData(new SortedMap(dataRef.current));
      }
      if (msg.err) {
        const meta = JSON.parse(msg.err.metadata);
        window.alert(meta);
      }
    },
    [authToken, transitionState]
  );

  React.useEffect(() => {
    transitionState(STATES.SWITCHING_SERVER);
  }, [selectedServer, transitionState]);

  React.useEffect(() => {
    if (state === STATES.SWITCHING_SERVER) {
      if (socketRef.current) {
        clearData();
        socketRef.current.onclose = undefined;
        socketRef.current.onerror = undefined;
        socketRef.current.onmessage = undefined;
        socketRef.current.close();
        socketRef.current = undefined;
      }

      if (!url) {
        transitionState(STATES.NO_SERVER_SELECTED, {
          status: "warning",
          message: "No server selected",
        });
        return;
      }

      transitionState(STATES.CONNECTING, {
        status: "warning",
        message: "Connecting to server …",
      });

      try {
        const ws = new WebSocket(url);
        ws.onopen = () =>
          transitionState(STATES.CONNECTED, {
            status: "warning",
            message: "WebSocket opened, waiting for welcome message …",
          });
        ws.onerror = () =>
          transitionState(STATES.ERROR, {
            status: "error",
            message: "Could not connect to server",
          });
        ws.onclose = () => {
          transitionState(STATES.DISCONNECTED, {
            status: "error",
            message: "Disconnected from server",
          });
        };
        ws.onmessage = onMessage;
        socketRef.current = ws;
      } catch {
        transitionState(STATES.ERROR, {
          status: "warning",
          message: "Invalid URL!",
        });
      }
    }

    if (state === STATES.HANDSHAKE_COMPLETE) {
      const subscrMsg = {
        pSubscribe: { transactionId: 1, requestPattern: "#", unique: true },
      };
      socketRef.current.send(JSON.stringify(subscrMsg));
      keepaliveIntervalRef.current = setInterval(() => {
        socketRef.current.send(JSON.stringify(""));
      }, 1000);
    }

    if (state === STATES.DISCONNECTED) {
      clearInterval(keepaliveIntervalRef.current);
      socketRef.current = undefined;
      setTimeout(
        transitionState(STATES.RECONNECTING, {
          status: "ok",
          message: "Trying to reconnect …",
        }),
        2500
      );
    }

    if (state === STATES.RECONNECTING) {
      setTimeout(transitionState(STATES.SWITCHING_SERVER), 1000);
    }
  }, [clearData, onMessage, state, transitionState, url]);

  const set = React.useCallback((key, value) => {
    socketRef.current.send(
      JSON.stringify({ set: { transactionId: tid(), key, value } })
    );
  }, []);

  const pdelete = React.useCallback((requestPattern) => {
    socketRef.current.send(
      JSON.stringify({ pDelete: { transactionId: tid(), requestPattern } })
    );
  }, []);

  const [editKey, setEditKey] = React.useState("");
  const [editValue, setEditValue] = React.useState("");
  const [json, setJson] = React.useState(false);

  const editKontext = {
    setKey: setEditKey,
    setValue: setEditValue,
    key: editKey,
    value: editValue,
    json,
    setJson,
  };

  return (
    <Theme>
      <EditContext.Provider value={editKontext}>
        <Stack sx={{ width: "100vw", height: "100vh" }}>
          <Stack flexGrow={1} overflow="auto">
            <Stack padding={2}>
              <TopicTree data={data} set={set} pdelete={pdelete} />
            </Stack>
          </Stack>
          <SetPanel set={set} />
          <BottomPanel />
        </Stack>
      </EditContext.Provider>
    </Theme>
  );
}

function mergeKeyValuePairs(kvps, data) {
  for (const { key, value } of kvps) {
    const segments = key.split("/");
    mergeIn(data, segments.shift(), segments, value);
  }
}

function removeKeyValuePairs(kvps, data) {
  for (const { key, value } of kvps) {
    const segments = key.split("/");
    remove(data, segments.shift(), segments, value);
  }
}

function mergeIn(data, headSegment, segmentsTail, value) {
  let child = data.get(headSegment);
  if (!child) {
    child = {};
    data.set(headSegment, child);
  } else {
  }

  if (segmentsTail.length === 0) {
    child.value = value;
  } else {
    if (!child.children) {
      child.children = new SortedMap();
    }
    mergeIn(child.children, segmentsTail.shift(), segmentsTail, value);
  }
}

function remove(data, headSegment, segmentsTail) {
  let child = data.get(headSegment);
  if (!child) {
    return;
  }

  if (segmentsTail.length === 0) {
    child.value = undefined;
    if (!child.children?.size) {
      data.delete(headSegment);
    }
    return;
  } else {
    if (!child.children) {
      return;
    }
    remove(child.children, segmentsTail.shift(), segmentsTail);
    if (!child.value && !child.children?.size) {
      data.delete(headSegment);
    }

    return;
  }
}
