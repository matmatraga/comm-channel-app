import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["events", "util", "buffer", "stream"],
    }),
  ],
  define: {
    global: "globalThis",
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
  server: {
    allowedHosts: ["abec-136-158-78-140.ngrok-free.app"],
  },
});
