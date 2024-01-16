import { Button, Stack, Switch, TextField, Typography } from "@mui/material";
import React from "react";
import { EditContext } from "./EditButton";

export default function SetPanel({ set }) {
  const { setKey, setValue, key, value, json, setJson } =
    React.useContext(EditContext);
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
      wbkey={key}
      setWbKey={setKey}
      wbvalue={value}
      setWbValue={setValue}
      valueValid={valueValid}
      json={json}
      setJson={setJson}
      checkSet={checkSet}
    />
  ) : (
    <CompactSetPanel
      set={setKeyValue}
      wbkey={key}
      setWbKey={setKey}
      wbvalue={value}
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
    </Stack>
  );
}
