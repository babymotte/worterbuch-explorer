import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import { useServers } from "./ServerManagement";
import React from "react";
import KeyEditor from "./KeyEditor";
import { useSubscription } from "./Subscription";
import useServerSubscriptions, {
  sanitizeSubscriptionKey,
  urlDeEscapeSubscriptionKey,
} from "./serverSubscriptions";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

export default function SubscriptionBar({ pget }) {
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
  React.useEffect(() => {
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const [pattern, setPattern] = React.useState("#");
  React.useEffect(() => {
    setPattern(subscription);
  }, [subscription]);

  const subscribeKey = React.useCallback(
    (key) => {
      const [sanitizedKey, urlSegment] = setSubscription(key);
      subscribe(sanitizedKey, setSubscribed);
      const path = "/" + urlSegment;
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

  const saveMatches = useSaveMatches(sanitizeSubscriptionKey(pattern), pget);

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
          <Tooltip title="Save matching values as JSON">
            <IconButton onClick={saveMatches}>
              <FileDownloadIcon sx={{ opacity: 0.4 }} />
            </IconButton>
          </Tooltip>
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
  const decoded = urlDeEscapeSubscriptionKey(location.pathname);
  if (decoded === "/") {
    return storedSubscription;
  }
  return decoded.slice(1);
}

function getAutoSubscribe(searchParams, storedAutoSubscribe) {
  const autoSubscribe = searchParams.get("autoSubscribe");
  if (autoSubscribe !== undefined && autoSubscribe !== null) {
    return autoSubscribe === "1";
  }
  searchParams.set("autoSubscribe", storedAutoSubscribe ? "1" : "0");
  return storedAutoSubscribe;
}

function useSaveMatches(pattern, pget) {
  return () =>
    pget(pattern, (kvps) => {
      try {
        const text = JSON.stringify(kvps);

        // Create a Blob from the text
        const blob = new Blob([text], { type: "text/plain" });

        // Create a temporary URL for the Blob
        const blobUrl = URL.createObjectURL(blob);

        // Create a temporary anchor element
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `export-${pattern.replaceAll("/", "-")}.json`;

        // Append the anchor to the document and trigger the click
        document.body.appendChild(a);
        a.click();

        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.error("Error downloading file:", err);
      }
    });
}
