import { Autocomplete, Button, Grid, TextField } from "@mui/material";
import { useServers } from "./ServerManagement";
import React from "react";
import { usePersistedState } from "./utils";

export default function SubscriptionBar({
  rootKeyRef,
  refreshOptions,
  options,
}) {
  const {
    subscribe,
    setSubscribe,
    connectionStatus: { status },
  } = useServers();
  const connected = status === "ok";

  const [rootKey, setRootKey] = usePersistedState(
    "worterbuch.explorer.subscription",
    rootKeyRef.current
  );
  React.useEffect(() => {
    rootKeyRef.current = rootKey;
    refreshOptions();
  }, [refreshOptions, rootKey, rootKeyRef]);

  const [resubscribe, setResubscribe] = React.useState(false);
  React.useEffect(() => {
    if (resubscribe) {
      setSubscribe(true);
      setResubscribe(false);
    }
  }, [resubscribe, setSubscribe]);

  const toggleConnected = () => {
    if (rootKey.length === 0) {
      setRootKey("#");
    } else if (!rootKey.endsWith("#")) {
      if (rootKey.endsWith("/")) {
        setRootKey(rootKey + "#");
      } else {
        setRootKey(rootKey + "/#");
      }
    }
    setSubscribe(!subscribe);
  };

  return (
    <Grid container columnGap={2}>
      <Grid item xs>
        <Autocomplete
          fullWidth
          freeSolo
          disableClearable
          options={options}
          inputValue={rootKey}
          onInputChange={(event, newInputValue) =>
            setRootKey(newInputValue.trim())
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Subscription"
              InputProps={{
                ...params.InputProps,
                type: "search",
              }}
              size="small"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleConnected();
                  setResubscribe(subscribe);
                }
              }}
            />
          )}
        />
      </Grid>

      <Grid item md={2} lg={1}>
        <Button
          sx={{ width: "100%", height: "100%" }}
          variant={subscribe ? "outlined" : "contained"}
          onClick={toggleConnected}
          disabled={!connected}
        >
          {subscribe ? "Unsubscribe" : "Subscribe"}
        </Button>
      </Grid>
    </Grid>
  );
}
