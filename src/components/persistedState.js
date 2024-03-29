import React from "react";

export function usePersistedState(key, initialValue) {
  const [state, setState] = React.useState(load(key, initialValue));
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

function load(key, defaultValue) {
  if (window.localStorage) {
    const stored = window.localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
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
