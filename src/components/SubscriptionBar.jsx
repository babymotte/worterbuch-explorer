import { Button, Grid } from "@mui/material";
import { useServers } from "./ServerManagement";
import React from "react";
import KeyEditor from "./KeyEditor";
import { useSubscription } from "./Subscription";
import { usePersistedState } from "./persistedState";

export default function SubscriptionBar() {
  const {
    connectionStatus: { status },
  } = useServers();
  const connected = status === "ok";

  const { subscribe, unsubscribe } = useSubscription();

  const [subscribed, setSubscribed] = React.useState(false);
  const [rootKey, setRootKey] = usePersistedState(
    "worterbuch.explorer.subscription",
    "#"
  );
  React.useEffect(() => {
    if (!connected) {
      setSubscribed(false);
    }
  }, [connected]);

  const subscribeKey = (key) => {
    let sanitizedKey = key;
    if (key.length === 0) {
      sanitizedKey = "#";
    } else if (!key.endsWith("#")) {
      if (key.endsWith("/")) {
        sanitizedKey = key + "#";
      } else {
        sanitizedKey = key + "/#";
      }
    }
    setRootKey(sanitizedKey);
    subscribe(sanitizedKey, setSubscribed);
  };

  const toggleSubscribed = () => {
    if (subscribed) {
      unsubscribe(setSubscribed);
    } else {
      subscribeKey(rootKey);
    }
  };

  return (
    <Grid container columnGap={2}>
      <Grid item xs>
        <KeyEditor
          keyStr={rootKey}
          label="Subscription"
          onChange={setRootKey}
          onCommit={subscribeKey}
          includeRootHash
        />
      </Grid>

      <Grid item md={2} lg={1}>
        <Button
          sx={{ width: "100%", height: "100%" }}
          variant={subscribed ? "outlined" : "contained"}
          onClick={toggleSubscribed}
          disabled={!connected}
        >
          {subscribed ? "Unsubscribe" : "Subscribe"}
        </Button>
      </Grid>
    </Grid>
  );
}
