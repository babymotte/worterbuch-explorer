import { Button, Stack, Typography } from "@mui/material";
import ServerSelection from "./ServerSelection";
import StatusIndicator from "./StatusIndicator";
import EditIcon from "@mui/icons-material/Edit";
import pkg from "../../package.json";
import ThemeSwitch from "./ThemeSwitch";

export default function ServerStatusPanel({ setEditing }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" spacing={2} alignItems="center">
        <ThemeSwitch />
        <Typography>Wörterbuch&nbsp;Explorer&nbsp;v{pkg.version}</Typography>
      </Stack>
      <Stack direction="row" spacing={2}>
        <StatusIndicator />
        <ServerSelection />
        <Button
          variant="outlined"
          selected
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => setEditing(true)}
        >
          Edit
        </Button>
      </Stack>
    </Stack>
  );
}
