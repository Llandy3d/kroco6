import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import monacoEditor from "vite-plugin-monaco-editor";

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig(async () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [react(), (monacoEditor as any).default({})],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
