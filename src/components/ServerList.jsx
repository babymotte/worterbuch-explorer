import * as React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ServerIcon from "@mui/icons-material/Public";
import { Stack } from "@mui/material";
import { toUrl, useServers } from "./ServerManagement";
import DeleteButton from "./DeleteButton";

export default function ServerList({ sx }) {
  const { selectedServer, knownServers, selectServer, removeServer } =
    useServers();

  const listItems = knownServers.map((s, i) => {
    const [url] = toUrl(s);

    return (
      <ListItemButton
        selected={selectedServer === i}
        onClick={() => selectServer(i)}
        key={url}
      >
        <ListItemIcon>
          <ServerIcon />
        </ListItemIcon>
        <ListItemText primary={url} />
        <DeleteButton
          onClick={() => {
            console.log(i, removeServer);
            removeServer(i);
          }}
        />
      </ListItemButton>
    );
  });

  return (
    <Stack sx={{ ...sx, maxHeight: "40vh", overflow: "auto" }}>
      <List>{listItems}</List>
    </Stack>
  );
}
