#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  // Obtener fecha del último commit
  const commitDate = execSync('git log -1 --format=%ci', { encoding: 'utf-8' }).trim();
  const versionDate = new Date(commitDate);
  
  const year = versionDate.getFullYear();
  const month = String(versionDate.getMonth() + 1).padStart(2, '0');
  const day = String(versionDate.getDate()).padStart(2, '0');
  const hours = String(versionDate.getHours()).padStart(2, '0');
  const minutes = String(versionDate.getMinutes()).padStart(2, '0');
  const version = `${year}.${month}.${day}.${hours}${minutes}`;
  
  // Crear archivo de versión
  const versionFile = join(__dirname, '..', '.version.json');
  const versionData = {
    version,
    buildTime: versionDate.toISOString(),
    commitDate: commitDate
  };
  
  writeFileSync(versionFile, JSON.stringify(versionData, null, 2));
  
  // También copiar a public/ para acceso en runtime
  const publicVersionFile = join(__dirname, '..', 'public', '.version.json');
  writeFileSync(publicVersionFile, JSON.stringify(versionData, null, 2));
  
  console.log(`✅ Versión actualizada: ${version}`);
} catch (error) {
  console.error('Error actualizando versión:', error.message);
  process.exit(1);
}

