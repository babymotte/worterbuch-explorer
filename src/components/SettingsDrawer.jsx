/* eslint-disable react/prop-types */
import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Switch from "@mui/material/Switch";
import { useDarkMode } from "./Theme";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import { styled } from "@mui/material/styles";
import axios from "axios";
import CookieIcon from "@mui/icons-material/Cookie";
import MemoryIcon from "@mui/icons-material/Memory";

const DrawerContext = React.createContext();

export function useDrawer() {
  return React.useContext(DrawerContext);
}

export default function SettingsDrawer({ children, wbAddress }) {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const { darkMode, setDarkMode } = useDarkMode();

  // const { keepaliveTimeout, setKeepaliveTimeout } = useServers();

  const { authtoken, address } = wbAddress;

  let host = null;
  let port = null;

  if (address) {
    const regex = /(.+):\/\/(.+):([0-9]+)\/ws/gm;

    for (const match of address.matchAll(regex)) {
      host = match[2];
      port = match[3];
    }
  }

  const DrawerList = (
    <Box sx={{ width: 350 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        <ListItem>
          <ListItemIcon>
            {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
          </ListItemIcon>
          <ListItemText>Dark Mode</ListItemText>
          <Switch
            defaultChecked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />
        </ListItem>
        {host != null && port != null ? (
          <ImpExpDump host={host} port={port} authtoken={authtoken} />
        ) : (
          <ImpExpDumpDisabled />
        )}
      </List>
    </Box>
  );

  return (
    <DrawerContext.Provider value={[setOpen, open]}>
      {children}
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </DrawerContext.Provider>
  );
}

function ImpExpDump({ host, port, authtoken }) {
  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  const [status, setStatus] = React.useState();
  const [error, setError] = React.useState();

  const upload = (event) => {
    handleFileUpload(event, host, port, authtoken)
      .then(setStatus)
      .catch(setError);
  };

  return (
    <>
      <Divider component="li" />

      <ListItem>
        <ListItemIcon>
          <UploadIcon />
        </ListItemIcon>
        <ListItemText>Import</ListItemText>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
        >
          Upload files
          <VisuallyHiddenInput
            type="file"
            // accept=".gz"
            onChange={(event) => console.log(event.target.files)}
            multiple
          />
        </Button>
      </ListItem>

      <ListItem>
        <ListItemIcon>
          <DownloadIcon />
        </ListItemIcon>
        <ListItemText>Export</ListItemText>
        <Button
          href={`http://${host}:${port}/api/v1/export`}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          color="primary"
          onClick={(e) => e.stopPropagation()}
        >
          Download
        </Button>
      </ListItem>

      <Divider component="li" />

      <ListItem>
        <ListItemIcon>
          <MemoryIcon />
        </ListItemIcon>
        <ListItemText>Memory Profile</ListItemText>
        <Button
          href={`http://${host}:${port}/api/v1/debug/flamegraph/live`}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          color="primary"
          onClick={(e) => e.stopPropagation()}
        >
          View
        </Button>
      </ListItem>

      <ListItem>
        <ListItemIcon>
          <DownloadIcon />
        </ListItemIcon>
        <ListItemText>Memory Profile</ListItemText>
        <Button
          href={`http://${host}:${port}/api/v1/debug/heap/live`}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          color="primary"
          onClick={(e) => e.stopPropagation()}
        >
          Download
        </Button>
      </ListItem>

      <Divider component="li" />

      <ListItem>
        <ListItemIcon>
          <CookieIcon />
        </ListItemIcon>
        <ListItemText>JWT Cookie</ListItemText>
        <JwtCookieButton host={host} port={port} authtoken={authtoken} />
      </ListItem>
    </>
  );
}

function JwtCookieButton({ host, port, authtoken }) {
  // TODO change to CLEAR when cookie is already set

  const [status, setStatus] = React.useState();
  const [error, setError] = React.useState();

  const setCookie = () => {
    axios
      .post(`http://${host}:${port}/api/v1/login`, null, {
        headers: { Authorization: `Bearer ${authtoken}` },
        withCredentials: true,
      })
      .then(setStatus)
      .catch(setError);
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={(e) => {
        setCookie();
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {status ? "Clear" : error ? "Error" : "Set"}
    </Button>
  );
}

function ImpExpDumpDisabled() {
  return (
    <>
      <Divider component="li" />

      <ListItem disabled>
        <ListItemIcon>
          <DownloadIcon />
        </ListItemIcon>
        <ListItemText>Export</ListItemText>
        <Button disabled variant="contained" color="primary">
          Download
        </Button>
      </ListItem>

      <ListItem disabled>
        <ListItemIcon>
          <UploadIcon />
        </ListItemIcon>
        <ListItemText>Import</ListItemText>
        <Button disabled variant="contained" color="primary">
          Upload
        </Button>
      </ListItem>

      <Divider component="li" />

      <ListItem disabled>
        <ListItemIcon>
          <DownloadIcon />
        </ListItemIcon>
        <ListItemText>Heap Dump</ListItemText>
        <Button disabled variant="contained" color="primary">
          Download
        </Button>
      </ListItem>
    </>
  );
}

async function handleFileUpload(files, host, port, authtoken) {
  const file = files[0];

  console.log("file", file);

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  return new Promise((res, rej) => {
    axios
      .post(`http://${host}:${port}/api/v1/import`, bytes, {
        headers: { Authorization: `Bearer ${authtoken}` },
      })
      .then(res)
      .catch(rej);
  });
}
