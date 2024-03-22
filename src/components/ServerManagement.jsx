import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePersistedState } from "./persistedState";

const ServerContext = React.createContext();

export function toUrl(server) {
  if (!server) {
    return [undefined, undefined];
  }
  return [
    `${server.scheme}://${server.host}${
      server.port !== 80 ? ":" + server.port : ""
    }/ws`,
    server.authToken,
  ];
}

export function useServers() {
  const ctx = React.useContext(ServerContext);
  return ctx;
}

const STORAGE_KEY_SERVERS = "worterbuch.explorer.knownServers";
const STORAGE_KEY_SELECTED = "worterbuch.explorer.server";

export default function ServerManagement({ children }) {
  const navigate = useNavigate();
  const [selectedServer, setSelectedServer] = usePersistedState(
    STORAGE_KEY_SELECTED,
    -1
  );
  const [knownServers, setKnownServers] = usePersistedState(
    STORAGE_KEY_SERVERS,
    []
  );
  React.useEffect(() => {
    if (selectedServer >= knownServers.length) {
      setSelectedServer(knownServers.length - 1);
    }
  }, [knownServers.length, selectedServer, setSelectedServer]);
  const [connectionStatus, setConnectionStatus] = React.useState({
    status: "warning",
    message: "Connecting to server …",
  });
  const getExistingServer = React.useCallback(
    (server) => {
      for (const s of knownServers) {
        if (
          server.scheme === s.scheme &&
          server.host === s.host &&
          server.port === s.port
        ) {
          return s;
        }
      }
      return null;
    },
    [knownServers]
  );
  const serverAlreadyExists = React.useCallback(
    (server) => {
      for (const s of knownServers) {
        if (
          server.scheme === s.scheme &&
          server.host === s.host &&
          server.port === s.port
        ) {
          return true;
        }
      }
      return false;
    },
    [knownServers]
  );
  const addServer = React.useCallback(
    (server) => {
      if (!serverAlreadyExists(addServer)) {
        const newServers = [...knownServers, server];
        setKnownServers(newServers);
      } else {
        console.error("Server already exists:", server);
      }
    },
    [knownServers, serverAlreadyExists, setKnownServers]
  );
  const removeServer = React.useCallback(
    (server) => {
      if (server === selectedServer) {
        navigate("/");
      }
      const newServers = [...knownServers];
      newServers.splice(server, 1);
      setKnownServers(newServers);
    },
    [knownServers, navigate, selectedServer, setKnownServers]
  );

  const indexOf = React.useCallback(
    (server) => {
      const url = toUrl(server);
      for (let i = 0; i < knownServers.length; i++) {
        const otherUrl = toUrl(knownServers[i]);
        if (otherUrl[0] === url[0] && otherUrl[1] === url[1]) {
          return i;
        }
      }
      return -1;
    },
    [knownServers]
  );

  let [searchParams, setSearchParams] = useSearchParams();

  const scheme = searchParams.get("scheme") || "ws";
  const host = searchParams.get("host");
  const port =
    Number.parseInt(searchParams.get("port")) || (scheme === "wss" ? 443 : 80);
  const authToken = searchParams.get("authToken");

  React.useEffect(() => {
    if (host) {
      const server = {
        scheme,
        host,
        port,
        authToken,
      };
      let s = getExistingServer(server);
      if (s === null) {
        addServer(server);
        s = server;
      }
      const index = indexOf(s);

      if (index >= 0) {
        setSelectedServer(index);
      }
    } else {
      const server = knownServers[selectedServer];
      updateSearchParams(server, searchParams);
      setSearchParams(searchParams);
    }
  }, [
    addServer,
    authToken,
    getExistingServer,
    host,
    indexOf,
    knownServers,
    port,
    scheme,
    searchParams,
    selectedServer,
    serverAlreadyExists,
    setSearchParams,
    setSelectedServer,
  ]);

  const selectServer = React.useCallback(
    (i) => {
      const server = knownServers[i];
      updateSearchParams(server, searchParams);
      navigate("/");
      setSearchParams(searchParams);
      setSelectedServer(i);
    },
    [knownServers, navigate, searchParams, setSearchParams, setSelectedServer]
  );

  React.useEffect(() => {
    const server = knownServers[selectedServer];
    document.title = server
      ? `Wörterbuch Explorer - ${server.host}`
      : "Wörterbuch Explorer";
  }, [knownServers, selectedServer]);

  const [keepaliveTimeout, setKeepaliveTimeout] = usePersistedState(
    "wortebruch.keepalive.timeout",
    5
  );

  return (
    <ServerContext.Provider
      value={{
        selectedServer,
        knownServers,
        selectServer,
        addServer,
        removeServer,
        connectionStatus,
        setConnectionStatus,
        serverAlreadyExists,
        keepaliveTimeout,
        setKeepaliveTimeout,
      }}
    >
      {children}
    </ServerContext.Provider>
  );
}

function updateSearchParams(server, searchParams) {
  if (server) {
    searchParams.set("scheme", server.scheme);
    searchParams.set("host", server.host);
    searchParams.set("port", server.port);
    searchParams.delete("authToken");
    searchParams.delete("autoSubscribe");
  } else {
    searchParams.delete("scheme");
    searchParams.delete("host");
    searchParams.delete("port");
    searchParams.delete("authToken");
  }
}
