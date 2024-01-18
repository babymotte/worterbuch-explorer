import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
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
  const [authToken, setAuthToken] = React.useState(null);

  const { addServer, serverAlreadyExists } = useServers();

  const server = {
    scheme,
    host,
    port,
    authToken,
  };

  const alreadyExists = serverAlreadyExists(server);
  const error = alreadyExists ? "Server already exists" : "";

  const addNewServer = () => {
    addServer(server);
  };

  return (
    <Stack direction="row" spacing={3} alignItems="stretch">
      <Stack direction="row" spacing={1}>
        <FormControl>
          <InputLabel id="scheme-select-label">Scheme</InputLabel>
          <Tooltip title={error}>
            <Select
              size="small"
              labelId="scheme-select-label"
              value={scheme}
              label="Scheme"
              onChange={(e) => {
                setScheme(e.target.value);
              }}
              sx={{ width: "6em" }}
              error={alreadyExists}
            >
              <MenuItem value={schemes[0]}>{schemes[0]}</MenuItem>
              <MenuItem value={schemes[1]}>{schemes[1]}</MenuItem>
            </Select>
          </Tooltip>
        </FormControl>
        <Stack justifyContent="center">
          <Typography>://</Typography>
        </Stack>
        <Tooltip title={error}>
          <TextField
            size="small"
            label="Host"
            variant="outlined"
            defaultValue={host}
            onChange={(e) => setHost(e.target.value)}
            error={alreadyExists}
          />
        </Tooltip>
        <Stack justifyContent="center">
          <Typography>:</Typography>
        </Stack>
        <Tooltip title={error}>
          <TextField
            size="small"
            label="Port"
            variant="outlined"
            sx={{ width: "6em" }}
            defaultValue={port}
            onChange={(e) => setPort(parseInt(e.target.value))}
            error={alreadyExists}
          />
        </Tooltip>
        <Stack justifyContent="center">
          <Typography>/ws</Typography>
        </Stack>
        <Stack justifyContent="center" />

        <TextField
          size="small"
          label="Auth Token"
          variant="outlined"
          sx={{ width: "16em" }}
          defaultValue={null}
          onChange={(e) => setAuthToken(e.target.value)}
        />
      </Stack>
      <Button
        variant="contained"
        onClick={addNewServer}
        disabled={alreadyExists}
      >
        Add
      </Button>
      <Button
        variant="contained"
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
