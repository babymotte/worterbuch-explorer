import { Paper, Stack } from "@mui/material";
import React from "react";
import ServerEditPanel from "./ServerEditPanel";
import ServerStatusPanel from "./ServerStatusPanel";
import SubscriptionBar from "./SubscriptionBar";

export default function BottomPanel() {
  const [editing, setEditing] = React.useState(false);
  return (
    <Paper>
      <Stack padding={2} spacing={2}>
        <SubscriptionBar />
        {editing ? (
          <ServerEditPanel setEditing={setEditing} />
        ) : (
          <ServerStatusPanel setEditing={setEditing} />
        )}
      </Stack>
    </Paper>
  );
}
