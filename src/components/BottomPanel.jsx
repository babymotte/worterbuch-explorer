import { Paper, Stack } from "@mui/material";
import React from "react";
import ServerEditPanel from "./ServerEditPanel";
import ServerStatusPanel from "./ServerStatusPanel";

export default function BottomPanel() {
  const [editing, setEditing] = React.useState(false);

  return (
    <Paper>
      <Stack padding={2}>
        {editing ? (
          <ServerEditPanel setEditing={setEditing} />
        ) : (
          <ServerStatusPanel setEditing={setEditing} />
        )}
      </Stack>
    </Paper>
  );
}
