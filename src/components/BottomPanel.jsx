import { Paper, Stack } from "@mui/material";
import React from "react";
import ServerEditPanel from "./ServerEditPanel";
import ServerStatusPanel from "./ServerStatusPanel";
import SubscriptionBar from "./SubscriptionBar";

export default function BottomPanel({ rootKeyRef, options, refreshOptions }) {
  const [editing, setEditing] = React.useState(false);

  return (
    <Paper>
      <Stack container padding={2} spacing={2}>
        <SubscriptionBar
          rootKeyRef={rootKeyRef}
          options={options}
          refreshOptions={refreshOptions}
        />
        {editing ? (
          <ServerEditPanel setEditing={setEditing} />
        ) : (
          <ServerStatusPanel setEditing={setEditing} />
        )}
      </Stack>
    </Paper>
  );
}
