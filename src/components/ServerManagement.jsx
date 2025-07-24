import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePersistedState } from "./persistedState";

const ServerContext = React.createContext();

export function toUrl(server) {
  if (!server || !server.endpoints || !server.scheme) {
    return [undefined, undefined];
  }

  const url =
    server.endpoints.length > 1
      ? `${server.scheme}://[${server.endpoints}]/ws`
      : `${server.scheme}://${server.endpoints[0]}/ws`;

  return [url, server.authToken];
}

export function useToUrls(server) {
  return React.useMemo(() => {
    if (!server || !server.endpoints || !server.scheme) {
      return [undefined, undefined];
    }

    const urls = server.endpoints.map((s) => `${server.scheme}://${s}/ws`);

    return [urls, server.authToken];
  }, [server]);
}

export function useServers() {
  const ctx = React.useContext(ServerContext);
  return ctx;
}

const STORAGE_KEY_SERVERS = "worterbuch.explorer.knownServers";
const STORAGE_KEY_SELECTED = "worterbuch.explorer.server";

function migrateServers(servers) {
  return servers.map((s) => {
    if (s.host != null) {
      const newServer = {
        scheme: s.scheme,
        endpoints: [s.port && s.port !== 80 ? `${s.host}:${s.port}` : s.host],
        authToken: s.authToken,
      };
      console.log(s, "=>", newServer);
      return newServer;
    } else {
      return s;
    }
  });
}

function endpointsEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  for (const ep of a) {
    if (!b.includes(ep)) {
      return false;
    }
  }

  return true;
}

export default function ServerManagement({ children }) {
  const navigate = useNavigate();
  const [selectedServer, setSelectedServer] = usePersistedState(
    STORAGE_KEY_SELECTED,
    -1
  );
  const [knownServers, setKnownServers] = usePersistedState(
    STORAGE_KEY_SERVERS,
    [],
    migrateServers
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
          endpointsEqual(server.endpoints, s.endpoints)
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
      let i = 0;
      for (const s of knownServers) {
        if (
          server.scheme === s.scheme &&
          endpointsEqual(server.endpoints, s.endpoints)
        ) {
          return [true, i];
        }
        i++;
      }
      return [false, -1];
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

  const updateServer = React.useCallback(
    (oldServer, newServer) => {
      if (oldServer === selectedServer) {
        navigate("/");
      }
      const newServers = [...knownServers];
      newServers.splice(oldServer, 1, newServer);
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
  const endpoints = searchParams.get("endpoints")?.split(",");

  React.useEffect(() => {
    if (endpoints) {
      const server = {
        scheme,
        endpoints,
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
    getExistingServer,
    indexOf,
    knownServers,
    scheme,
    endpoints,
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
        updateServer,
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
    searchParams.set("endpoints", server.endpoints.join(","));
    searchParams.delete("authToken");
    searchParams.delete("autoSubscribe");
  } else {
    searchParams.delete("scheme");
    searchParams.delete("endpoints");
    searchParams.delete("authToken");
  }
}
