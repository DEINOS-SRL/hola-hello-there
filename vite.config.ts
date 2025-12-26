import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import { versionWatcher } from "./vite-plugin-version-watcher";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Generar versión automática basada en fecha del último commit
  // Formato: YYYY.MM.DD.HHmm (ej: 2024.12.26.1430)
  // Primero intenta leer el archivo de versión generado por el git hook
  // Si no existe, genera la versión desde git o fecha actual
  let versionDate: Date;
  let autoVersion: string;
  
  const versionFile = path.resolve(__dirname, '.version.json');
  
  try {
    if (existsSync(versionFile)) {
      // Leer versión del archivo generado por git hook
      const versionData = JSON.parse(readFileSync(versionFile, 'utf-8'));
      autoVersion = versionData.version;
      versionDate = new Date(versionData.buildTime);
    } else {
      // Si no existe el archivo, generar desde git
      try {
        const commitDate = execSync('git log -1 --format=%ci', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
        if (commitDate) {
          versionDate = new Date(commitDate);
        } else {
          versionDate = new Date();
        }
      } catch {
        versionDate = new Date();
      }
      
      const year = versionDate.getFullYear();
      const month = String(versionDate.getMonth() + 1).padStart(2, '0');
      const day = String(versionDate.getDate()).padStart(2, '0');
      const hours = String(versionDate.getHours()).padStart(2, '0');
      const minutes = String(versionDate.getMinutes()).padStart(2, '0');
      autoVersion = `${year}.${month}.${day}.${hours}${minutes}`;
    }
  } catch {
    // Fallback: usar fecha actual
    versionDate = new Date();
    const year = versionDate.getFullYear();
    const month = String(versionDate.getMonth() + 1).padStart(2, '0');
    const day = String(versionDate.getDate()).padStart(2, '0');
    const hours = String(versionDate.getHours()).padStart(2, '0');
    const minutes = String(versionDate.getMinutes()).padStart(2, '0');
    autoVersion = `${year}.${month}.${day}.${hours}${minutes}`;
  }
  
  return {
    define: {
      __APP_VERSION__: JSON.stringify(autoVersion),
      __BUILD_TIME__: JSON.stringify(versionDate.toISOString()),
    },
  server: {
    host: "::",
    port: 8080,
    watch: {
      // Observar cambios en .version.json para recargar automáticamente
      ignored: ['!**/.version.json']
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "development" && versionWatcher(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: false, // Usamos manifest.json manual
      workbox: {
        // Aumentar límite para archivos grandes
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 horas
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    // Evita "Invalid hook call" por duplicación de React en dependencias.
    dedupe: ["react", "react-dom"],
  },
  };
});
