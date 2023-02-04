import { Button, Stack } from "@mui/material";
import React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

function persistServers(servers) {
  if (window.localStorage) {
    window.localStorage.setItem(
      "worterbuch.explorer.servers",
      JSON.stringify(servers)
    );
  }
}

function loadPersistedServers() {
  if (window.localStorage) {
    const json = window.localStorage.getItem("worterbuch.explorer.servers");
    if (json) {
      const servers = JSON.parse(json);
      return servers;
    }
  }
  return [];
}

function persistSelectedServer(server) {
  if (window.localStorage) {
    window.localStorage.setItem("worterbuch.explorer.servers.current", server);
  }
}

function loadPersistedSelectedServer() {
  if (window.localStorage) {
    return window.localStorage.getItem("worterbuch.explorer.servers.current");
  }
}

export default function ServerSelection({ switchToServer, urlInvalid }) {
  const [knownServers, setKnownServers] = React.useState(
    loadPersistedServers()
  );

  const [selectedServer, setSelectedServer] = React.useState(
    loadPersistedSelectedServer()
  );

  React.useEffect(() => {
    switchToServer(selectedServer);
  }, [selectedServer, switchToServer]);

  const updateKnownServers = (knownServers) => {
    setKnownServers(knownServers);
    persistServers(knownServers);
  };

  const addNewServer = () => {
    const newKnownServers = [...knownServers, selectedServer];
    updateKnownServers(newKnownServers);
  };

  const deleteServer = () => {
    const newKnownServers = [...knownServers];
    const selectedIndex = knownServers.indexOf(selectedServer);
    newKnownServers.splice(selectedIndex, 1);
    updateKnownServers(newKnownServers);
  };

  const handleChange = (event, newValue) => {
    setSelectedServer(newValue);
    persistSelectedServer(newValue);
  };

  const serverIsKnown = knownServers.includes(selectedServer);

  return (
    <Stack direction="row" spacing={1} padding={2}>
      <Autocomplete
        freeSolo
        disablePortal
        autoComplete
        id="combo-box-servers"
        options={knownServers}
        sx={{ width: 300 }}
        onChange={handleChange}
        value={selectedServer}
        renderInput={(params) => <TextField {...params} label="Server" />}
      />
      <Button
        disabled={urlInvalid}
        variant="contained"
        color={serverIsKnown ? "error" : "primary"}
        onClick={() => {
          serverIsKnown ? deleteServer() : addNewServer();
        }}
      >
        {serverIsKnown ? "Forget" : "Remember"}
      </Button>
    </Stack>
  );
}
