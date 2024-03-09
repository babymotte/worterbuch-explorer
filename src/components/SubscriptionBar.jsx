import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  Tooltip,
} from "@mui/material";
import { useServers } from "./ServerManagement";
import React from "react";
import KeyEditor from "./KeyEditor";
import { useSubscription } from "./Subscription";
import useServerSubscriptions from "./serverSubscriptions";

export default function SubscriptionBar() {
  const {
    connectionStatus: { status },
  } = useServers();
  const connected = status === "ok";

  const { subscribe, unsubscribe } = useSubscription();
  const [subscribed, setSubscribed] = React.useState(false);

  React.useEffect(() => {
    if (!connected) {
      setSubscribed(false);
    }
  }, [connected]);

  const { subscription, setSubscription, autoSubscribe, setAutoSubscribe } =
    useServerSubscriptions();

  const [pattern, setPattern] = React.useState("#");
  React.useEffect(() => {
    setPattern(subscription);
  }, [subscription]);

  const subscribeKey = React.useCallback(
    (key) => {
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
      setSubscription(sanitizedKey);
      subscribe(sanitizedKey, setSubscribed);
    },
    [setSubscription, subscribe]
  );

  const toggleSubscribed = () => {
    if (subscribed) {
      unsubscribe(setSubscribed);
    } else {
      subscribeKey(pattern);
    }
  };

  React.useEffect(() => {
    if (!subscribed && autoSubscribe && connected) {
      subscribeKey(subscription);
    }
  }, [subscribeKey, subscribed, autoSubscribe, subscription, connected]);

  return (
    <Grid container columnGap={2}>
      <Grid item xs>
        <Stack
          direction="row"
          sx={{ width: "100%", height: "100%" }}
          spacing={1}
        >
          <KeyEditor
            sx={{ flexGrow: 1 }}
            keyStr={pattern}
            label="Subscription"
            onChange={setPattern}
            onCommit={subscribeKey}
            includeRootHash
          />
          <Tooltip title="Automatically subscribe when connected">
            <FormControlLabel
              control={
                <Checkbox
                  checked={autoSubscribe}
                  onChange={(e) => setAutoSubscribe(e.target.checked)}
                />
              }
              label="Auto"
            />
          </Tooltip>
        </Stack>
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
