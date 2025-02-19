import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import MenuIcon from "@mui/icons-material/Menu";
import React from "react";
import { useDrawer } from "./SettingsDrawer";

export default function ConfigButton() {
  const [setSettingsOpen] = useDrawer();

  const openSettings = () => {
    setSettingsOpen(true);
  };

  return (
    <Tooltip title="Settings" onClick={openSettings}>
      <IconButton color="inherit">
        <MenuIcon />
      </IconButton>
    </Tooltip>
  );
}
