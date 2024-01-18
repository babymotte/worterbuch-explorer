import { Button, Stack } from "@mui/material";
import ServerSelection from "./ServerSelection";
import StatusIndicator from "./StatusIndicator";
import EditIcon from "@mui/icons-material/Edit";

export default function ServerStatusPanel({ setEditing }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <StatusIndicator />
      <Stack direction="row" spacing={2}>
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
