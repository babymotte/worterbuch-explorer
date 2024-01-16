import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import EditIcon from "@mui/icons-material/Edit";

export const EditContext = React.createContext();

export default function EditButton({ ...props }) {
  const [hovering, setHovering] = React.useState(false);
  const { setKey, setValue, setJson } = React.useContext(EditContext);

  return (
    <>
      <Tooltip
        title="Edit"
        sx={{ opacity: hovering ? 1.0 : 0.2 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setJson(true);
          setKey(props.wbkey);
          setValue(props.wbvalue ? JSON.stringify(props.wbvalue) : "");
        }}
      >
        <IconButton
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          size="small"
          {...props}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}
