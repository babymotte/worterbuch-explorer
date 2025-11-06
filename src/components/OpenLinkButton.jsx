import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import LinkIcon from "@mui/icons-material/Link";
import { useConnectedAddress } from "./lastConnectedAddresses";

export function OpenLinkButton({ path, wbvalue, onClick, ...props }) {
  const [hovering, setHovering] = React.useState(false);

  let server = useConnectedAddress();

  const handleClick = () => {
    const url = server
      .replace("ws", "http")
      .replace("/ws", `/api/v1/get/${path}`);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Tooltip
      title="Open GET Api Link"
      sx={{ opacity: hovering ? 1.0 : 0.2 }}
      onClick={
        onClick ||
        ((e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClick();
        })
      }
    >
      <IconButton
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        size="small"
        disabled={wbvalue === undefined}
        {...props}
      >
        <LinkIcon />
      </IconButton>
    </Tooltip>
  );
}
