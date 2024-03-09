import * as React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import { StyledEngineProvider } from "@mui/material/styles";
import ServerManagement from "./components/ServerManagement";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ServerManagement>
        <App />
      </ServerManagement>
    ),
  },
]);

async function start() {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <StyledEngineProvider injectFirst>
        <RouterProvider router={router} />
      </StyledEngineProvider>
    </React.StrictMode>
  );
}

start();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
