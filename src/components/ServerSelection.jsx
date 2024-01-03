import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React from "react";
import { toUrl, useServers } from "./ServerManagement";

export default function ServerSelection({ switchToServer, urlInvalid }) {
  const { selectedServer, knownServers, selectServer } = useServers();

  const items = knownServers.map((s, i) => {
    const [url] = toUrl(s);
    return (
      <MenuItem key={url} value={i}>
        {url}
      </MenuItem>
    );
  });

  return (
    <FormControl>
      <InputLabel id="server-select-label">Server</InputLabel>
      <Select
        size="small"
        labelId="server-select-label"
        label="Server"
        value={selectedServer}
        onChange={(e) => selectServer(e.target.value)}
        sx={{ minWidth: "8em" }}
      >
        {items}
      </Select>
    </FormControl>
  );
}
