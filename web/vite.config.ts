import os from "node:os";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const hostname = os.hostname();

export default defineConfig({
  plugins: [react()],
  server: {
    // Vite blocks unknown Host headers (DNS-rebinding protection). Plain IPs are
    // always allowed; naming this machine lets http://<hostname>:5173 work too,
    // without opening it up to every host.
    allowedHosts: [hostname, `${hostname}.local`],
    // Talk to FastAPI without CORS or absolute URLs anywhere in the app.
    proxy: {
      "/api": "http://localhost:8000",
      "/media": "http://localhost:8000",
    },
  },
});
