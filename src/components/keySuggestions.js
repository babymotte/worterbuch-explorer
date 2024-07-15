import React from "react";
import { useWb } from "./Worterbuch";

export default function useKeyAutocomplete(key, addWildcard) {
  const [options, setOptions] = React.useState([]);
  const wb = useWb();
  React.useEffect(() => {
    if (wb) {
      const split = key.split("/");
      split.splice(split.length - 1, 1);
      const parent = split.length > 0 ? split.join("/") : undefined;
      wb.ls(parent).then((children) => {
        children.sort((a, b) => a.localeCompare(b));
        const options = addWildcard ? ["#"] : [];
        if (key.endsWith("/")) {
          options.push(key + "#");
        }
        for (const segment of children) {
          options.push(parent ? parent + "/" + segment : segment);
        }
        setOptions(options);
      });
    }
  }, [addWildcard, key, wb]);

  return options;
}
