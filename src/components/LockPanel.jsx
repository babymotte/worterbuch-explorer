import {
  Alert,
  Box,
  Button,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
} from "@mui/material";
import React from "react";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import LockClockIcon from "@mui/icons-material/LockClock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import KeyEditor from "./KeyEditor";
import { useWb } from "./Worterbuch";
import { WbError } from "worterbuch-js";
import useServerSubscriptions from "./serverSubscriptions";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "./Subscription";

let nextId = 0;

export default function LockPanel() {
  const wb = useWb();
  const [locks, setLocks] = React.useState([]);
  const locksRef = React.useRef(locks);
  React.useEffect(() => {
    locksRef.current = locks;
  }, [locks]);
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

  // Similarly, wb.lock()/wb.acquireLock() don't expose the transactionId of
  // the lock they acquired, so it's recovered here from the raw ack message
  // and stashed on the lock's row once the acquisition succeeds. That's what
  // lets a later, unsolicited LockLost error (errorCode 26) be matched back
  // to the row that lost its lock.
  const lastAckRef = React.useRef({ seq: 0, transactionId: null });

  const LOCK_LOST_ERROR_CODE = 26;

  React.useEffect(() => {
    if (!wb) {
      return;
    }
    const previousOnMessage = wb.onmessage;
    wb.onmessage = (msg) => {
      if (msg.ack) {
        lastAckRef.current = {
          seq: lastAckRef.current.seq + 1,
          transactionId: msg.ack.transactionId,
        };
      }
      previousOnMessage?.(msg);
    };
    return () => {
      wb.onmessage = previousOnMessage;
    };
  }, [wb]);

  React.useEffect(() => {
    if (!wb) {
      return;
    }
    const previousOnError = wb.onerror;
    wb.onerror = (err) => {
      lastErrorRef.current = { seq: lastErrorRef.current.seq + 1, err };
      if (err.errorCode === LOCK_LOST_ERROR_CODE) {
        const lostLock = locksRef.current.find(
          (lock) => lock.transactionId === err.transactionId,
        );
        if (lostLock) {
          setLocks((locks) =>
            locks.map((lock) =>
              lock.transactionId === err.transactionId
                ? { ...lock, locked: false, transactionId: undefined }
                : lock,
            ),
          );
          setLockError(
            `Lock on "${lostLock.key}" was lost: ${new WbError(err).message}`,
          );
        }
      }
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
        if (wb) {
          wb.releaseLock(lock.key).catch((err) =>
            console.error("Error releasing lock:", err),
          );
        }
        return locks.filter((lock) => lock.id !== id);
      });
    },
    [wb],
  );

  const releaseLock = React.useCallback(
    (id) => {
      setLocks((locks) => {
        const lock = locks.find((lock) => lock.id === id);
        if (wb) {
          wb.releaseLock(lock.key).catch((err) =>
            console.error("Error releasing lock:", err),
          );
        }
        return locks.map((lock) =>
          lock.id === id
            ? { ...lock, locked: false, transactionId: undefined }
            : lock,
        );
      });
    },
    [wb],
  );

  const setLockKey = React.useCallback((id, key) => {
    setLocks((locks) =>
      locks.map((lock) => (lock.id === id ? { ...lock, key } : lock)),
    );
  }, []);

  const lockNow = React.useCallback(
    (id, key) => {
      if (!wb || !key) {
        return;
      }
      setLocks((locks) =>
        locks.map((lock) =>
          lock.id === id ? { ...lock, locking: true } : lock,
        ),
      );
      const seqBefore = lastErrorRef.current.seq;
      wb.lock(key)
        .then((acquired) => {
          const transactionId = acquired
            ? lastAckRef.current.transactionId
            : undefined;
          setLocks((locks) =>
            locks.map((lock) =>
              lock.id === id
                ? { ...lock, locking: false, locked: acquired, transactionId }
                : lock,
            ),
          );
          if (!acquired) {
            const { seq, err } = lastErrorRef.current;
            const reason =
              seq !== seqBefore
                ? new WbError(err).message
                : "Lock is already held by another client";
            setLockError(`Could not acquire lock: ${reason}`);
          }
        })
        .catch((err) => {
          console.error("Error acquiring lock:", err);
          setLocks((locks) =>
            locks.map((lock) =>
              lock.id === id ? { ...lock, locking: false } : lock,
            ),
          );
          setLockError(`Could not acquire lock: ${err.message}`);
        });
    },
    [wb],
  );

  const tryLock = React.useCallback(
    (id, key) => {
      if (!wb || !key) {
        return;
      }
      setLocks((locks) =>
        locks.map((lock) =>
          lock.id === id ? { ...lock, waiting: true } : lock,
        ),
      );
      wb.acquireLock(key)
        .then(() => {
          const transactionId = lastAckRef.current.transactionId;
          setLocks((locks) =>
            locks.map((lock) =>
              lock.id === id
                ? { ...lock, waiting: false, locked: true, transactionId }
                : lock,
            ),
          );
        })
        .catch((err) => {
          console.error("Error acquiring lock:", err);
          setLocks((locks) =>
            locks.map((lock) =>
              lock.id === id ? { ...lock, waiting: false } : lock,
            ),
          );
          setLockError(`Could not acquire lock: ${err.message}`);
        });
    },
    [wb],
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
      <Stack direction="row" alignItems="center" spacing={2}>
        <AddLockButton onClick={addLock} />
        <Box sx={{ flexGrow: 1 }} />
        <SubscribeButton />
      </Stack>

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
          {lockError}
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
        onCommit={lockNow}
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
      <RemoveButton onClick={remove} />
    </Stack>
  );
}

function RemoveButton({ onClick, disabled }) {
  const [hovering, setHovering] = React.useState(false);
  return (
    <Tooltip
      title={disabled ? "Cannot remove while waiting for lock" : "Remove"}
      sx={{ opacity: hovering ? 1.0 : 0.2 }}
    >
      <Box component="span">
        <IconButton
          aria-label="Remove"
          onClick={onClick}
          disabled={disabled}
          size="small"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Tooltip>
  );
}

function AddLockButton({ onClick }) {
  const [hovering, setHovering] = React.useState(false);
  return (
    <Box sx={{ alignSelf: "flex-start" }}>
      <Tooltip title="Add lock" sx={{ opacity: hovering ? 1.0 : 0.2 }}>
        <IconButton
          size="small"
          onClick={onClick}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function SubscribeButton() {
  const [hovering, setHovering] = React.useState(false);
  const { setSubscription } = useServerSubscriptions();

  const { subscribe } = useSubscription();
  const navigate = useNavigate();

  const subscribeKey = React.useCallback(
    (key) => {
      const [sanitizedKey, urlSegment] = setSubscription(key);
      subscribe(sanitizedKey);
      const path = "/" + urlSegment;
      navigate(path);
    },
    [navigate, setSubscription, subscribe],
  );

  return (
    <Box sx={{ alignSelf: "flex-start" }}>
      <Tooltip title="View Locks" sx={{ opacity: hovering ? 1.0 : 0.2 }}>
        <IconButton
          size="small"
          onClick={() => subscribeKey("$SYS/locks/#")}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <LinkIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
