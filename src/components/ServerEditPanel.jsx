import {
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ServerList from "./ServerList";
import StatusIndicator from "./StatusIndicator";
import pkg from "../../package.json";
import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import { useServers } from "./ServerManagement";
import ConfigButton from "./ConfigButton";

export default function ServerEditPanel({ setEditing }) {
  const schemes = ["ws", "wss"];

  const [scheme, setScheme] = React.useState("ws");
  const [endpoints, setEndpoints] = React.useState([]);
  const [authToken, setAuthToken] = React.useState(null);

  const { addServer, serverAlreadyExists } = useServers();

  const server = {
    scheme,
    endpoints,
    authToken,
  };

  const alreadyExists = serverAlreadyExists(server);
  const error = alreadyExists ? "Server already exists" : "";

  const addNewServer = () => {
    addServer(server);
  };

  return (
    <Stack alignItems="flex-start">
      <ServerList sx={{ width: "100%" }} />
      <Divider flexItem orientation="horizontal" />
      <Grid container columnGap={2} paddingTop={2}>
        <Grid item container xs columnGap={2}>
          <Grid item>
            <Stack direction="row" spacing={2} alignItems="center">
              {/* <ThemeSwitch /> */}

              <Stack direction="row" spacing={1} alignItems="center">
                <ConfigButton />
                <Typography>
                  Wörterbuch&nbsp;Explorer&nbsp;v{pkg.version}
                </Typography>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-end"
              sx={{ height: "100%", width: "100%" }}
            >
              <StatusIndicator />
            </Stack>
          </Grid>
          <Grid item>
            <Stack
              direction="row"
              spacing={2}
              sx={{ height: "100%", width: "100%" }}
            >
              <Stack direction="row" spacing={0.5} sx={{ flexGrow: 1 }}>
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
                      {schemes.map((s, i) => (
                        <MenuItem key={i} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </Tooltip>
                </FormControl>
                <Stack justifyContent="center">
                  <Typography>://</Typography>
                </Stack>
                <Tooltip title={error}>
                  <TextField
                    size="small"
                    label="Endpoints"
                    placeholder="host[:port] [,host2[:port2], …]"
                    variant="outlined"
                    defaultValue={endpoints?.join(", ") || ""}
                    onChange={(e) =>
                      setEndpoints(
                        e.target.value?.split(",").map((it) => it.trim()) || []
                      )
                    }
                    error={alreadyExists}
                    sx={{ flexGrow: 1 }}
                  />
                </Tooltip>
              </Stack>

              <TextField
                size="small"
                label="Auth Token"
                variant="outlined"
                sx={{ flexGrow: 1 }}
                defaultValue={null}
                onChange={(e) => setAuthToken(e.target.value)}
              />
              <Button
                sx={{ height: "100%" }}
                variant="contained"
                onClick={addNewServer}
                disabled={alreadyExists}
              >
                Add
              </Button>
            </Stack>
          </Grid>
        </Grid>
        <Grid item md={2} lg={1}>
          <Button
            sx={{ width: "100%", height: "100%" }}
            variant="contained"
            selected
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => setEditing(false)}
          >
            Done
          </Button>
        </Grid>
      </Grid>
    </Stack>
  );
}
