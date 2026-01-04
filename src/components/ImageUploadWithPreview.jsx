import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import ImageEditor from './ImageEditor';

export default function ImageUploadWithPreview({ 
  onImageSelect, 
  currentImage = null,
  label = 'Imagen del Arreglo',
  required = false 
}) {
  const [preview, setPreview] = useState(currentImage);
  const [showEditor, setShowEditor] = useState(false);
  const [imageToEdit, setImageToEdit] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setPreview(imageUrl);
      setImageToEdit(imageUrl);
      setShowEditor(true);
    };
    reader.readAsDataURL(file);
  };

  const handleEditorSave = (editedImageDataUrl) => {
    // Convertir data URL a File sin usar fetch (para evitar CSP)
    try {
      // Convertir data URL a blob directamente
      const byteString = atob(editedImageDataUrl.split(',')[1]);
      const mimeString = editedImageDataUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], 'imagen-editada.jpg', { type: 'image/jpeg' });
      
      setPreview(editedImageDataUrl);
      setShowEditor(false);
      onImageSelect(file, editedImageDataUrl);
    } catch (err) {
      console.error('Error al procesar imagen:', err);
      setShowEditor(false);
    }
  };

  const handleEditorCancel = () => {
    setShowEditor(false);
    setImageToEdit(null);
    // Si canceló, mantener la imagen original si existe
    if (!currentImage) {
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageSelect(null, null);
  };

  const handleEdit = () => {
    if (preview) {
      setImageToEdit(preview);
      setShowEditor(true);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {preview ? (
        <div className="relative group flex justify-center">
          <div className="relative w-48 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleEdit}
                className="opacity-0 group-hover:opacity-100 bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all transform hover:scale-110"
                title="Editar imagen"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all transform hover:scale-110"
                title="Eliminar imagen"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Haz clic en la imagen para editarla o eliminar
          </p>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all"
        >
          <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            <span className="text-primary-600 font-semibold">Haz clic para subir</span> o arrastra una imagen
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF hasta 5MB
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {showEditor && imageToEdit && (
        <ImageEditor
          image={imageToEdit}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
        />
      )}
    </div>
  );
}

