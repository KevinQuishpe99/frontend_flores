// Script para generar íconos PWA básicos
// Requiere: npm install sharp (o usar canvas)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función para crear un ícono SVG simple
function crearIconoSVG(tamaño, color = '#10b981') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${tamaño}" height="${tamaño}" viewBox="0 0 ${tamaño} ${tamaño}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${tamaño}" height="${tamaño}" fill="${color}" rx="${tamaño * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${tamaño * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">🌸</text>
</svg>`;
}

// Función para crear un ícono usando canvas (si está disponible)
async function crearIconoPNG(tamaño, outputPath) {
  try {
    // Intentar usar sharp si está disponible
    const sharp = await import('sharp').catch(() => null);
    
    if (sharp) {
      const svg = crearIconoSVG(tamaño);
      await sharp.default(Buffer.from(svg))
        .resize(tamaño, tamaño)
        .png()
        .toFile(outputPath);
      console.log(`✅ Ícono ${tamaño}x${tamaño} creado: ${outputPath}`);
      return true;
    } else {
      console.warn('⚠️  Sharp no está instalado. Instalando...');
      console.log('   Ejecuta: npm install sharp --save-dev');
      return false;
    }
  } catch (error) {
    console.error(`❌ Error al crear ícono ${tamaño}x${tamaño}:`, error.message);
    return false;
  }
}

// Función alternativa: crear SVG y guardarlo
function crearIconoSVGFile(tamaño, outputPath) {
  const svg = crearIconoSVG(tamaño);
  fs.writeFileSync(outputPath.replace('.png', '.svg'), svg);
  console.log(`✅ Ícono SVG ${tamaño}x${tamaño} creado: ${outputPath.replace('.png', '.svg')}`);
  console.log(`   ⚠️  Necesitas convertir este SVG a PNG manualmente`);
  console.log(`   💡 Usa: https://cloudconvert.com/svg-to-png o ImageMagick`);
}

async function main() {
  const publicDir = path.join(__dirname, '../public');
  
  // Asegurar que el directorio existe
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('🎨 Generando íconos PWA...\n');

  // Intentar crear PNGs
  const icon192Path = path.join(publicDir, 'icon-192.png');
  const icon512Path = path.join(publicDir, 'icon-512.png');

  const icon192Creado = await crearIconoPNG(192, icon192Path);
  const icon512Creado = await crearIconoPNG(512, icon512Path);

  if (!icon192Creado || !icon512Creado) {
    console.log('\n📝 Creando versiones SVG como alternativa...\n');
    crearIconoSVGFile(192, icon192Path);
    crearIconoSVGFile(512, icon512Path);
    
    console.log('\n📋 Instrucciones para convertir SVG a PNG:');
    console.log('   1. Usa https://cloudconvert.com/svg-to-png');
    console.log('   2. O usa ImageMagick: convert icon-192.svg icon-192.png');
    console.log('   3. O usa cualquier editor de imágenes (GIMP, Photoshop, etc.)');
  } else {
    console.log('\n✅ Todos los íconos PWA creados exitosamente!');
  }
}

main().catch(console.error);

