import * as React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import { StyledEngineProvider } from "@mui/material/styles";
import ServerManagement from "./components/ServerManagement";

async function start() {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <StyledEngineProvider injectFirst>
        <ServerManagement>
          <App />
        </ServerManagement>
      </StyledEngineProvider>
    </React.StrictMode>
  );
}

start();
