import * as React from "react";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { Link, Stack, Tooltip, Typography } from "@mui/material";
import DeleteButton from "./DeleteButton";
import CopyButton from "./CopyButton";
import EditButton from "./EditButton";
import { useWb } from "./Worterbuch";

const LINK_REGEX = /https?:\/\/.+/;

export default function TopicTree({ data, pdelete }) {
  const treeItems = toTreeItems(data, pdelete);

  const wb = useWb();

  React.useEffect(() => {
    if (wb) {
      wb.setClientName("WorterbuchExplorer");
    }
  }, [wb]);

  return (
    <TreeView
      aria-label="file system navigator"
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
          <Label path={path} id={id} value={item.value} />
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
      <TreeItem key={path} itemId={path} label={label}>
        {item.children ? toTreeItems(item.children, pdelete, path) : null}
      </TreeItem>
    );
  }
}

function Label({ path, id, value }) {
  const text = JSON.stringify(value);
  const tooltipText = JSON.stringify(value, null, 2);

  const maxLen = 150;
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
        <ValueRenderer path={path} value={value} shortValue={shortValue} />
      </Stack>
    </Tooltip>
  );
}

function LinkLabel({ value, shortValue }) {
  return (
    <Link
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Typography
        display="inline-block"
        style={{ fontWeight: 600, marginInlineStart: 4 }}
      >
        {shortValue}
      </Typography>
    </Link>
  );
}

function InternalLinkLabel({ path, value, shortValue }) {
  let hrf = toInternalHref(path, value);
  return (
    <Link
      href={hrf}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Typography
        display="inline-block"
        style={{ fontWeight: 600, marginInlineStart: 4 }}
      >
        {shortValue}
      </Typography>
    </Link>
  );
}

function ArrayLabel({ path, value, shortValue }) {
  if (value.some((e) => typeof e === "string" && e.startsWith("@"))) {
    return <LinkArrayLabel path={path} value={value} />;
  } else {
    return <DefaultLabel shortValue={shortValue} />;
  }
}

function LinkArrayLabel({ path, value }) {
  const items = value.map((e, i) => [
    typeof e === "string" && e.startsWith("@") ? (
      <InternalLinkLabel path={path} value={e} shortValue={JSON.stringify(e)} />
    ) : (
      <DefaultLabel shortValue={JSON.stringify(e)} />
    ),
    i < value.length - 1 ? <DefaultLabel shortValue="," /> : null,
  ]);

  return (
    <Stack direction="row">
      <DefaultLabel shortValue="[" />
      {items}
      <DefaultLabel shortValue="]" />
    </Stack>
  );
}

function DefaultLabel({ shortValue }) {
  return (
    <Typography
      display="inline-block"
      style={{ fontWeight: 600, marginInlineStart: 4 }}
    >
      {shortValue}
    </Typography>
  );
}

function ValueRenderer({ path, value, shortValue }) {
  if (typeof value === "string" && value.startsWith("@")) {
    return (
      <InternalLinkLabel path={path} value={value} shortValue={shortValue} />
    );
  } else if (typeof value === "string" && LINK_REGEX.test(value)) {
    return <LinkLabel value={value} shortValue={shortValue} />;
  } else if (Array.isArray(value)) {
    return <ArrayLabel path={path} value={value} shortValue={shortValue} />;
  } else {
    return <DefaultLabel shortValue={shortValue} />;
  }
}

function toInternalHref(key, value) {
  let link = value.substring(1);

  if (link.startsWith("@")) {
    return toInternalHref(key, link);
  } else {
    if (link.startsWith("./") || link.startsWith("../")) {
      return "/" + key + "/" + link + "/?autoSubscribe=1";
    }
    return "/" + link + "/?autoSubscribe=1";
  }
}
