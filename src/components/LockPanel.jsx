import {
  Alert,
  Button,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
} from "@mui/material";
import React from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import LockClockIcon from "@mui/icons-material/LockClock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import KeyEditor from "./KeyEditor";
import { useWb } from "./Worterbuch";
import { WbError } from "worterbuch-js";

let nextId = 0;

export default function LockPanel() {
  const wb = useWb();
  const [locks, setLocks] = React.useState([]);
  const [lockError, setLockError] = React.useState(null);
  const closeLockError = React.useCallback((event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setLockError(null);
  }, []);

  // wb.lock() only ever resolves true/false and swallows the server's error
  // message on failure, so the last error received on the connection is
  // tracked here and correlated (by sequence number) with a failed lock
  // attempt to recover the actual reason it failed.
  const lastErrorRef = React.useRef({ seq: 0, err: null });
  React.useEffect(() => {
    if (!wb) {
      return;
    }
    const previousOnError = wb.onerror;
    wb.onerror = (err) => {
      lastErrorRef.current = { seq: lastErrorRef.current.seq + 1, err };
      previousOnError?.(err);
    };
    return () => {
      wb.onerror = previousOnError;
    };
  }, [wb]);

  const addLock = React.useCallback(() => {
    setLocks((locks) => [
      ...locks,
      { id: nextId++, key: "", locking: false, waiting: false, locked: false },
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

  const releaseLock = React.useCallback(
    (id) => {
      setLocks((locks) => {
        const lock = locks.find((lock) => lock.id === id);
        if (lock?.locked && wb) {
          wb.releaseLock(lock.key).catch((err) =>
            console.error("Error releasing lock:", err)
          );
        }
        return locks.map((lock) =>
          lock.id === id ? { ...lock, locked: false } : lock
        );
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
      const seqBefore = lastErrorRef.current.seq;
      wb.lock(key)
        .then((acquired) => {
          setLocks((locks) =>
            locks.map((lock) =>
              lock.id === id
                ? { ...lock, locking: false, locked: acquired }
                : lock
            )
          );
          if (!acquired) {
            const { seq, err } = lastErrorRef.current;
            const message =
              seq !== seqBefore
                ? new WbError(err).message
                : "Lock is already held by another client";
            setLockError(message);
          }
        })
        .catch((err) => {
          console.error("Error acquiring lock:", err);
          setLocks((locks) =>
            locks.map((lock) =>
              lock.id === id ? { ...lock, locking: false } : lock
            )
          );
          setLockError(err.message);
        });
    },
    [wb]
  );

  const tryLock = React.useCallback(
    (id, key) => {
      if (!wb || !key) {
        return;
      }
      setLocks((locks) =>
        locks.map((lock) =>
          lock.id === id ? { ...lock, waiting: true } : lock
        )
      );
      wb.acquireLock(key)
        .then(() => {
          setLocks((locks) =>
            locks.map((lock) =>
              lock.id === id
                ? { ...lock, waiting: false, locked: true }
                : lock
            )
          );
        })
        .catch((err) => {
          console.error("Error acquiring lock:", err);
          setLocks((locks) =>
            locks.map((lock) =>
              lock.id === id ? { ...lock, waiting: false } : lock
            )
          );
          setLockError(err.message);
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
          waiting={lock.waiting}
          locked={lock.locked}
          setLockKey={(key) => setLockKey(lock.id, key)}
          lockNow={() => lockNow(lock.id, lock.key)}
          tryLock={() => tryLock(lock.id, lock.key)}
          releaseLock={() => releaseLock(lock.id)}
          remove={() => removeLock(lock.id)}
        />
      ))}
      <Tooltip title="Add lock">
        <IconButton sx={{ alignSelf: "flex-start" }} onClick={addLock}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <Snackbar
        open={lockError != null}
        autoHideDuration={6000}
        onClose={closeLockError}
      >
        <Alert
          onClose={closeLockError}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Could not acquire lock: {lockError}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

function LockRow({
  lockKey,
  locking,
  waiting,
  locked,
  setLockKey,
  lockNow,
  tryLock,
  releaseLock,
  remove,
}) {
  const disabled = locking || waiting || locked;
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <KeyEditor
        sx={{ flexGrow: 1 }}
        label="Key"
        keyStr={lockKey}
        onChange={setLockKey}
        disabled={disabled}
      />
      {!waiting && (
        <Button
          variant="contained"
          disabled={!lockKey || disabled}
          onClick={lockNow}
          startIcon={<LockIcon />}
        >
          {locked ? "Locked" : "Lock Now"}
        </Button>
      )}
      {!locked && (
        <Button
          variant="outlined"
          disabled={!lockKey || disabled}
          onClick={tryLock}
          startIcon={<LockClockIcon />}
        >
          {waiting ? "Waiting for Lock" : "Try Lock"}
        </Button>
      )}
      {locked && (
        <Button
          variant="outlined"
          onClick={releaseLock}
          startIcon={<LockOpenIcon />}
        >
          Release Lock
        </Button>
      )}
      <Tooltip title={waiting ? "Cannot remove while waiting for lock" : "Remove"}>
        <span>
          <IconButton aria-label="Remove" onClick={remove} disabled={waiting}>
            <DeleteIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
