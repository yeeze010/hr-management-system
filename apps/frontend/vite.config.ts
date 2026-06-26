import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

const workspaceRoot = fileURLToPath(new URL("../../", import.meta.url));

export default defineConfig(() => {
  const ports = loadEnv("ports", workspaceRoot, "");
  const webPort = Number(ports.VITE_PORT ?? ports.WEB_PORT ?? 5216);
  const apiPort = Number(ports.API_PORT ?? 8216);
  const previewPort = Number(ports.PREVIEW_PORT ?? 6216);

  return {
    plugins: [vue()],
    server: {
      port: webPort,
      strictPort: true,
      proxy: {
        "/api": `http://127.0.0.1:${apiPort}`,
      },
    },
    preview: {
      port: previewPort,
      strictPort: true,
      proxy: {
        "/api": `http://127.0.0.1:${apiPort}`,
      },
    },
  };
});
