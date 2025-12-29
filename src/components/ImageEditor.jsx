import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { XMarkIcon, CheckIcon, ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ImageEditor({ image, onSave, onCancel }) {
  const [crop, setCrop] = useState({ unit: '%', width: 90, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [background, setBackground] = useState('#ffffff');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [sharpen, setSharpen] = useState(0);
  const [vignette, setVignette] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [exposure, setExposure] = useState(0);
  const [shadows, setShadows] = useState(0);
  const [highlights, setHighlights] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [tint, setTint] = useState(0);
  const [vibrance, setVibrance] = useState(0);
  const [clarity, setClarity] = useState(0);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHue(0);
    setBlur(0);
    setSharpen(0);
    setVignette(0);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setBackground('#ffffff');
    setExposure(0);
    setShadows(0);
    setHighlights(0);
    setTemperature(0);
    setTint(0);
    setVibrance(0);
    setClarity(0);
    toast.success('Filtros reseteados');
  };

  const onImageLoaded = useCallback((e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const aspect = naturalWidth / naturalHeight;
    setCrop({
      unit: '%',
      width: 90,
      aspect: aspect,
    });
  }, []);

  const getCroppedImg = useCallback((image, crop) => {
    if (!crop || !image) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio || 1;

    const cropX = (crop.x || 0) * scaleX;
    const cropY = (crop.y || 0) * scaleY;
    const cropWidth = (crop.width || 100) * scaleX;
    const cropHeight = (crop.height || 100) * scaleY;

    canvas.width = cropWidth * pixelRatio;
    canvas.height = cropHeight * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';
    ctx.imageSmoothingEnabled = true;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    return canvas.toDataURL('image/jpeg', 0.95);
  }, []);

  const applyFilters = useCallback((imageElement) => {
    if (!imageElement) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    canvas.width = imageElement.width || imageElement.naturalWidth;
    canvas.height = imageElement.height || imageElement.naturalHeight;

    // Aplicar transformaciones (rotación y volteo)
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Dibujar imagen base
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Obtener datos de píxeles para ajustes avanzados
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Aplicar ajustes de píxeles
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      const a = data[i + 3];

      // Brillo y exposición
      const brightnessValue = (brightness / 100) + (exposure / 100);
      r = r * brightnessValue;
      g = g * brightnessValue;
      b = b * brightnessValue;

      // Contraste
      const contrastValue = contrast / 100;
      const factor = (259 * (contrastValue * 255 + 255)) / (255 * (259 - contrastValue * 255));
      r = factor * (r - 128) + 128;
      g = factor * (g - 128) + 128;
      b = factor * (b - 128) + 128;

      // Saturación
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const satValue = saturation / 100;
      r = gray + satValue * (r - gray);
      g = gray + satValue * (g - gray);
      b = gray + satValue * (b - gray);

      // Vibrance (saturación selectiva)
      if (vibrance !== 0) {
        const vibranceValue = vibrance / 100;
        const maxChannel = Math.max(r, g, b);
        if (maxChannel > 128) {
          const factor = 1 + vibranceValue * (1 - (maxChannel - 128) / 128);
          r = r * factor;
          g = g * factor;
          b = b * factor;
        }
      }

      // Tono (Hue)
      if (hue !== 0) {
        const hueRad = (hue * Math.PI) / 180;
        const cos = Math.cos(hueRad);
        const sin = Math.sin(hueRad);
        const newR = r * (cos + (1 - cos) / 3) + g * ((1 - cos) / 3 - Math.sqrt(3) * sin / 3) + b * ((1 - cos) / 3 + Math.sqrt(3) * sin / 3);
        const newG = r * ((1 - cos) / 3 + Math.sqrt(3) * sin / 3) + g * (cos + (1 - cos) / 3) + b * ((1 - cos) / 3 - Math.sqrt(3) * sin / 3);
        const newB = r * ((1 - cos) / 3 - Math.sqrt(3) * sin / 3) + g * ((1 - cos) / 3 + Math.sqrt(3) * sin / 3) + b * (cos + (1 - cos) / 3);
        r = newR;
        g = newG;
        b = newB;
      }

      // Temperatura (caliente/frío)
      if (temperature !== 0) {
        if (temperature > 0) {
          r = Math.min(255, r + temperature * 0.5);
          b = Math.max(0, b - temperature * 0.3);
        } else {
          r = Math.max(0, r + temperature * 0.3);
          b = Math.min(255, b - temperature * 0.5);
        }
      }

      // Tinte (magenta/verde)
      if (tint !== 0) {
        if (tint > 0) {
          r = Math.min(255, r + tint * 0.3);
          g = Math.max(0, g - tint * 0.2);
        } else {
          r = Math.max(0, r + tint * 0.2);
          g = Math.min(255, g - tint * 0.3);
        }
      }

      // Sombras y luces
      const pixelBrightness = (r + g + b) / 3;
      if (shadows !== 0 && pixelBrightness < 128) {
        const factor = 1 + (shadows / 100) * (1 - pixelBrightness / 128);
        r = Math.min(255, r * factor);
        g = Math.min(255, g * factor);
        b = Math.min(255, b * factor);
      }
      if (highlights !== 0 && pixelBrightness >= 128) {
        const factor = 1 + (highlights / 100) * ((pixelBrightness - 128) / 128);
        r = Math.min(255, r * factor);
        g = Math.min(255, g * factor);
        b = Math.min(255, b * factor);
      }

      // Claridad (clarity) - mejora de contraste local
      if (clarity !== 0) {
        // Simplificado: aumentar contraste local
        const clarityFactor = 1 + (clarity / 100) * 0.3;
        const mid = 128;
        r = mid + (r - mid) * clarityFactor;
        g = mid + (g - mid) * clarityFactor;
        b = mid + (b - mid) * clarityFactor;
      }

      // Aplicar límites
      data[i] = Math.max(0, Math.min(255, Math.round(r)));
      data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }

    ctx.putImageData(imageData, 0, 0);

    // Aplicar desenfoque si está activado
    if (blur > 0) {
      ctx.filter = `blur(${blur}px)`;
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';
    }

    // Aplicar nitidez (sharpen) - usando un kernel de convolución simple
    if (sharpen > 0) {
      const sharpenCanvas = document.createElement('canvas');
      const sharpenCtx = sharpenCanvas.getContext('2d');
      sharpenCanvas.width = canvas.width;
      sharpenCanvas.height = canvas.height;
      sharpenCtx.drawImage(canvas, 0, 0);
      
      const sharpenData = sharpenCtx.getImageData(0, 0, canvas.width, canvas.height);
      const sharpenPixels = sharpenData.data;
      const sharpenAmount = sharpen / 100;
      
      // Kernel de nitidez simple
      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
          const idx = (y * canvas.width + x) * 4;
          const centerR = sharpenPixels[idx];
          const centerG = sharpenPixels[idx + 1];
          const centerB = sharpenPixels[idx + 2];
          
          const topIdx = ((y - 1) * canvas.width + x) * 4;
          const bottomIdx = ((y + 1) * canvas.width + x) * 4;
          const leftIdx = (y * canvas.width + (x - 1)) * 4;
          const rightIdx = (y * canvas.width + (x + 1)) * 4;
          
          const avgR = (sharpenPixels[topIdx] + sharpenPixels[bottomIdx] + sharpenPixels[leftIdx] + sharpenPixels[rightIdx]) / 4;
          const avgG = (sharpenPixels[topIdx + 1] + sharpenPixels[bottomIdx + 1] + sharpenPixels[leftIdx + 1] + sharpenPixels[rightIdx + 1]) / 4;
          const avgB = (sharpenPixels[topIdx + 2] + sharpenPixels[bottomIdx + 2] + sharpenPixels[leftIdx + 2] + sharpenPixels[rightIdx + 2]) / 4;
          
          sharpenPixels[idx] = Math.max(0, Math.min(255, centerR + (centerR - avgR) * sharpenAmount));
          sharpenPixels[idx + 1] = Math.max(0, Math.min(255, centerG + (centerG - avgG) * sharpenAmount));
          sharpenPixels[idx + 2] = Math.max(0, Math.min(255, centerB + (centerB - avgB) * sharpenAmount));
        }
      }
      
      sharpenCtx.putImageData(sharpenData, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(sharpenCanvas, 0, 0);
    }

    // Aplicar viñeta
    if (vignette > 0) {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(1, `rgba(0, 0, 0, ${vignette / 100})`);
      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }

    return canvas;
  }, [brightness, contrast, saturation, hue, blur, sharpen, vignette, rotation, flipHorizontal, flipVertical, exposure, shadows, highlights, temperature, tint, vibrance, clarity]);

  const handleSave = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      let imageToProcess = image;
      
      // Si hay crop, aplicar primero
      if (imgRef.current && completedCrop) {
        const croppedImage = getCroppedImg(imgRef.current, completedCrop);
        if (croppedImage) {
          imageToProcess = croppedImage;
        }
      }

      // Cargar imagen para procesar
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageToProcess;
      });

      // Aplicar filtros
      const filteredCanvas = applyFilters(img);
      if (!filteredCanvas) {
        throw new Error('Error al aplicar filtros');
      }

      // Crear canvas final con fondo
      const finalCanvas = document.createElement('canvas');
      const finalCtx = finalCanvas.getContext('2d');
      finalCanvas.width = filteredCanvas.width;
      finalCanvas.height = filteredCanvas.height;

      // Dibujar fondo
      finalCtx.fillStyle = background;
      finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

      // Dibujar imagen filtrada centrada
      finalCtx.drawImage(filteredCanvas, 0, 0);

      // Comprimir imagen antes de guardar (calidad 0.9 para mejor calidad en catálogo)
      const finalImage = finalCanvas.toDataURL('image/jpeg', 0.9);
      
      onSave(finalImage);
      toast.success('Imagen editada y guardada correctamente');
    } catch (error) {
      console.error('Error al guardar imagen:', error);
      toast.error('Error al procesar la imagen. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  }, [image, completedCrop, background, applyFilters, getCroppedImg, onSave, isProcessing]);

  const [previewUrl, setPreviewUrl] = useState(null);

  // Generar preview en tiempo real con debounce
  const generatePreview = useCallback(() => {
    if (!imgRef.current) {
      // Si no hay crop, usar la imagen original
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const filteredCanvas = applyFilters(img);
        if (filteredCanvas) {
          const finalCanvas = document.createElement('canvas');
          const finalCtx = finalCanvas.getContext('2d');
          finalCanvas.width = filteredCanvas.width;
          finalCanvas.height = filteredCanvas.height;
          finalCtx.fillStyle = background;
          finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
          finalCtx.drawImage(filteredCanvas, 0, 0);
          setPreviewUrl(finalCanvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = image;
      return;
    }

    if (!completedCrop) return;

    const imageEl = imgRef.current;
    const croppedImage = getCroppedImg(imageEl, completedCrop);
    if (!croppedImage) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const filteredCanvas = applyFilters(img);
      if (filteredCanvas) {
        const finalCanvas = document.createElement('canvas');
        const finalCtx = finalCanvas.getContext('2d');
        finalCanvas.width = filteredCanvas.width;
        finalCanvas.height = filteredCanvas.height;
        finalCtx.fillStyle = background;
        finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        finalCtx.drawImage(filteredCanvas, 0, 0);
        setPreviewUrl(finalCanvas.toDataURL('image/jpeg', 0.85));
      }
    };
    img.src = croppedImage;
  }, [image, completedCrop, background, applyFilters, getCroppedImg]);

  // Actualizar preview cuando cambian los filtros (con debounce)
  useEffect(() => {
    const timeout = setTimeout(generatePreview, 200);
    return () => clearTimeout(timeout);
  }, [brightness, contrast, saturation, hue, blur, sharpen, vignette, rotation, flipHorizontal, flipVertical, exposure, shadows, highlights, temperature, tint, vibrance, clarity, background, completedCrop, generatePreview]);

  // Generar preview inicial
  useEffect(() => {
    generatePreview();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-floral-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-primary-600" />
              Editor Profesional de Imagen
            </h2>
            <p className="text-sm text-gray-600 mt-1">Ajusta y optimiza tu imagen para el catálogo</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Área de edición principal */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200" style={{ backgroundColor: background }}>
                {image && (
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => {
                      setCrop(c);
                      setCompletedCrop(c);
                    }}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={undefined}
                    className="max-h-[300px]"
                  >
                    <img
                      ref={imgRef}
                      src={image}
                      alt="Crop"
                      onLoad={onImageLoaded}
                      className="max-w-full max-h-[300px] object-contain"
                      style={{
                        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${hue !== 0 ? `hue-rotate(${hue}deg)` : ''} ${blur > 0 ? `blur(${blur}px)` : ''}`,
                        transform: `rotate(${rotation}deg) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`,
                      }}
                    />
                  </ReactCrop>
                )}
              </div>
              
              {/* Preview pequeño mejorado */}
              {previewUrl && (
                <div className="bg-white rounded-lg p-4 border-2 border-primary-200 shadow-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-primary-600" />
                    Vista Previa del Catálogo
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-40 h-40 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                      />
                      <div className="absolute inset-0 border-2 border-primary-400 rounded-lg pointer-events-none"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-2">
                        Esta es la imagen que se mostrará en el catálogo. Los ajustes se aplican en tiempo real.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">✓ Optimizada</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">JPEG 90%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel de ajustes */}
            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <h3 className="font-semibold text-gray-900">Ajustes</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-primary-50"
                  title="Resetear filtros"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Resetear
                </button>
              </div>

              {/* Color de Fondo */}
              <div className="bg-gray-50 rounded-lg p-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de Fondo
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="color"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-16 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="flex-1 input text-sm"
                    placeholder="#ffffff"
                  />
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {['#ffffff', '#f3f4f6', '#000000', '#fef3c7', '#dbeafe', '#fce7f3'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackground(color)}
                      className={`w-full h-8 rounded border-2 transition-all ${
                        background === color ? 'border-primary-600 ring-2 ring-primary-300 scale-110' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Ajustes Básicos */}
              <div className="space-y-4 pt-2">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Ajustes Básicos</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brillo: {brightness}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraste: {contrast}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saturación: {saturation}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vibrance: {vibrance > 0 ? '+' : ''}{vibrance}
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={vibrance}
                    onChange={(e) => setVibrance(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Saturación selectiva (mejora colores sin sobre-saturar)</p>
                </div>
              </div>

              {/* Ajustes Avanzados */}
              <div className="pt-4 border-t space-y-4">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Ajustes Avanzados</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exposición: {exposure > 0 ? '+' : ''}{exposure}
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={exposure}
                    onChange={(e) => setExposure(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sombras: {shadows > 0 ? '+' : ''}{shadows}
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={shadows}
                    onChange={(e) => setShadows(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Luces: {highlights > 0 ? '+' : ''}{highlights}
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={highlights}
                    onChange={(e) => setHighlights(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Claridad: {clarity > 0 ? '+' : ''}{clarity}
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={clarity}
                    onChange={(e) => setClarity(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mejora el detalle y la textura</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nitidez: {sharpen}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sharpen}
                    onChange={(e) => setSharpen(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperatura: {temperature > 0 ? '+' : ''}{temperature}
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={temperature}
                    onChange={(e) => setTemperature(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Cálido (-) / Frío (+)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tinte: {tint > 0 ? '+' : ''}{tint}
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={tint}
                    onChange={(e) => setTint(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Magenta (-) / Verde (+)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tono (Hue): {hue}°
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={hue}
                    onChange={(e) => setHue(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Efectos */}
              <div className="pt-4 border-t space-y-4">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Efectos</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desenfoque: {blur}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={blur}
                    onChange={(e) => setBlur(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Viñeta: {vignette}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={vignette}
                    onChange={(e) => setVignette(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotación: {rotation}°
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voltear
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flipHorizontal}
                        onChange={(e) => setFlipHorizontal(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Horizontal</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flipVertical}
                        onChange={(e) => setFlipVertical(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Vertical</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-4 border-t sticky bottom-0 bg-white pb-2">
                <button
                  onClick={handleSave}
                  className="flex-1 btn-primary flex items-center justify-center"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5 mr-2" />
                      Guardar Imagen
                    </>
                  )}
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 btn-secondary"
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
