import { useWorterbuchConnected } from "worterbuch-react";
import { useServers } from "./ServerManagement";
import React from "react";

export default function WorterbuchStatusIndicator({ children }) {
  const { setConnectionStatus } = useServers();
  const [connected] = useWorterbuchConnected();

  React.useEffect(() => {
    const status = connected ? "success" : "error";
    const message = connected ? "Connected" : "Error, reconnecting …";
    setConnectionStatus({
      status,
      message,
    });
  }, [connected, setConnectionStatus]);

  return <>{children}</>;
}
