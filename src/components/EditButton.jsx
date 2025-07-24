import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import EditIcon from "@mui/icons-material/Edit";

export const EditContext = React.createContext();

export default function EditButton({ wbkey, wbvalue, onClick, ...props }) {
  const [hovering, setHovering] = React.useState(false);
  const { setKey, setValue, setJson } = React.useContext(EditContext);

  return (
    <>
      <Tooltip
        title="Edit"
        sx={{ opacity: hovering ? 1.0 : 0.2 }}
        onClick={
          onClick ||
          ((e) => {
            e.preventDefault();
            e.stopPropagation();
            setJson(true);
            setKey(wbkey);
            setValue(
              wbvalue !== undefined ? JSON.stringify(wbvalue, null, 2) : ""
            );
          })
        }
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
