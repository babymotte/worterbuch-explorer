import { Stack } from "@mui/material";
import ServerEditMask from "./ServerEditMask";
import ServerList from "./ServerList";
import StatusIndicator from "./StatusIndicator";

export default function ServerEditPanel({ setEditing }) {
  return (
    <Stack alignItems="flex-start" spacing={2}>
      <Stack
        sx={{ width: "100%" }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <StatusIndicator />
        <ServerEditMask setEditing={setEditing} />
      </Stack>
      <ServerList sx={{ width: "100%" }} />
    </Stack>
  );
}
