import {
  Button,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { EditContext } from "./EditButton";
import UploadIcon from "@mui/icons-material/Upload";
import styled from "@emotion/styled";

export default function SetPanel({ set }) {
  const { setKey, setValue, key, value, json, setJson } =
    React.useContext(EditContext);
  const [valueValid, setValueValid] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [stringValue, setStringValue] = React.useState("");

  React.useEffect(() => {
    if (json) {
      try {
        JSON.parse(value);
        setValueValid(true);
        setError(null);
      } catch (err) {
        setValueValid(false);
        setError(err.message);
      }
    } else {
      setValueValid(stringValue !== undefined && stringValue !== null);
    }
  }, [json, value, stringValue]);

  const setKeyValue = () => {
    let parsed;
    try {
      parsed = json ? JSON.parse(value) : stringValue;
    } catch (err) {
      console.error("Invalid JSON:", err.message);
      return;
    }

    set(key, parsed);
  };

  const checkSet = (e) => {
    if (key && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      setKeyValue();
    }
  };

  return json ? (
    <FullSetPanel
      setKeyValue={setKeyValue}
      set={set}
      wbkey={key}
      setWbKey={setKey}
      wbvalue={json ? value : stringValue}
      setWbValue={json ? setValue : setStringValue}
      valueValid={valueValid}
      error={error}
      json={json}
      setJson={setJson}
      checkSet={checkSet}
    />
  ) : (
    <CompactSetPanel
      setKeyValue={setKeyValue}
      set={set}
      wbkey={key}
      setWbKey={setKey}
      wbvalue={json ? value : stringValue}
      setWbValue={json ? setValue : setStringValue}
      valueValid={valueValid}
      json={json}
      setJson={setJson}
      checkSet={checkSet}
    />
  );
}

function CompactSetPanel({
  setKeyValue,
  set,
  wbkey,
  setWbKey,
  wbvalue,
  setWbValue,
  valueValid,
  json,
  setJson,
  checkSet,
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      padding={2}
      justifyContent="stretch"
    >
      <TextField
        size="small"
        label="Key"
        sx={{ flexGrow: 1 }}
        onChange={(e) => setWbKey(e.target.value)}
        value={wbkey}
        onKeyDown={checkSet}
        // error={!key}
      />
      <Typography>=</Typography>
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          label="Value"
          multiline
          onChange={(e) => setWbValue(e.target.value)}
          value={wbvalue}
          error={!valueValid}
          sx={{ flexGrow: 1 }}
          maxRows={6}
          onKeyDown={checkSet}
        />
        <UploadButton set={set} />
      </Stack>
      <Stack direction="row" alignItems="center">
        <Typography>String</Typography>
        <Switch checked={json} onChange={(e) => setJson(e.target.checked)} />
        <Typography>JSON</Typography>
      </Stack>
      <Button
        variant="contained"
        disabled={!wbkey || !valueValid}
        onClick={setKeyValue}
      >
        Set
      </Button>
    </Stack>
  );
}

function FullSetPanel({
  setKeyValue,
  set,
  wbkey,
  setWbKey,
  wbvalue,
  setWbValue,
  valueValid,
  error,
  json,
  setJson,
  checkSet,
}) {
  return (
    <Stack spacing={2} padding={2}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        justifyContent="flex-end"
      >
        <Stack direction="row" alignItems="center">
          <Typography>String</Typography>
          <Switch checked={json} onChange={(e) => setJson(e.target.checked)} />
          <Typography>JSON</Typography>
        </Stack>
        <Button
          variant="contained"
          disabled={!wbkey || !valueValid}
          onClick={setKeyValue}
        >
          Set
        </Button>
      </Stack>
      <TextField
        size="small"
        label="Key"
        sx={{ flexGrow: 1 }}
        onChange={(e) => setWbKey(e.target.value)}
        value={wbkey}
        error={!wbkey}
        onKeyDown={checkSet}
      />
      <Stack direction="row" spacing={1}>
        <Tooltip title={error}>
          <TextField
            size="small"
            label="Value"
            multiline
            onChange={(e) => setWbValue(e.target.value)}
            value={wbvalue}
            error={!valueValid}
            sx={{ flexGrow: 1 }}
            maxRows={12}
            onKeyDown={checkSet}
          />
        </Tooltip>
        <UploadButton set={set} />
      </Stack>
    </Stack>
  );
}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const UploadButton = ({ set }) => {
  return (
    <Tooltip title="Set values from JSON file">
      <IconButton role={undefined} component="label">
        <VisuallyHiddenInput
          type="file"
          accept=".json"
          onChange={(event) => setValuesFromFile(event.target.files[0], set)}
        />
        <UploadIcon sx={{ opacity: 0.4 }} />
      </IconButton>
    </Tooltip>
  );
};

function setValuesFromFile(file, set) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const content = e.target.result;
    const keyValuePairs = JSON.parse(content);
    for (const kvp of keyValuePairs) {
      set(kvp.key, kvp.value);
    }
  };

  reader.onerror = function (e) {
    console.error("Error reading file:", e);
  };

  reader.readAsText(file);
}
