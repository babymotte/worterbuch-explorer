import * as React from "react";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TreeItem from "@mui/lab/TreeItem";
import { Stack, TextField, Tooltip, Typography } from "@mui/material";
import DeleteButton from "./DeleteButton";
import CopyButton from "./CopyButton";

export default function TopicTree({ data, set, pdelete }) {
  const treeItems = toTreeItems(data, set, pdelete);

  return (
    <TreeView
      aria-label="file system navigator"
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      sx={{
        flexGrow: 1,
        maxWidth: "100vw",
      }}
    >
      {treeItems}
    </TreeView>
  );
}

function toTreeItems(data, set, pdelete, path) {
  let items = [];

  data.forEach((child, id) => {
    const item = toTreeItem(
      path ? `${path}/${id}` : id,
      child,
      id,
      set,
      pdelete
    );
    items.push(item);
  });

  return <>{items}</>;
}

function toTreeItem(path, item, id, set, pdelete) {
  if (item.value === undefined && item.children && item.children.size === 1) {
    const [childId, child] = item.children.entries().next().value;
    return toTreeItem(
      `${path}/${childId}`,
      child,
      `${id}/${childId}`,
      set,
      pdelete
    );
  } else {
    const label = (
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {item.value !== undefined ? (
          <EditableLabel
            id={id}
            value={JSON.stringify(item.value)}
            wbKey={path}
            set={set}
          />
        ) : (
          <Typography display="inline-block">{id}</Typography>
        )}
        <Stack direction="row">
          <CopyButton wbkey={path} wbvalue={item.value} />
          <DeleteButton
            delete={() => {
              const pattern = item.value === undefined ? `${path}/#` : path;
              pdelete(pattern);
            }}
            disabled={path.startsWith("$SYS")}
          />
        </Stack>
      </Stack>
    );
    return (
      <TreeItem key={path} nodeId={path} label={label}>
        {item.children ? toTreeItems(item.children, set, pdelete, path) : null}
      </TreeItem>
    );
  }
}

function EditableLabel({ id, value, wbKey, set }) {
  const [editing, setEditing] = React.useState(false);

  const maxLen = 256;
  const shortValue =
    value.length <= maxLen ? value : value.substring(0, maxLen - 2) + " …";

  const label = (
    <Tooltip
      title={
        <Stack sx={{ maxHeight: "75vh", overflow: "auto" }}>{value}</Stack>
      }
      enterDelay={750}
    >
      <Typography
        display="inline-block"
        style={{ fontWeight: 600, marginInlineStart: 4 }}
        onDoubleClick={() => setEditing(true)}
      >
        {shortValue}
      </Typography>
    </Tooltip>
  );

  const keyDown = (e) => {
    if (e.key === "Enter") {
      set(wbKey, JSON.parse(e.target.value));
      setEditing(false);
    }
  };

  const editor = (
    <TextField
      defaultValue={value}
      onKeyDown={keyDown}
      onBlur={() => setEditing(false)}
      size="small"
      autoFocus
    />
  );
  return (
    <Stack direction="row" alignItems="center">
      <Typography display="inline-block" whiteSpace="nowrap">
        {id} ={" "}
      </Typography>
      {editing ? editor : label}
    </Stack>
  );
}
