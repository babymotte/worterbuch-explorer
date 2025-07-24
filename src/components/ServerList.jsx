import * as React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ServerIcon from "@mui/icons-material/Public";
import { Stack } from "@mui/material";
import { toUrl, useServers } from "./ServerManagement";
import DeleteButton from "./DeleteButton";
import EditButton from "./EditButton";

export default function ServerList({ sx, fillEditMask }) {
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
        <EditButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            fillEditMask(s);
          }}
        />
        <DeleteButton delete={() => removeServer(i)} />
      </ListItemButton>
    );
  });

  return (
    <Stack sx={{ ...sx, maxHeight: "40vh", overflow: "auto" }}>
      <List>{listItems}</List>
    </Stack>
  );
}
