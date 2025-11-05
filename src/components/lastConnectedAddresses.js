import React from "react";
import { useServers } from "./ServerManagement";

String.prototype.hashCode = function () {
  var hash = 0,
    i,
    chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export function useConnectedAddress() {
  const {knownServers, selectedServer} = useServers();
  let server = knownServers[selectedServer];

  return useConnectedAddressForServer(server);
}

function useConnectedAddressForServer(server) {


  if (!localStorage) {
    return;
  }

  return localStorage.getItem(
    "worterbuch.explorer.connected.server." +
      Math.abs(JSON.stringify(server).hashCode()),
  );

}

export function storeConnectedAddress(address, server) {
  if (!address) {
    return;
  }

  const localStorage = window?.localStorage;

  if (!localStorage) {
    return;
  }

  localStorage.setItem(
    "worterbuch.explorer.connected.server." +
      Math.abs(JSON.stringify(server).hashCode()),
    address
  );
}

export function useSortAddresses(addresses, server) {
  const hash = server ? Math.abs(JSON.stringify(server).hashCode()) : undefined;
  const localStorage = window?.localStorage;
  const lastConnected = hash
    ? localStorage?.getItem("worterbuch.explorer.connected.server." + hash)
    : undefined;

  return React.useMemo(() => {
    if (typeof addresses === "string") {
      return [addresses];
    }

    if (lastConnected == null || addresses == null || addresses.length === 0) {
      return addresses;
    }

    addresses.sort((a, b) =>
      a === lastConnected ? -1 : b === lastConnected ? 1 : 0
    );

    return addresses;
  }, [addresses, hash]);
}
