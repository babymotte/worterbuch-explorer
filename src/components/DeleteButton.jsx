import { IconButton, Tooltip } from "@mui/material";
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
