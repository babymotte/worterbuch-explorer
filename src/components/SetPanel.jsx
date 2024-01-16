import {
  Button,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { EditContext } from "./EditButton";

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
      set={setKeyValue}
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
      set={setKeyValue}
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
      <Stack direction="row" alignItems="center">
        <Typography>String</Typography>
        <Switch checked={json} onChange={(e) => setJson(e.target.checked)} />
        <Typography>JSON</Typography>
      </Stack>
      <Button
        variant="contained"
        disabled={!wbkey || !valueValid}
        onClick={set}
      >
        Set
      </Button>
    </Stack>
  );
}

function FullSetPanel({
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
          onClick={set}
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
    </Stack>
  );
}
