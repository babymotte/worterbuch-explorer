import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import WarningIcon from "@mui/icons-material/Warning";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Typography from "@mui/material/Typography";

export default function DeleteButton({ ...props }) {
  const [hovering, setHovering] = React.useState(false);
  const [contextMenu, setContextMenu] = React.useState(null);
  const closeMenu = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setContextMenu(null);
  };

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

  return (
    <>
      <Tooltip
        title="Delete"
        sx={{ opacity: hovering ? 1.0 : 0.2 }}
        onClick={handleContextMenu}
      >
        <IconButton
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          size="small"
          disabled={props.disabled}
        >
          <DeleteIcon />
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
        <MenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <ListItemIcon>
            <WarningIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Are you sure?</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            props.delete();
            closeMenu(e);
          }}
        >
          <ListItemIcon>
            <DeleteForeverIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>
            <Typography color="error">Delete</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
