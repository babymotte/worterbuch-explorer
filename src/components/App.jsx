import * as React from "react";
import TopicTree from "./TopicTree";
import SortedMap from "collections/sorted-map";
import BottomPanel from "./BottomPanel";
import { toUrl, useServers } from "./ServerManagement";
import Theme from "./Theme";
import { Alert, Box, Snackbar, Stack, useTheme } from "@mui/material";
import SetPanel from "./SetPanel";
import { EditContext } from "./EditButton";
import Subscription from "./Subscription";
import Worterbuch from "./Worterbuch";
import { connect } from "worterbuch-js";

const STATES = {
  SWITCHING_SERVER: "SWITCHING_SERVER",
  SWITCHING_SERVER_CLOSING: "SWITCHING_SERVER_CLOSING",
  SWITCHING_SERVER_CLOSED: "SWITCHING_SERVER_CLOSED",
  NO_SERVER_SELECTED: "NO_SERVER_SELECTED",
  CONNECTING: "CONNECTING",
  ERROR: "ERROR",
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  RECONNECTING: "RECONNECTING",
};

function transitionValid(stateRef, newState) {
  const oldState = stateRef.current;
  if (newState === STATES.SWITCHING_SERVER) {
    return true;
  }
  if (newState === STATES.SWITCHING_SERVER_CLOSING) {
    return oldState === STATES.SWITCHING_SERVER;
  }
  if (newState === STATES.SWITCHING_SERVER_CLOSED) {
    return (
      oldState === STATES.SWITCHING_SERVER ||
      oldState === STATES.SWITCHING_SERVER_CLOSING
    );
  }
  if (newState === STATES.CONNECTING) {
    return (
      oldState === STATES.SWITCHING_SERVER ||
      oldState === STATES.RECONNECTING ||
      oldState === STATES.SWITCHING_SERVER_CLOSED
    );
  }
  if (newState === STATES.NO_SERVER_SELECTED) {
    return (
      oldState === STATES.SWITCHING_SERVER ||
      oldState === STATES.SWITCHING_SERVER_CLOSED
    );
  }
  if (newState === STATES.ERROR) {
    return oldState === STATES.CONNECTING || oldState === STATES.CONNECTED;
  }
  if (newState === STATES.CONNECTED) {
    return oldState === STATES.CONNECTING;
  }
  if (newState === STATES.DISCONNECTED) {
    return oldState === STATES.CONNECTED || STATES.CONNECTING;
  }
  if (newState === STATES.RECONNECTING) {
    return oldState === STATES.DISCONNECTED || oldState === STATES.ERROR;
  }
}

export default function App() {
  const reconnectTimeoutRef = React.useRef();
  const { selectedServer, knownServers, setConnectionStatus } = useServers();
  const [url, authtoken] = toUrl(knownServers[selectedServer]);

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

  const dataRef = React.useRef(new SortedMap());
  const [data, setData] = React.useState(new SortedMap());
  const clearData = React.useCallback(() => {
    dataRef.current = new SortedMap();
    setData(dataRef.current);
  }, []);

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

  const [wb, setWb] = React.useState();
  const wbRef = React.useRef();
  React.useEffect(() => {
    if (wb === null) {
      if (stateRef.current === STATES.SWITCHING_SERVER_CLOSING) {
        transitionState(STATES.SWITCHING_SERVER_CLOSED, {
          status: "warning",
          message: "Connection closed",
        });
      } else {
        transitionState(STATES.DISCONNECTED, {
          status: "error",
          message: "Disconnected from server",
        });
      }
    }
  }, [transitionState, wb]);

  const subscriptionTidRef = React.useRef();
  const unsubscribe = React.useCallback(
    (subscribed) => {
      if (wb && subscriptionTidRef.current) {
        wb.unsubscribe(subscriptionTidRef.current);
        subscriptionTidRef.current = null;
      }
      subscribed(false);
      clearData();
    },
    [clearData, wb]
  );
  const subscribe = React.useCallback(
    (requestPattern, subscribed) => {
      unsubscribe(subscribed);
      clearData();
      if (wb) {
        subscriptionTidRef.current = wb.pSubscribe(
          requestPattern,
          ({ keyValuePairs, deleted }) => {
            if (stateRef.current === STATES.CONNECTED) {
              if (keyValuePairs) {
                mergeKeyValuePairs(keyValuePairs, dataRef.current);
              }
              if (deleted) {
                removeKeyValuePairs(deleted, dataRef.current);
              }
              setData(new SortedMap(dataRef.current));
            }
          },
          true,
          false,
          (err) => {
            showSnackbar("error", err.metadata);
            subscribed(false);
          }
        );
        subscribed(true);
      } else {
        subscribed(false);
      }
    },
    [clearData, showSnackbar, unsubscribe, wb]
  );

  React.useEffect(() => {
    transitionState(STATES.SWITCHING_SERVER);
  }, [selectedServer, transitionState]);

  React.useEffect(() => {
    if (state === STATES.SWITCHING_SERVER) {
      if (wbRef.current) {
        wbRef.current.close();
        transitionState(STATES.SWITCHING_SERVER_CLOSING, {
          status: "warning",
          message: "Closing connection",
        });
      } else {
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
      }
      subscriptionTidRef.current = null;
    }

    if (state === STATES.SWITCHING_SERVER_CLOSED) {
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
    }

    if (state === STATES.CONNECTING) {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      connect(url, authtoken)
        .then((wb) => {
          transitionState(STATES.CONNECTED, {
            status: "ok",
            message: "Connected to server",
          });
          wb.onclose = () => {
            clearData();
            wbRef.current = null;
            setWb(null);
          };
          wbRef.current = wb;
          setWb(wb);
        })
        .catch((err) => {
          console.error(err);
          transitionState(STATES.ERROR, {
            status: "error",
            message: "Could not connect",
          });
        });
    }

    if (state === STATES.DISCONNECTED || state === STATES.ERROR) {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (selectedServer < knownServers.length) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          transitionState(STATES.RECONNECTING, {
            status: "warning",
            message: "Trying to reconnect …",
          });
        }, 1000);
      }
    }

    if (state === STATES.RECONNECTING) {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        transitionState(STATES.SWITCHING_SERVER);
      }, 2000);
    }
  }, [
    authtoken,
    clearData,
    knownServers.length,
    selectedServer,
    state,
    transitionState,
    url,
  ]);

  const set = React.useCallback(
    (key, value) => {
      if (wb) {
        wb.set(key, value);
      }
    },
    [wb]
  );

  const pdelete = React.useCallback(
    (requestPattern) => {
      if (wb) {
        wb.pDelete(requestPattern);
      }
    },
    [wb]
  );

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
      <Worterbuch wb={wb}>
        <Subscription subscribe={subscribe} unsubscribe={unsubscribe}>
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
              <BottomPanel />
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
        </Subscription>
      </Worterbuch>
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
