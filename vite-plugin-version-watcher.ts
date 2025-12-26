import type { Plugin } from 'vite';
import { watch, copyFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Plugin que observa cambios en .version.json y lo copia a public/ para acceso en runtime
 */
export function versionWatcher(): Plugin {
  return {
    name: 'version-watcher',
    configureServer(server) {
      const versionFile = resolve(process.cwd(), '.version.json');
      const publicVersionFile = resolve(process.cwd(), 'public', '.version.json');
      
      // Copiar archivo inicial si existe
      if (existsSync(versionFile)) {
        try {
          copyFileSync(versionFile, publicVersionFile);
        } catch (error) {
          console.warn('No se pudo copiar .version.json inicial:', error);
        }
      }
      
      // Observar cambios en .version.json
      watch(versionFile, { persistent: true }, (eventType) => {
        if (eventType === 'change') {
          try {
            // Copiar a public/ para que sea accesible vía fetch
            copyFileSync(versionFile, publicVersionFile);
            console.log('✅ Versión actualizada en runtime');
          } catch (error) {
            console.error('Error copiando .version.json:', error);
          }
        }
      });
    }
  };
}
