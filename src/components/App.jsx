import * as React from "react";
import TopicTree from "./TopicTree";
import BottomPanel from "./BottomPanel";
import { useServers } from "./ServerManagement";
import Theme from "./Theme";
import { Stack } from "@mui/material";
import SetPanel from "./SetPanel";
import { Worterbuch } from "worterbuch-react";

// const STATES = {
//   SWITCHING_SERVER: "SWITCHING_SERVER",
//   NO_SERVER_SELECTED: "NO_SERVER_SELECTED",
//   CONNECTING: "CONNECTING",
//   ERROR: "ERROR",
//   CONNECTED: "CONNECTED",
//   HANDSHAKE_COMPLETE: "HANDSHAKE_COMPLETE",
//   DISCONNECTED: "DISCONNECTED",
//   RECONNECTING: "RECONNECTING",
// };

export default function App() {
  const { selectedServer, knownServers } = useServers();
  const { scheme, host, port } = knownServers[selectedServer] || {
    scheme: "ws",
    host: "localhost",
    port: 8080,
  };
  const config = {
    backendScheme: scheme,
    backendHost: host,
    backendPort: port,
    backendPath: "/ws",
  };

  return (
    <Theme>
      <Worterbuch automaticReconnect config={config}>
        <Stack sx={{ width: "100vw", height: "100vh" }}>
          <Stack flexGrow={1} overflow="auto">
            <Stack padding={2}>
              <TopicTree />
            </Stack>
          </Stack>
          <SetPanel />
          <BottomPanel />
        </Stack>
      </Worterbuch>
    </Theme>
  );
}
