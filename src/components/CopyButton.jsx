import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

import KeyIcon from "@mui/icons-material/Key";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import DataObjectIcon from "@mui/icons-material/DataObject";
import LinkIcon from "@mui/icons-material/Link";
import { useServers } from "./ServerManagement";
import { useConnectedAddress } from "./lastConnectedAddresses";

export default function CopyButton({ ...props }) {
  const [hovering, setHovering] = React.useState(false);
  const [contextMenu, setContextMenu] = React.useState(null);

  const [successOpen, setSuccessOpen] = React.useState(false);
  const [successText, setSuccessText] = React.useState("");
  const [errorOpen, setErrorOpen] = React.useState(false);

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null
    );
  };

  const closeMenu = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setContextMenu(null);
  };

  const closeSuccess = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessOpen(false);
  };

  const closeError = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setErrorOpen(false);
  };

  const copyKey = (e) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(props.wbkey);
      setSuccessText("Copied key to clipboard.");
      setSuccessOpen(true);
    } else {
      setErrorOpen(true);
    }
    closeMenu(e);
  };

  const copyValue = (e) => {
    if (navigator?.clipboard?.writeText) {
      if (typeof props.wbvalue === "string") {
        navigator.clipboard.writeText(props.wbvalue);
      } else {
        navigator.clipboard.writeText(JSON.stringify(props.wbvalue));
      }
      setSuccessText("Copied value to clipboard.");
      setSuccessOpen(true);
    } else {
      setErrorOpen(true);
    }
    closeMenu(e);
  };

  const copyJson = (e) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(
        JSON.stringify({ key: props.wbkey, value: props.wbvalue })
      );
      setSuccessText("Copied JSON to clipboard.");
      setSuccessOpen(true);
    } else {
      setErrorOpen(true);
    }
    closeMenu(e);
  };

  let server = useConnectedAddress();

  const copyLink = (e) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(
        server
          .replace("ws", "http")
          .replace("/ws", `/api/v1/get/${props.wbkey}`)
      );
      setSuccessText("Copied link to clipboard.");
      setSuccessOpen(true);
    } else {
      setErrorOpen(true);
    }
    closeMenu(e);
  };

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  return (
    <>
      <Tooltip
        title="Copy"
        sx={{ opacity: hovering ? 1.0 : 0.2 }}
        onClick={handleContextMenu}
      >
        <IconButton
          size="small"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <ContentCopyIcon />
        </IconButton>
      </Tooltip>
      <Menu
        open={contextMenu !== null}
        onClose={closeMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={copyKey}>
          <ListItemIcon>
            <KeyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Key</ListItemText>
        </MenuItem>
        <MenuItem onClick={copyValue}>
          <ListItemIcon>
            <FileCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Value</ListItemText>
        </MenuItem>
        <MenuItem onClick={copyJson}>
          <ListItemIcon>
            <DataObjectIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy JSON</ListItemText>
        </MenuItem>
        <MenuItem onClick={copyLink}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
      </Menu>
      <Snackbar
        open={successOpen}
        autoHideDuration={2000}
        onClose={closeSuccess}
      >
        <Alert onClose={closeSuccess} severity="success" sx={{ width: "100%" }}>
          {successText}
        </Alert>
      </Snackbar>
      <Snackbar open={errorOpen} autoHideDuration={5000} onClose={closeError}>
        <Alert onClose={closeError} severity="error" sx={{ width: "100%" }}>
          Clipboard is not supported by this browser!
        </Alert>
      </Snackbar>
    </>
  );
}
