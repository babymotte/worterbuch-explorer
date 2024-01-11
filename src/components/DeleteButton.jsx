import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";

export default function DeleteButton({ ...props }) {
  const [hovering, setHovering] = React.useState(false);
  return (
    <Tooltip title="Delete" sx={{ opacity: hovering ? 1.0 : 0.2 }}>
      <IconButton
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        size="small"
        {...props}
      >
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  );
}
