import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AdminProvider } from "./admin";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AdminProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AdminProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
