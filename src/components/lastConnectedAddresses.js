import React from "react";
import { toUrl } from "./ServerManagement";

export function storeConnectedAddress(address, server) {
  if (!address) {
    return;
  }

  const localStorage = window?.localStorage;

  if (!localStorage) {
    return;
  }

  localStorage.setItem(
    "worterbuch.explorer.connected.server." + toUrl(server),
    address
  );
}

export function useSortAddresses(addresses, server) {
  return React.useMemo(() => {
    if (server == null || addresses == null || addresses.length === 0) {
      return addresses;
    }

    const localStorage = window?.localStorage;

    const lastConnected = localStorage?.getItem(
      "worterbuch.explorer.connected.server." + toUrl(server)
    );

    if (lastConnected != null) {
      return addresses;
    }

    addresses.sort((a, b) =>
      a === lastConnected ? -1 : b === lastConnected ? 1 : 0
    );

    return addresses;
  }, [addresses]);
}
