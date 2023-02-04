import * as React from "react";
import { Stack, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function StatusIndicator({
  error,
  noServerSelected,
  connected,
}) {
  return (
    <>
      {error ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <ErrorIcon color="error" />
          <Typography fontSize="1.4em">{error}</Typography>
        </Stack>
      ) : noServerSelected ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <WarningIcon color="warning" />
          <Typography fontSize="1.4em">No server selected.</Typography>
        </Stack>
      ) : !connected ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <ErrorIcon color="error" />
          <Typography fontSize="1.4em">Could not connect to server!</Typography>
        </Stack>
      ) : (
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckCircleIcon color="success" />
          <Typography fontSize="1.4em">Connected to server.</Typography>
        </Stack>
      )}
    </>
  );
}
