import React from "react";
import { toUrl, useServers } from "./ServerManagement";
import { usePersistedState } from "./persistedState";

export function useSubscriptionsForServer(selectedServer, knownServers) {
  const server = knownServers[selectedServer];
  const [url] = toUrl(server);

  const subscriptionsKey = `worterbuch.explorer.subscriptions`;
  const autoSubscribesKey = `worterbuch.explorer.autoSubscribes`;

  const [subscriptions, setSubscriptions] = usePersistedState(
    subscriptionsKey,
    {}
  );
  const subscription = urlDeEscapeSubscriptionKey(subscriptions[url]) || "#";
  const setSubscription = React.useCallback(
    (key) => {
      const sanitizedKey = sanitizeSubscriptionKey(key);
      const urlEscapedKey = urlEscapeSubscriptionKey(sanitizedKey);
      subscriptions[url] = urlEscapedKey;
      setSubscriptions({ ...subscriptions });
      return [sanitizedKey, urlEscapedKey];
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

export function sanitizeSubscriptionKey(key) {
  let sanitizedKey = key;
  if (key.length === 0) {
    sanitizedKey = "#";
  } else {
    if (key.endsWith("/")) {
      sanitizedKey = key + "#";
    }
  }
  return sanitizedKey;
}

export function urlEscapeSubscriptionKey(key) {
  return encodeURIComponent(key).replaceAll("%2F", "/");
}

export function urlDeEscapeSubscriptionKey(key) {
  return decodeURIComponent(key).replaceAll("%2F", "/");
}
