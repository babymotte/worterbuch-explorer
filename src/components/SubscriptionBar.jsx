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
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

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

  const {
    subscription: storedSubscription,
    setSubscription,
    autoSubscribe: storedAutoSubscribe,
    setAutoSubscribe,
  } = useServerSubscriptions();

  const location = useLocation();
  const subscription = getSubscriptionFromPath(location, storedSubscription);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const autoSubscribe = getAutoSubscribe(searchParams, storedAutoSubscribe);

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
      const path = "/" + sanitizedKey;
      navigate(path);
      searchParams.set("autoSubscribe", autoSubscribe ? "1" : "0");
      setSearchParams(searchParams);
    },
    [
      autoSubscribe,
      navigate,
      searchParams,
      setSearchParams,
      setSubscription,
      subscribe,
    ]
  );

  const toggleSubscribed = () => {
    if (subscribed) {
      setAutoSubscribe(false);
      searchParams.set("autoSubscribe", "0");
      setSearchParams(searchParams);
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
                  onChange={(e) => {
                    searchParams.set(
                      "autoSubscribe",
                      e.target.checked ? "1" : "0"
                    );
                    setSearchParams(searchParams);
                    setAutoSubscribe(e.target.checked);
                  }}
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

function getSubscriptionFromPath(location, storedSubscription) {
  if (location.pathname === "/") {
    return storedSubscription;
  }
  return location.pathname.slice(1) + "#";
}

function getAutoSubscribe(searchParams, storedAutoSubscribe) {
  const autoSubscribe = searchParams.get("autoSubscribe");
  if (autoSubscribe !== undefined && autoSubscribe !== null) {
    return autoSubscribe === "1";
  }
  return storedAutoSubscribe;
}
