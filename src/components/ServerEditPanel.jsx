import { Divider, Stack, Typography } from "@mui/material";
import ServerEditMask from "./ServerEditMask";
import ServerList from "./ServerList";
import StatusIndicator from "./StatusIndicator";
import pkg from "../../package.json";
import ThemeSwitch from "./ThemeSwitch";

export default function ServerEditPanel({ setEditing }) {
  return (
    <Stack alignItems="flex-start">
      <Stack
        sx={{ width: "100%" }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        paddingBottom={2}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <ThemeSwitch />
          <Typography>Wörterbuch&nbsp;Explorer&nbsp;v{pkg.version}</Typography>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <StatusIndicator />
          <ServerEditMask setEditing={setEditing} />
        </Stack>
      </Stack>
      <Divider flexItem orientation="horizontal" />
      <ServerList sx={{ width: "100%" }} />
    </Stack>
  );
}
