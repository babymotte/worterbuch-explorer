import * as React from "react";
import TopicTree from "./TopicTree";
import SortedMap from "collections/sorted-map";
import ServerSelection from "./ServerSelection";
import { Stack, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";

export default function App() {
  const [wbAddress, setWbAddress] = React.useState();

  let url = wbAddress;

  const dataRef = React.useRef(new SortedMap());
  const [data, setData] = React.useState(new SortedMap());
  const [socket, setSocket] = React.useState();
  const [error, setError] = React.useState();
  const multiWildcardRef = React.useRef();
  const separatorRef = React.useRef();

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
    if (url === undefined || url === null || url.trim() === "") {
      return;
    }
    console.log("url", url);
    console.log("Connecting to server.");

    let socket;

    try {
      socket = new WebSocket(url);
      setError(undefined);
      socket.onclose = (e) => {
        setSocket(undefined);
      };
      socket.onmessage = async (e) => {
        const msg = JSON.parse(e.data);
        if (msg.pState) {
          mergeKeyValuePairs(
            msg.pState.keyValuePairs,
            dataRef.current,
            separatorRef.current
          );
          setData(new SortedMap(dataRef.current));
        }
        if (msg.handshake) {
          console.log("Handshake complete.");
          setSocket(socket);
          separatorRef.current = msg.handshake.separator;
          multiWildcardRef.current = msg.handshake.multiWildcard;
        }
        if (msg.err) {
          const meta = JSON.parse(msg.err.metadata);
          window.alert(meta);
        }
      };
      socket.onopen = () => {
        console.log("Connected to server.");
        const handshake = {
          handshakeRequest: {
            supportedProtocolVersions: [{ major: 0, minor: 3 }],
            lastWill: [],
            graveGoods: [],
          },
        };
        socket.send(JSON.stringify(handshake));
      };
    } catch {
      setError("Invalid URL!");
    }
    return () => {
      console.log("Disconnecting from server.");
      socket?.close();
    };
  }, [url]);

  if (!url) {
    console.log("no url specified");
  }

  return (
    <div className="App">
      <ServerSelection switchToServer={setWbAddress} />
      {error ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <ErrorIcon color="error" />
          <Typography>{error}</Typography>
        </Stack>
      ) : url ? (
        socket ? (
          <TopicTree data={data} separator={separatorRef.current} />
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            <ErrorIcon color="error" />
            <Typography>Could not connect to server!</Typography>
          </Stack>
        )
      ) : (
        <Stack direction="row" spacing={1} alignItems="center">
          <WarningIcon color="warning" />
          <Typography>No server selected.</Typography>
        </Stack>
      )}
    </div>
  );
}

function mergeKeyValuePairs(kvps, data, separator) {
  for (const { key, value } of kvps) {
    const segments = key.split(separator);
    mergeIn(data, segments.shift(), segments, value);
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
