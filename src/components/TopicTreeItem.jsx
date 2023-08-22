import { TreeItem } from "@mui/lab";
import { Stack, Typography } from "@mui/material";
import { usePDelete, useSubscribe, useSubscribeLs } from "worterbuch-react";
import EditableLabel from "./EditableLabel";
import DeleteButton from "./DeleteButton";
import CompactTopicTreeItem from "./CompactTopicTreeItem";

function TreeItemLabel({ id, path }) {
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

export default function TopicTreeItem({ path, id, parent, allowCompact }) {
  const children = useSubscribeLs(path).sort();

  if (children.length === 1 && allowCompact) {
    return <CompactTopicTreeItem id={id} path={path} parent={parent} />;
  } else {
    const childItems = children.map((id) => (
      <TopicTreeItem
        id={id}
        path={`${path}/${id}`}
        parent={path}
        key={id}
        allowCompact={true}
      />
    ));

    return (
      <TreeItem
        key={path}
        nodeId={path}
        label={<TreeItemLabel id={id} path={path} />}
      >
        {childItems}
      </TreeItem>
    );
  }
}
