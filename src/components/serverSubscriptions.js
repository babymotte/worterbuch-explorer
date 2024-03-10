import React from "react";
import { toUrl, useServers } from "./ServerManagement";
import { usePersistedState } from "./persistedState";

export function useSubscriptionsForServer(selectedServer, knownServers) {
  const server = knownServers[selectedServer];
  const url = toUrl(server);

  const subscriptionsKey = `worterbuch.explorer.subscriptions`;
  const autoSubscribesKey = `worterbuch.explorer.autoSubscribes`;

  const [subscriptions, setSubscriptions] = usePersistedState(
    subscriptionsKey,
    {}
  );
  const subscription = subscriptions[url] || "#";
  const setSubscription = React.useCallback(
    (key) => {
      subscriptions[url] = key;
      setSubscriptions({ ...subscriptions });
    },
    [setSubscriptions, subscriptions, url]
  );

  const [autoSubscribes, setAutoSubscribes] = usePersistedState(
    autoSubscribesKey,
    {}
  );
  const autoSubscribe = autoSubscribes[url] || false;
  const setAutoSubscribe = React.useCallback(
    (as) => {
      autoSubscribes[url] = as;
      setAutoSubscribes({ ...autoSubscribes });
    },
    [autoSubscribes, setAutoSubscribes, url]
  );

  return { subscription, setSubscription, autoSubscribe, setAutoSubscribe };
}

export default function useServerSubscriptions() {
  const { selectedServer, knownServers } = useServers();
  return useSubscriptionsForServer(selectedServer, knownServers);
}
