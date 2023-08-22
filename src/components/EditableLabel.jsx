import { Stack, TextField, Tooltip, Typography } from "@mui/material";
import React from "react";
import { useSet } from "worterbuch-react";

export default function EditableLabel({ id, value, wbKey }) {
  const [editing, setEditing] = React.useState(false);
  const set = useSet(wbKey);

  const maxLen = 256;
  const shortValue =
    value.length <= maxLen ? value : value.substring(0, maxLen - 2) + " …";

  const label = (
    <Tooltip
      title={
        <Stack sx={{ maxHeight: "75vh", overflow: "auto" }}>{value}</Stack>
      }
      enterDelay={750}
    >
      <Typography
        display="inline-block"
        style={{ fontWeight: 600, marginInlineStart: 4 }}
        onDoubleClick={() => setEditing(true)}
      >
        {shortValue}
      </Typography>
    </Tooltip>
  );

  const keyDown = (e) => {
    if (e.key === "Enter") {
      set(JSON.parse(e.target.value));
      setEditing(false);
    }
  };

  const editor = (
    <TextField
      defaultValue={value}
      onKeyDown={keyDown}
      onBlur={() => setEditing(false)}
      size="small"
      autoFocus
    />
  );
  return (
    <Stack direction="row" alignItems="center">
      <Typography display="inline-block" whiteSpace="nowrap">
        {id} ={" "}
      </Typography>
      {editing ? editor : label}
    </Stack>
  );
}
