import { Button, IconButton, Stack, Tooltip } from "@mui/material";
import React from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyEditor from "./KeyEditor";
import { useWb } from "./Worterbuch";

let nextId = 0;

export default function LockPanel() {
  const wb = useWb();
  const [locks, setLocks] = React.useState([]);

  const addLock = React.useCallback(() => {
    setLocks((locks) => [
      ...locks,
      { id: nextId++, key: "", locking: false, locked: false },
    ]);
  }, []);

  const removeLock = React.useCallback(
    (id) => {
      setLocks((locks) => {
        const lock = locks.find((lock) => lock.id === id);
        if (lock?.locked && wb) {
          wb.releaseLock(lock.key).catch((err) =>
            console.error("Error releasing lock:", err)
          );
        }
        return locks.filter((lock) => lock.id !== id);
      });
    },
    [wb]
  );

  const setLockKey = React.useCallback((id, key) => {
    setLocks((locks) =>
      locks.map((lock) => (lock.id === id ? { ...lock, key } : lock))
    );
  }, []);

  const lockNow = React.useCallback(
    (id, key) => {
      if (!wb || !key) {
        return;
      }
      setLocks((locks) =>
        locks.map((lock) =>
          lock.id === id ? { ...lock, locking: true } : lock
        )
      );
      wb.lock(key)
        .then((acquired) => {
          setLocks((locks) =>
            locks.map((lock) =>
              lock.id === id
                ? { ...lock, locking: false, locked: acquired }
                : lock
            )
          );
        })
        .catch((err) => {
          console.error("Error acquiring lock:", err);
          setLocks((locks) =>
            locks.map((lock) =>
              lock.id === id ? { ...lock, locking: false } : lock
            )
          );
        });
    },
    [wb]
  );

  return (
    <Stack spacing={1}>
      {locks.map((lock) => (
        <LockRow
          key={lock.id}
          lockKey={lock.key}
          locking={lock.locking}
          locked={lock.locked}
          setLockKey={(key) => setLockKey(lock.id, key)}
          lockNow={() => lockNow(lock.id, lock.key)}
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

function LockRow({ lockKey, locking, locked, setLockKey, lockNow, remove }) {
  const disabled = locking || locked;
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <KeyEditor
        sx={{ flexGrow: 1 }}
        label="Key"
        keyStr={lockKey}
        onChange={setLockKey}
        disabled={disabled}
      />
      <Button
        variant="contained"
        disabled={!lockKey || disabled}
        onClick={lockNow}
      >
        Lock Now
      </Button>
      <Button variant="outlined" disabled={!lockKey || disabled}>
        Try Lock
      </Button>
      <Tooltip title="Remove">
        <IconButton onClick={remove}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
