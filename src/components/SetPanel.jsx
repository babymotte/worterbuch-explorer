import { Button, Stack, Switch, TextField, Typography } from "@mui/material";
import React from "react";

export default function SetPanel({ set }) {
  const [key, setKey] = React.useState("");
  const [value, setValue] = React.useState("");
  const [json, setJson] = React.useState(false);
  const [valueValid, setValueValid] = React.useState(false);

  React.useEffect(() => {
    if (json) {
      try {
        JSON.parse(value);
        setValueValid(true);
      } catch {
        setValueValid(false);
      }
    } else {
      setValueValid(value !== undefined && value !== null);
    }
  }, [json, value]);

  const setKeyValue = () => {
    set(key, json ? JSON.parse(value) : value);
  };

  const checkSet = (e) => {
    if (key && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      setKeyValue();
    }
  };

  return json ? (
    <FullSetPanel
      set={setKeyValue}
      wbKey={key}
      setWbKey={setKey}
      wbValue={value}
      setWbValue={setValue}
      valueValid={valueValid}
      json={json}
      setJson={setJson}
      checkSet={checkSet}
    />
  ) : (
    <CompactSetPanel
      set={setKeyValue}
      wbKey={key}
      setWbKey={setKey}
      wbValue={value}
      setWbValue={setValue}
      valueValid={valueValid}
      json={json}
      setJson={setJson}
      checkSet={checkSet}
    />
  );
}

function CompactSetPanel({
  set,
  wbKey,
  setWbKey,
  wbValue,
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
        value={wbKey}
        onKeyDown={checkSet}
        // error={!key}
      />
      <Typography>=</Typography>
      <TextField
        size="small"
        label="Value"
        multiline
        onChange={(e) => setWbValue(e.target.value)}
        value={wbValue}
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
        disabled={!wbKey || !valueValid}
        onClick={set}
      >
        Set
      </Button>
    </Stack>
  );
}

function FullSetPanel({
  set,
  wbKey,
  setWbKey,
  wbValue,
  setWbValue,
  valueValid,
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
          disabled={!wbKey || !valueValid}
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
        value={wbKey}
        error={!wbKey}
        onKeyDown={checkSet}
      />
      <TextField
        size="small"
        label="Value"
        multiline
        onChange={(e) => setWbValue(e.target.value)}
        value={wbValue}
        error={!valueValid}
        sx={{ flexGrow: 1 }}
        maxRows={12}
        onKeyDown={checkSet}
      />
    </Stack>
  );
}
