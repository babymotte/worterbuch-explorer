import * as React from "react";
import { Stack, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useServers } from "./ServerManagement";
import ThemeSwitch from "./ThemeSwitch";
import pkg from "../../package.json";

export default function StatusIndicator({
  error,
  noServerSelected,
  connected,
}) {
  const {
    connectionStatus: { status, message },
  } = useServers();

  const icon =
    status === "error" ? (
      <ErrorIcon color="error" />
    ) : status === "warning" ? (
      <WarningIcon color="warning" />
    ) : (
      <CheckCircleIcon color="success" />
    );
  return (
    <Stack direction="row" spacing={3} alignItems="center">
      <ThemeSwitch />
      <Typography>Wörterbuch&nbsp;Explorer&nbsp;v{pkg.version}</Typography>

      <Stack direction="row" spacing={1} alignItems="center">
        {icon}
        <Typography>{message}</Typography>
      </Stack>
    </Stack>
  );
}
