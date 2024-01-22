import React from "react";
import { useSearchParams } from "react-router-dom";

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

function loadKnownServers() {
  if (window.localStorage) {
    const serversJson = window.localStorage.getItem(STORAGE_KEY_SERVERS);
    if (!serversJson) {
      return [];
    }
    try {
      return JSON.parse(serversJson);
    } catch {
      console.error("Could not parse known servers JSON:", serversJson);
      return [];
    }
  } else {
    return [];
  }
}

function loadSelectedServer() {
  if (window.localStorage) {
    const serverJson = window.localStorage.getItem(STORAGE_KEY_SELECTED);
    if (!serverJson) {
      return 0;
    }
    try {
      return JSON.parse(serverJson);
    } catch {
      console.error("Could not parse known servers JSON:", serverJson);
      return 0;
    }
  } else {
    return 0;
  }
}

function persistKnownServers(servers) {
  if (window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY_SERVERS, JSON.stringify(servers));
  }
}

function persistSelectedServer(server) {
  if (window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY_SELECTED, JSON.stringify(server));
  }
}

export default function ServerManagement({ children }) {
  const [selectedServer, setSelectedServer] = React.useState(
    loadSelectedServer()
  );
  const [knownServers, setKnownServers] = React.useState(loadKnownServers());
  const [connectionStatus, setConnectionStatus] = React.useState({
    status: "warning",
    message: "Connecting to server …",
  });
  const serverAlreadyExists = React.useCallback(
    (server) => {
      const url = toUrl(server)[0];
      for (const s of knownServers) {
        if (toUrl(s)[0] === url) {
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
        persistKnownServers(newServers);
      } else {
        console.error("Server already exists:", server);
      }
    },
    [knownServers, serverAlreadyExists]
  );
  const removeServer = React.useCallback(
    (server) => {
      const newServers = [...knownServers];
      newServers.splice(server, 1);
      setKnownServers(newServers);
      persistKnownServers(newServers);
    },
    [knownServers]
  );
  const selectServer = (server) => {
    setSelectedServer(server);
    persistSelectedServer(server);
  };

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
  const port = searchParams.get("port");
  const authToken = searchParams.get("authToken");

  React.useEffect(() => {
    if (host && port) {
      const server = {
        scheme,
        host,
        port,
        authToken,
      };
      if (!serverAlreadyExists(server)) {
        addServer(server);
      } else {
        const index = indexOf(server);

        if (index >= 0) {
          selectServer(index);
        }

        searchParams.delete("scheme");
        searchParams.delete("host");
        searchParams.delete("port");
        searchParams.delete("authToken");

        setSearchParams(searchParams);
      }
    } else {
      searchParams.delete("scheme");
      searchParams.delete("host");
      searchParams.delete("port");
      searchParams.delete("authToken");

      setSearchParams(searchParams);
    }
  }, [
    addServer,
    authToken,
    host,
    indexOf,
    port,
    scheme,
    searchParams,
    selectedServer,
    serverAlreadyExists,
    setSearchParams,
  ]);

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
      }}
    >
      {children}
    </ServerContext.Provider>
  );
}
