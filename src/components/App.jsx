import * as React from "react";
import TopicTree from "./TopicTree";
import SortedMap from "collections/sorted-map";
import BottomPanel from "./BottomPanel";
import { toUrl, useServers } from "./ServerManagement";
import Theme from "./Theme";
import { Alert, Box, Snackbar, Stack, useTheme } from "@mui/material";
import SetPanel from "./SetPanel";
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
  const {
    selectedServer,
    knownServers,
    setConnectionStatus,
    subscribe,
    setSubscribe,
  } = useServers();
  const [url, authToken] = toUrl(knownServers[selectedServer]);

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = React.useState("error");
  const [snackbarMessage, setSnackbarMessage] = React.useState(null);
  const handleSnackbarClose = React.useCallback((event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  }, []);
  const showSnackbar = React.useCallback((severity, message) => {
    setSnackbarSeverity(severity);
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  }, []);

  const rootKeyRef = React.useRef("#");

  const [options, setOptions] = React.useState([]);

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

  const lsTidRef = React.useRef();
  const refreshOptions = React.useCallback(() => {
    const split = rootKeyRef.current.split("/");
    split.splice(split.length - 1, 1);
    const parent = split.length > 0 ? split.join("/") : undefined;
    lsTidRef.current = tid();
    const lsMsg = {
      ls: {
        transactionId: lsTidRef.current,
        parent,
      },
    };
    socketRef.current?.send(JSON.stringify(lsMsg));
  }, []);

  const subscriptionTidRef = React.useRef();

  const unsubscribe = React.useCallback(() => {
    if (socketRef.current && subscriptionTidRef.current) {
      const unsubscrMsg = {
        unsubscribe: {
          transactionId: subscriptionTidRef.current,
        },
      };
      socketRef.current.send(JSON.stringify(unsubscrMsg));
    }
  }, []);

  React.useEffect(() => {
    if (subscribe) {
      clearData();
      if (socketRef.current) {
        subscriptionTidRef.current = tid();
        const subscrMsg = {
          pSubscribe: {
            transactionId: subscriptionTidRef.current,
            requestPattern: rootKeyRef.current,
            unique: true,
          },
        };
        socketRef.current.send(JSON.stringify(subscrMsg));
      } else {
        setSubscribe(false);
      }
    } else {
      unsubscribe();
    }
  }, [clearData, setSubscribe, subscribe, unsubscribe]);

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
        if (msg.welcome.info.authorizationRequired) {
          console.log("Requesting authorization ...");
          const msg = JSON.stringify({ authorizationRequest: { authToken } });
          socketRef.current?.send(msg);
        } else {
          transitionState(STATES.HANDSHAKE_COMPLETE, {
            status: "ok",
            message: "Connected to server",
          });
        }
      }
      if (msg.authorized) {
        console.log("Authorization successful");
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
      if (msg.lsState) {
        if (lsTidRef.current === msg.lsState.transactionId) {
          lsTidRef.current = null;
          const split = rootKeyRef.current.split("/");
          split.splice(split.length - 1, 1);
          const parent = split.length > 0 ? split.join("/") : undefined;
          const options = ["#"];
          for (const segment of msg.lsState.children) {
            options.push(parent ? parent + "/" + segment : segment);
          }
          setOptions(options);
        }
      }
      if (msg.ack) {
        if (
          subscriptionTidRef.current === msg.ack.transactionId &&
          !subscribe
        ) {
          clearData();
        }
      }
      if (msg.err) {
        showSnackbar("error", msg.err.metadata);
      }
    },
    [authToken, clearData, showSnackbar, subscribe, transitionState]
  );

  React.useEffect(() => {
    transitionState(STATES.SWITCHING_SERVER);
  }, [selectedServer, transitionState]);

  React.useEffect(() => {
    if (state === STATES.SWITCHING_SERVER) {
      clearData();
      subscriptionTidRef.current = null;

      if (socketRef.current) {
        socketRef.current.onclose = undefined;
        socketRef.current.onerror = undefined;
        socketRef.current.onmessage = undefined;
        socketRef.current.close();
        socketRef.current = undefined;
      }

      setSubscribe(false);

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

    if (state === STATES.HANDSHAKE_COMPLETE && socketRef.current) {
      const currentSocket = socketRef.current;
      let interval = setInterval(() => {
        if (socketRef.current === currentSocket) {
          socketRef.current.send(JSON.stringify(""));
        } else {
          clearInterval(interval);
        }
      }, 1000);
      keepaliveIntervalRef.current = interval;
    }

    if (state === STATES.DISCONNECTED) {
      console.log("clearing subscription tid");
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
  }, [clearData, onMessage, setSubscribe, state, transitionState, url]);

  const set = React.useCallback((key, value) => {
    socketRef.current?.send(
      JSON.stringify({ set: { transactionId: tid(), key, value } })
    );
  }, []);

  const pdelete = React.useCallback((requestPattern) => {
    socketRef.current?.send(
      JSON.stringify({ pDelete: { transactionId: tid(), requestPattern } })
    );
  }, []);

  const [editKey, setEditKey] = React.useState("");
  const [editValue, setEditValue] = React.useState("");
  const [json, setJson] = React.useState(false);

  const editContext = {
    setKey: setEditKey,
    setValue: setEditValue,
    key: editKey,
    value: editValue,
    json,
    setJson,
  };

  return (
    <Theme>
      <EditContext.Provider value={editContext}>
        <Stack sx={{ width: "100vw", height: "100vh" }}>
          <Ornament />
          <Stack flexGrow={1} overflow="auto">
            <Stack padding={2} spacing={2}>
              <TopicTree data={data} pdelete={pdelete} />
            </Stack>
          </Stack>
          <SetPanel set={set} />
          <Ornament />
          <BottomPanel
            rootKeyRef={rootKeyRef}
            options={options}
            refreshOptions={refreshOptions}
          />
        </Stack>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </EditContext.Provider>
    </Theme>
  );
}

function Ornament() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        height: "0.1em",
        width: "100%",
        backgroundColor: theme.palette.primary.main,
      }}
    />
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
