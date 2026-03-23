import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Use the env variable if it exists, otherwise fallback to the cloud URL
  const supabaseTarget = env.VITE_SUPABASE_URL || "https://xfeeizryotmnopvgevmf.supabase.co";

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/auth/v1": {
          target: supabaseTarget,
          changeOrigin: true,
          secure: supabaseTarget.includes('supabase.co'), // only secure for cloud
        },
        "/rest/v1": {
          target: supabaseTarget,
          changeOrigin: true,
          secure: supabaseTarget.includes('supabase.co'),
        },
        "/functions/v1": {
          target: supabaseTarget,
          changeOrigin: true,
          secure: supabaseTarget.includes('supabase.co'),
        },
        "/storage/v1": {
          target: supabaseTarget,
          changeOrigin: true,
          secure: supabaseTarget.includes('supabase.co'),
        },
      },
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-i18n': ['i18next', 'react-i18next'],
          },
        },
      },
      target: 'es2020',
      cssCodeSplit: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});