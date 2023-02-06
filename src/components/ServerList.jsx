import * as React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ServerIcon from "@mui/icons-material/Public";
import { IconButton, Stack, Tooltip } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import { toUrl, useServers } from "./ServerManagement";

export default function ServerList({ sx }) {
  const { selectedServer, knownServers, selectServer, removeServer } =
    useServers();

  const listItems = knownServers.map((s, i) => {
    const url = toUrl(s);

    const RemoveButton = ({ onClick }) => {
      const [hovering, setHovering] = React.useState(false);
      return (
        <Tooltip title="Remove" sx={{ opacity: hovering ? 1.0 : 0.2 }}>
          <IconButton
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={onClick}
          >
            <RemoveIcon />
          </IconButton>
        </Tooltip>
      );
    };

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
        <RemoveButton
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
