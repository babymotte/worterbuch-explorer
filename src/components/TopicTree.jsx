import * as React from "react";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useSubscribeLs } from "worterbuch-react";
import TopicTreeItem from "./TopicTreeItem";

export default function TopicTree() {
  const children = useSubscribeLs().sort();
  const childItems = children.map((id) => (
    <TopicTreeItem id={id} path={id} key={id} allowCompact={true} parent={""} />
  ));

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      sx={{
        flexGrow: 1,
        maxWidth: "100vw",
      }}
    >
      {childItems}
    </TreeView>
  );
}
