import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import TextField from "@mui/material/TextField";
import EditIcon from "@mui/icons-material/Edit";
import { useServers } from "./ServerManagement";

export default function ServerEditMask({
  switchToServer,
  urlInvalid,
  setEditing,
}) {
  const schemes = ["ws", "wss"];

  const [scheme, setScheme] = React.useState("ws");
  const [host, setHost] = React.useState("");
  const [port, setPort] = React.useState(80);

  const { addServer } = useServers();

  const addNewServer = () => {
    const server = {
      scheme,
      host,
      port,
    };
    addServer(server);
  };

  return (
    <Stack direction="row" spacing={3} alignItems="stretch">
      <Stack direction="row" spacing={1}>
        <FormControl>
          <InputLabel id="scheme-select-label">Scheme</InputLabel>
          <Select
            size="small"
            labelId="scheme-select-label"
            value={scheme}
            label="Scheme"
            onChange={(e) => {
              setScheme(e.target.value);
            }}
            sx={{ width: "6em" }}
          >
            <MenuItem value={schemes[0]}>{schemes[0]}</MenuItem>
            <MenuItem value={schemes[1]}>{schemes[1]}</MenuItem>
          </Select>
        </FormControl>
        <Stack justifyContent="center">
          <Typography>://</Typography>
        </Stack>
        <TextField
          size="small"
          label="Host"
          variant="outlined"
          defaultValue={host}
          onChange={(e) => setHost(e.target.value)}
        />
        <Stack justifyContent="center">
          <Typography>:</Typography>
        </Stack>
        <TextField
          size="small"
          label="Port"
          variant="outlined"
          sx={{ width: "6em" }}
          defaultValue={port}
          onChange={(e) => setPort(parseInt(e.target.value))}
        />
        <Stack justifyContent="center">
          <Typography>/ws</Typography>
        </Stack>
      </Stack>
      <Button variant="contained" onClick={addNewServer}>
        Add
      </Button>
      <Button
        variant="outlined"
        selected
        color="primary"
        startIcon={<EditIcon />}
        onClick={() => setEditing(false)}
      >
        Done
      </Button>
    </Stack>
  );
}
