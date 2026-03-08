import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/auth/v1": {
        target: "https://xfeeizryotmnopvgevmf.supabase.co",
        changeOrigin: true,
        secure: true,
      },
      "/rest/v1": {
        target: "https://xfeeizryotmnopvgevmf.supabase.co",
        changeOrigin: true,
        secure: true,
      },
      "/functions/v1": {
        target: "https://xfeeizryotmnopvgevmf.supabase.co",
        changeOrigin: true,
        secure: true,
      },
      "/storage/v1": {
        target: "https://xfeeizryotmnopvgevmf.supabase.co",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
