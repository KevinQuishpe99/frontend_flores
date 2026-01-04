// Script para verificar configuración PWA
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = path.join(__dirname, '../public');

function verificarArchivo(nombre, descripcion) {
  const ruta = path.join(publicDir, nombre);
  const existe = fs.existsSync(ruta);
  
  if (existe) {
    const stats = fs.statSync(ruta);
    console.log(`✅ ${descripcion}: ${nombre} (${(stats.size / 1024).toFixed(2)} KB)`);
    return true;
  } else {
    console.log(`❌ ${descripcion}: ${nombre} - NO ENCONTRADO`);
    return false;
  }
}

function verificarManifest() {
  const manifestPath = path.join(publicDir, 'manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    console.log('❌ manifest.json - NO ENCONTRADO');
    return false;
  }
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log('✅ manifest.json encontrado');
    console.log(`   - Nombre: ${manifest.name}`);
    console.log(`   - Short name: ${manifest.short_name}`);
    console.log(`   - Theme color: ${manifest.theme_color}`);
    console.log(`   - Íconos: ${manifest.icons?.length || 0}`);
    
    // Verificar que los íconos referenciados existan
    if (manifest.icons) {
      manifest.icons.forEach(icon => {
        const iconPath = path.join(publicDir, icon.src);
        if (fs.existsSync(iconPath)) {
          console.log(`   ✅ Ícono referenciado existe: ${icon.src}`);
        } else {
          console.log(`   ❌ Ícono referenciado NO existe: ${icon.src}`);
        }
      });
    }
    
    return true;
  } catch (error) {
    console.log('❌ manifest.json - Error al leer:', error.message);
    return false;
  }
}

function verificarServiceWorker() {
  const swPath = path.join(publicDir, 'sw.js');
  
  if (!fs.existsSync(swPath)) {
    console.log('❌ sw.js - NO ENCONTRADO');
    return false;
  }
  
  console.log('✅ sw.js encontrado');
  return true;
}

function main() {
  console.log('🔍 Verificando configuración PWA...\n');
  
  let todoOk = true;
  
  // Verificar archivos esenciales
  todoOk = verificarManifest() && todoOk;
  console.log('');
  
  todoOk = verificarServiceWorker() && todoOk;
  console.log('');
  
  // Verificar íconos
  console.log('📱 Verificando íconos PWA:');
  todoOk = verificarArchivo('icon-192.png', 'Ícono 192x192') && todoOk;
  todoOk = verificarArchivo('icon-512.png', 'Ícono 512x512') && todoOk;
  console.log('');
  
  // Verificar index.html
  const indexHtmlPath = path.join(__dirname, '../index.html');
  if (fs.existsSync(indexHtmlPath)) {
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    const tieneManifest = indexHtml.includes('manifest.json');
    const tieneServiceWorker = indexHtml.includes('sw.js');
    const tieneMetaTheme = indexHtml.includes('theme-color');
    
    console.log('📄 Verificando index.html:');
    console.log(tieneManifest ? '✅ Referencia a manifest.json' : '❌ Falta referencia a manifest.json');
    console.log(tieneServiceWorker ? '✅ Registro de Service Worker' : '❌ Falta registro de Service Worker');
    console.log(tieneMetaTheme ? '✅ Meta tag theme-color' : '❌ Falta meta tag theme-color');
    
    todoOk = tieneManifest && tieneServiceWorker && tieneMetaTheme && todoOk;
  } else {
    console.log('❌ index.html - NO ENCONTRADO');
    todoOk = false;
  }
  
  console.log('\n' + '='.repeat(50));
  if (todoOk) {
    console.log('✅ Configuración PWA completa!');
    console.log('\n📱 Próximos pasos:');
    console.log('   1. Construye la app: npm run build');
    console.log('   2. Abre en navegador móvil');
    console.log('   3. Busca la opción "Agregar a pantalla de inicio"');
    console.log('   4. O usa Chrome DevTools > Application > Manifest');
  } else {
    console.log('⚠️  Configuración PWA incompleta');
    console.log('\n🔧 Para generar íconos:');
    console.log('   npm install sharp --save-dev');
    console.log('   node scripts/generar-iconos.js');
  }
  console.log('='.repeat(50));
}

main();

