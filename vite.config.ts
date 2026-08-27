// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 80,
    allowedHosts: ["saofranciscofm.com.br", "www.saofranciscofm.com.br"],
    proxy: {
      '/supabase': {
        target: 'https://appliu-supabase.ceip2y.easypanel.host',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/supabase/, ''),
      },
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));