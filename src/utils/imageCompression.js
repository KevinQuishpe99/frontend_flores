/**
 * Comprime una imagen antes de subirla
 * @param {File|string} file - Archivo de imagen o data URL
 * @param {number} maxWidth - Ancho máximo (default: 1920)
 * @param {number} maxHeight - Alto máximo (default: 1920)
 * @param {number} quality - Calidad de compresión 0-1 (default: 0.8)
 * @returns {Promise<File>} - Archivo comprimido
 */
export const compressImage = async (file, maxWidth = 1920, maxHeight = 1920, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    // Si la imagen es muy pesada (>5MB), usar calidad más baja
    const fileSizeMB = file.size / 1024 / 1024;
    let finalQuality = quality;
    let finalMaxWidth = maxWidth;
    let finalMaxHeight = maxHeight;
    
    if (fileSizeMB > 5) {
      finalQuality = 0.75; // Calidad más baja para imágenes muy pesadas
      finalMaxWidth = 1600;
      finalMaxHeight = 1600;
    } else if (fileSizeMB > 3) {
      finalQuality = 0.8;
      finalMaxWidth = 1800;
      finalMaxHeight = 1800;
    }
    
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Mejorar calidad de renderizado
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > finalMaxWidth || height > finalMaxHeight) {
        if (width > height) {
          if (width > finalMaxWidth) {
            height = (height * finalMaxWidth) / width;
            width = finalMaxWidth;
          }
        } else {
          if (height > finalMaxHeight) {
            width = (width * finalMaxHeight) / height;
            height = finalMaxHeight;
          }
        }
      }

      // Configurar canvas con nuevas dimensiones
      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen redimensionada con mejor calidad
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob con compresión optimizada
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Error al comprimir imagen'));
            return;
          }

          // Si aún es muy pesada, reducir más la calidad
          const blobSizeMB = blob.size / 1024 / 1024;
          if (blobSizeMB > 2) {
            // Re-comprimir con calidad más baja
            canvas.toBlob(
              (finalBlob) => {
                if (!finalBlob) {
                  // Si falla, usar el blob anterior
                  const compressedFile = new File([blob], file.name || 'imagen-comprimida.jpg', {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                  return;
                }
                const compressedFile = new File([finalBlob], file.name || 'imagen-comprimida.jpg', {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                console.log(`📦 Imagen comprimida: ${fileSizeMB.toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                resolve(compressedFile);
              },
              'image/jpeg',
              0.7
            );
          } else {
            // Crear File desde blob
            const compressedFile = new File([blob], file.name || 'imagen-comprimida.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            console.log(`📦 Imagen comprimida: ${fileSizeMB.toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            resolve(compressedFile);
          }
        },
        'image/jpeg',
        finalQuality
      );
    };

    img.onerror = () => reject(new Error('Error al cargar imagen'));

    // Cargar imagen desde File o data URL
    if (file instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Error al leer archivo'));
      reader.readAsDataURL(file);
    } else if (typeof file === 'string' && file.startsWith('data:')) {
      img.src = file;
    } else {
      reject(new Error('Formato de archivo no soportado'));
    }
  });
};

/**
 * Comprime una imagen y la convierte a data URL
 * @param {File|string} file - Archivo de imagen o data URL
 * @param {number} maxWidth - Ancho máximo (default: 1920)
 * @param {number} maxHeight - Alto máximo (default: 1920)
 * @param {number} quality - Calidad de compresión 0-1 (default: 0.8)
 * @returns {Promise<string>} - Data URL comprimida
 */
export const compressImageToDataUrl = async (file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
      }

      // Configurar canvas con nuevas dimensiones
      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a data URL con compresión
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };

    img.onerror = () => reject(new Error('Error al cargar imagen'));

    // Cargar imagen desde File o data URL
    if (file instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Error al leer archivo'));
      reader.readAsDataURL(file);
    } else if (typeof file === 'string' && file.startsWith('data:')) {
      img.src = file;
    } else {
      reject(new Error('Formato de archivo no soportado'));
    }
  });
};

