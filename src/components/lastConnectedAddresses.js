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
  const localStorage = window?.localStorage;

  const lastConnected = localStorage?.getItem(
    "worterbuch.explorer.connected.server." + toUrl(server)
  );

  return React.useMemo(() => {
    if (!lastConnected) {
      return addresses;
    }

    addresses.sort((a, b) =>
      a === lastConnected ? -1 : b === lastConnected ? 1 : 0
    );

    return addresses;
  }, [addresses, lastConnected]);
}
