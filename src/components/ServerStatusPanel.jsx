import { Button, Stack } from "@mui/material";
import ServerSelection from "./ServerSelection";
import StatusIndicator from "./StatusIndicator";
import EditIcon from "@mui/icons-material/Edit";

export default function ServerStatusPanel({ setEditing }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Stack direction="row" spacing={2}>
        <ServerSelection />
        <Button
          variant="contained"
          selected
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => setEditing(true)}
        >
          Edit
        </Button>
      </Stack>
      <StatusIndicator />
    </Stack>
  );
}
