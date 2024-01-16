import * as React from "react";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TreeItem from "@mui/lab/TreeItem";
import { Stack, Tooltip, Typography } from "@mui/material";
import DeleteButton from "./DeleteButton";
import CopyButton from "./CopyButton";
import EditButton from "./EditButton";

export default function TopicTree({ data, pdelete }) {
  const treeItems = toTreeItems(data, pdelete);

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

function toTreeItems(data, pdelete, path) {
  let items = [];

  data.forEach((child, id) => {
    const item = toTreeItem(path ? `${path}/${id}` : id, child, id, pdelete);
    items.push(item);
  });

  return <>{items}</>;
}

function toTreeItem(path, item, id, pdelete) {
  if (item.value === undefined && item.children && item.children.size === 1) {
    const [childId, child] = item.children.entries().next().value;
    return toTreeItem(`${path}/${childId}`, child, `${id}/${childId}`, pdelete);
  } else {
    const label = (
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {item.value !== undefined ? (
          <Label id={id} value={item.value} />
        ) : (
          <Typography display="inline-block">{id}</Typography>
        )}
        <Stack direction="row">
          <EditButton
            wbkey={path}
            wbvalue={item.value}
            disabled={path.startsWith("$SYS")}
          />
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
        {item.children ? toTreeItems(item.children, pdelete, path) : null}
      </TreeItem>
    );
  }
}

function Label({ id, value }) {
  const text = JSON.stringify(value);
  const tooltipText = JSON.stringify(value, null, 2);

  const maxLen = 256;
  const shortValue =
    text.length <= maxLen ? text : text.substring(0, maxLen - 2) + " …";

  return (
    <Tooltip
      title={
        <Stack sx={{ maxHeight: "75vh", overflow: "auto" }}>
          <Typography
            variant="subtitle2"
            sx={{ whiteSpace: "pre" }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {tooltipText}
          </Typography>
        </Stack>
      }
      enterDelay={750}
    >
      <Stack direction="row" alignItems="center">
        <Typography display="inline-block" whiteSpace="nowrap">
          {id} ={" "}
        </Typography>
        <Typography
          display="inline-block"
          style={{ fontWeight: 600, marginInlineStart: 4 }}
        >
          {shortValue}
        </Typography>
      </Stack>
    </Tooltip>
  );
}
