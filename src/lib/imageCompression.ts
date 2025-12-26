/**
 * Utilidad para comprimir imágenes antes de subirlas
 */

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 0.8;

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Comprime una imagen manteniendo su proporción
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const { maxWidth = MAX_WIDTH, maxHeight = MAX_HEIGHT, quality = QUALITY } = options;

  // Solo comprimir imágenes
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // No comprimir GIFs (perdería animación)
  if (file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        
        // Calcular nuevas dimensiones manteniendo proporción
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Crear canvas y dibujar imagen redimensionada
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // Si el blob comprimido es más grande que el original, usar original
            if (blob.size >= file.size) {
              console.log(`Compresión omitida: resultado más grande (${blob.size} > ${file.size})`);
              resolve(file);
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            console.log(
              `Imagen comprimida: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB (${Math.round((1 - compressedFile.size / file.size) * 100)}% reducción)`
            );

            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        console.error('Error comprimiendo imagen:', error);
        resolve(file);
      }
    };

    img.onerror = () => {
      console.error('Error cargando imagen para comprimir');
      resolve(file);
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Comprime múltiples imágenes
 */
export async function compressImages(
  files: File[],
  options: CompressOptions = {}
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}