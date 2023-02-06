import * as React from "react";
import TopicTree from "./TopicTree";
import SortedMap from "collections/sorted-map";
import BottomPanel from "./BottomPanel";
import { toUrl, useServers } from "./ServerManagement";
import Theme from "./Theme";
import { Stack } from "@mui/material";

export default function App() {
  const { selectedServer, knownServers, setConnectionStatus } = useServers();
  const url = toUrl(knownServers[selectedServer]);

  const dataRef = React.useRef(new SortedMap());
  const [data, setData] = React.useState(new SortedMap());
  const [socket, setSocket] = React.useState();
  const multiWildcardRef = React.useRef();
  const separatorRef = React.useRef();

  React.useEffect(() => {
    console.log("Clearing data");
    setData(new SortedMap());
  }, [selectedServer]);

  if (!url) {
    setConnectionStatus({
      status: "warning",
      message: "No server selected.",
    });
  }

  React.useEffect(() => {
    const topic = multiWildcardRef.current;
    if (topic && socket) {
      dataRef.current = new SortedMap();
      const subscrMsg = {
        pSubscribe: { transactionId: 1, requestPattern: topic, unique: true },
      };
      socket.send(JSON.stringify(subscrMsg));
    }
  }, [socket]);

  React.useEffect(() => {
    if (urlInvalid(url)) {
      setConnectionStatus({
        status: "warning",
        message: "Invalid URL!",
      });
      return;
    }
    console.log("url", url);
    console.log("Connecting to server.");
    setConnectionStatus({
      status: "warning",
      message: "Connecting to server …",
    });

    let ws;

    try {
      ws = new WebSocket(url);
      ws.onclose = (e) => {
        if (ws === socket) {
          setConnectionStatus({
            status: "error",
            message: "Disconnected from server.",
          });
        }
        setSocket(undefined);
      };
      ws.onmessage = async (e) => {
        const msg = JSON.parse(e.data);
        if (msg.pState) {
          if (msg.pState.keyValuePairs) {
            mergeKeyValuePairs(
              msg.pState.keyValuePairs,
              dataRef.current,
              separatorRef.current
            );
          }
          if (msg.pState.deleted) {
            removeKeyValuePairs(
              msg.pState.deleted,
              dataRef.current,
              separatorRef.current
            );
          }
          setData(new SortedMap(dataRef.current));
        }
        if (msg.handshake) {
          console.log("Handshake complete.");
          setSocket(ws);
          separatorRef.current = msg.handshake.separator;
          multiWildcardRef.current = msg.handshake.multiWildcard;
        }
        if (msg.err) {
          const meta = JSON.parse(msg.err.metadata);
          window.alert(meta);
        }
      };
      ws.onerror = (e) => {
        if (ws === socket) {
          setConnectionStatus({
            status: "error",
            message: "Error in websocket connection.",
          });
        }
      };
      ws.onopen = () => {
        console.log("Connected to server.");
        setConnectionStatus({
          status: "ok",
          message: "Connected to server.",
        });
        const handshake = {
          handshakeRequest: {
            supportedProtocolVersions: [{ major: 0, minor: 3 }],
            lastWill: [],
            graveGoods: [],
          },
        };
        ws.send(JSON.stringify(handshake));
      };
    } catch {
      console.log("Invalid URL", url);
      setConnectionStatus({
        status: "warning",
        message: "Invalid URL!",
      });
    }
    return () => {
      console.log("Disconnecting from server.");
      ws?.close();
    };
  }, [setConnectionStatus, url]);

  if (!url) {
    console.log("no url specified");
  }

  return (
    <Theme>
      <Stack padding={2} className="App">
        <TopicTree data={data} separator={separatorRef.current} />
        <BottomPanel />
      </Stack>
    </Theme>
  );

  function urlInvalid(url) {
    return url === undefined || url === null || url.trim() === "";
  }
}

function mergeKeyValuePairs(kvps, data, separator) {
  for (const { key, value } of kvps) {
    const segments = key.split(separator);
    mergeIn(data, segments.shift(), segments, value);
  }
}

function removeKeyValuePairs(kvps, data, separator) {
  for (const { key, value } of kvps) {
    const segments = key.split(separator);
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
