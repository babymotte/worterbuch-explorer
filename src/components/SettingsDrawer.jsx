import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Switch from "@mui/material/Switch";
import { useDarkMode } from "./Theme";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useServers } from "./ServerManagement";

const DrawerContext = React.createContext();

export function useDrawer() {
  return React.useContext(DrawerContext);
}

export default function SettingsDrawer({ children }) {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const { darkMode, setDarkMode } = useDarkMode();

  const { keepaliveTimeout, setKeepaliveTimeout } = useServers();

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
      </List>
      <Divider />
      <List>
        <ListItem>
          <ListItemIcon>
            <AccessTimeIcon />
          </ListItemIcon>
          <ListItemText>Keepalive Timeout:</ListItemText>
          <Select
            size="small"
            defaultValue={keepaliveTimeout}
            onChange={(e) => setKeepaliveTimeout(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem value={5}>5 s</MenuItem>
            <MenuItem value={10}>10 s</MenuItem>
            <MenuItem value={30}>30 s</MenuItem>
            <MenuItem value={999999}>∞</MenuItem>
          </Select>
        </ListItem>
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
