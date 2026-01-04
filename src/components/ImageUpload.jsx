import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import ImageEditor from './ImageEditor';
import { compressImage, compressImageToDataUrl } from '../utils/imageCompression';

export default function ImageUpload({ onImageSelect, currentImage, label = 'Imagen', required = false }) {
  const [preview, setPreview] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [imageToEdit, setImageToEdit] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB');
        return;
      }

      // Comprimir imagen antes de mostrar preview
      compressImageToDataUrl(file, 1920, 1920, 0.85)
        .then((compressedDataUrl) => {
          setPreview(compressedDataUrl);
          // También comprimir el archivo para cuando se suba
          compressImage(file, 1920, 1920, 0.85)
            .then((compressedFile) => {
              onImageSelect(compressedFile, compressedDataUrl);
            })
            .catch((err) => {
              console.error('Error al comprimir archivo:', err);
              // Si falla la compresión, usar el original
              const reader = new FileReader();
              reader.onload = (e) => {
                onImageSelect(file, e.target.result);
              };
              reader.readAsDataURL(file);
            });
        })
        .catch((err) => {
          console.error('Error al comprimir imagen:', err);
          // Si falla la compresión, usar el original
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreview(e.target.result);
            onImageSelect(file, e.target.result);
          };
          reader.readAsDataURL(file);
        });
    }
  };

  const handleEditorSave = async (editedImage) => {
    setPreview(editedImage);
    setShowEditor(false);
    
    try {
      // Convertir data URL a File sin usar fetch (para evitar CSP)
      const byteString = atob(editedImage.split(',')[1]);
      const mimeString = editedImage.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], 'imagen-editada.jpg', { type: 'image/jpeg' });
      onImageSelect(file, editedImage);
    } catch (err) {
      console.error('Error al procesar imagen editada:', err);
      onImageSelect(null, editedImage);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setImageToEdit(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageSelect(null, null);
  };

  const handleEdit = () => {
    if (preview || currentImage) {
      setImageToEdit(preview || currentImage);
      setShowEditor(true);
    }
  };

  const displayImage = preview || currentImage;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {displayImage ? (
        <div className="space-y-2">
          <div className="relative group flex justify-center">
            <div className="relative w-48 h-32 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md">
              <img
                src={displayImage}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="opacity-0 group-hover:opacity-100 bg-white p-2 rounded-full hover:bg-gray-100 transition-all transform hover:scale-110 shadow-lg"
                  title="Editar imagen"
                >
                  <PencilIcon className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="opacity-0 group-hover:opacity-100 bg-red-500 p-2 rounded-full hover:bg-red-600 transition-all transform hover:scale-110 shadow-lg"
                  title="Eliminar imagen"
                >
                  <XMarkIcon className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleEdit}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <PencilIcon className="w-4 h-4" />
              Editar
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-gray-600 hover:text-gray-700 font-medium"
            >
              Cambiar
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            La imagen se cargará al guardar
          </p>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer"
        >
          <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Haz clic para seleccionar una imagen
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF hasta 5MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {showEditor && imageToEdit && (
        <ImageEditor
          image={imageToEdit}
          onSave={handleEditorSave}
          onCancel={() => {
            setShowEditor(false);
            setImageToEdit(null);
          }}
        />
      )}
    </div>
  );
}

