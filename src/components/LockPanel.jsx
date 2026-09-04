import { Button, IconButton, Stack, Tooltip } from "@mui/material";
import React from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyEditor from "./KeyEditor";

let nextId = 0;

export default function LockPanel() {
  const [locks, setLocks] = React.useState([]);

  const addLock = React.useCallback(() => {
    setLocks((locks) => [...locks, { id: nextId++, key: "" }]);
  }, []);

  const removeLock = React.useCallback((id) => {
    setLocks((locks) => locks.filter((lock) => lock.id !== id));
  }, []);

  const setLockKey = React.useCallback((id, key) => {
    setLocks((locks) =>
      locks.map((lock) => (lock.id === id ? { ...lock, key } : lock))
    );
  }, []);

  return (
    <Stack spacing={1}>
      {locks.map((lock) => (
        <LockRow
          key={lock.id}
          lockKey={lock.key}
          setLockKey={(key) => setLockKey(lock.id, key)}
          remove={() => removeLock(lock.id)}
        />
      ))}
      <Tooltip title="Add lock">
        <IconButton sx={{ alignSelf: "flex-start" }} onClick={addLock}>
          <AddIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function LockRow({ lockKey, setLockKey, remove }) {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <KeyEditor
        sx={{ flexGrow: 1 }}
        label="Key"
        keyStr={lockKey}
        onChange={setLockKey}
      />
      <Button variant="contained">Lock Now</Button>
      <Button variant="outlined">Try Lock</Button>
      <Tooltip title="Remove">
        <IconButton onClick={remove}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
