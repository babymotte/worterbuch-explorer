import { Autocomplete, TextField } from "@mui/material";
import React from "react";
import useKeyAutocomplete from "./keySuggestions";

export default function KeyEditor({
  keyStr: externalKey,
  label,
  onChange: setExternalKey,
  onCommit,
  includeRootHash,
  error,
  sx,
}) {
  const [internalKey, setInternalKey] = React.useState("");
  const [key, setKey] =
    externalKey !== undefined && setExternalKey !== undefined
      ? [externalKey, setExternalKey]
      : [internalKey, setInternalKey];
  const keySuggestions = useKeyAutocomplete(key, includeRootHash);

  return (
    <Autocomplete
      freeSolo
      disableClearable
      options={keySuggestions}
      inputValue={key}
      onInputChange={(event, newInputValue) => setKey(newInputValue)}
      sx={sx}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            type: "search",
          }}
          error={error}
          size="small"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              e.preventDefault();
              e.stopPropagation();
              if (onCommit) {
                onCommit(key);
              }
            }
          }}
        />
      )}
    />
  );
}
