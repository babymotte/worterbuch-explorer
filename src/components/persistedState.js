import React from "react";

export function usePersistedState(key, initialValue, migration) {
  const [state, setState] = React.useState(load(key, initialValue, migration));
  const persistState = React.useCallback(
    (state) => {
      persist(key, state);
      setState(state);
    },
    [key]
  );
  return [state, persistState];
}

function persist(key, value) {
  if (window.localStorage) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

function load(key, defaultValue, migration) {
  if (window.localStorage) {
    const stored = window.localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return migration ? migration(parsed) : parsed;
      } catch (err) {
        console.error(
          `Could not load persisted value for key '${key}':`,
          err.message
        );
        return defaultValue;
      }
    } else {
      return defaultValue;
    }
  } else {
    return defaultValue;
  }
}
