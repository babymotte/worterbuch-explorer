import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import React from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";

export default function SubscribeSaveButton({
  onSubscribe,
  onSave,
  subscribed,
}) {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const subscribeLabel = subscribed ? "Unsubscribe" : "Subscribe";
  const saveLabel = "Save";

  return (
    <>
      <ButtonGroup variant="contained" ref={anchorRef}>
        <Button
          onClick={() => onSubscribe()}
          variant={subscribed ? "outlined" : "contained"}
        >
          {subscribeLabel}
        </Button>
        <Button
          size="small"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={() => setOpen((prevOpen) => !prevOpen)}
        >
          <KeyboardArrowDownIcon />
        </Button>
      </ButtonGroup>
      <Menu
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
      >
        <MenuItem
          onClick={() => {
            onSave();
            setOpen(false);
          }}
        >
          <ListItemText>{saveLabel}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
