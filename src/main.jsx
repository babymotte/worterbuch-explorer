import * as React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import { StyledEngineProvider } from "@mui/material/styles";
import ServerManagement from "./components/ServerManagement";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "*",
    element: (
      <ServerManagement>
        <App />
      </ServerManagement>
    ),
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <RouterProvider router={router} />
    </StyledEngineProvider>
  </React.StrictMode>
);
