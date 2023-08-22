import { TreeItem } from "@mui/lab";
import { Stack, Typography } from "@mui/material";
import { usePDelete, usePSubscribe, useSubscribe } from "worterbuch-react";
import EditableLabel from "./EditableLabel";
import DeleteButton from "./DeleteButton";
import TopicTreeItem from "./TopicTreeItem";

function CompactTreeItemLabel({ subtree, parent }) {
  const path = Array.from(subtree.keys())[0];
  const id = path.replace(parent, "");
  const value = useSubscribe(path);
  const pdelete = usePDelete(`${path}/#`);
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      {value !== null ? (
        <EditableLabel id={id} value={JSON.stringify(value)} wbKey={path} />
      ) : (
        <Typography display="inline-block">{id}</Typography>
      )}
      <DeleteButton
        onClick={(e) => {
          pdelete();
          e.stopPropagation();
        }}
        disabled={path.startsWith("$SYS")}
      />
    </Stack>
  );
}

export default function CompactTopicTreeItem({ path, id, parent }) {
  const subtree = usePSubscribe(`${path}/#`);
  if (subtree.size === 1) {
    return (
      <TreeItem
        key={path}
        nodeId={path}
        label={<CompactTreeItemLabel parent={parent + "/"} subtree={subtree} />}
      />
    );
  } else {
    return (
      <TopicTreeItem id={id} path={path} allowCompact={false} parent={parent} />
    );
  }
}
