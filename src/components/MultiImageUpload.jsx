import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import ImageEditor from './ImageEditor';
import { compressImage, compressImageToDataUrl } from '../utils/imageCompression';
import { getImageUrl } from '../utils/imageUrl';

export default function MultiImageUpload({ 
  onImagesChange, 
  currentImages = [], 
  label = 'Imágenes Adicionales',
  maxImages = 5 
}) {
  const [images, setImages] = useState(currentImages || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [imageToEdit, setImageToEdit] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > maxImages) {
      alert(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    const newImages = [];
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} no es una imagen válida`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} es demasiado grande. Máximo 5MB`);
        continue;
      }

      try {
        const compressedDataUrl = await compressImageToDataUrl(file, 1920, 1920, 0.85);
        newImages.push({
          file: file,
          preview: compressedDataUrl,
          url: null
        });
      } catch (err) {
        console.error('Error al comprimir:', err);
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push({
            file: file,
            preview: e.target.result,
            url: null
          });
        };
        reader.readAsDataURL(file);
      }
    }

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const handleEditorSave = async (editedImageDataUrl, index) => {
    try {
      const compressedDataUrl = await compressImageToDataUrl(editedImageDataUrl, 1920, 1920, 0.85);
      const response = await fetch(compressedDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `imagen-editada-${index}.jpg`, { type: 'image/jpeg' });

      const updatedImages = [...images];
      updatedImages[index] = {
        file: file,
        preview: compressedDataUrl,
        url: null
      };
      
      setImages(updatedImages);
      onImagesChange(updatedImages);
      setEditingIndex(null);
      setImageToEdit(null);
    } catch (err) {
      console.error('Error al procesar imagen editada:', err);
    }
  };

  const handleRemove = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const handleEdit = (index) => {
    const image = images[index];
    setImageToEdit(image.url || image.preview);
    setEditingIndex(index);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} <span className="text-gray-500">(Máximo {maxImages})</span>
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <div key={index} className="relative group">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-300">
              <img
                src={getImageUrl(img.url || img.preview)}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(index)}
                  className="opacity-0 group-hover:opacity-100 bg-white p-2 rounded-full hover:bg-gray-100 transition-all transform hover:scale-110 shadow-lg"
                  title="Editar imagen"
                >
                  <PencilIcon className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="opacity-0 group-hover:opacity-100 bg-red-500 p-2 rounded-full hover:bg-red-600 transition-all transform hover:scale-110 shadow-lg"
                  title="Eliminar imagen"
                >
                  <XMarkIcon className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">Imagen {index + 1}</p>
          </div>
        ))}

        {images.length < maxImages && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed border-gray-300 rounded-lg aspect-square flex flex-col items-center justify-center hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer"
          >
            <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-xs text-gray-600 text-center px-2">
              Agregar imagen
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {images.length}/{maxImages}
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {editingIndex !== null && imageToEdit && (
        <ImageEditor
          image={imageToEdit}
          onSave={(editedImage) => handleEditorSave(editedImage, editingIndex)}
          onCancel={() => {
            setEditingIndex(null);
            setImageToEdit(null);
          }}
        />
      )}
    </div>
  );
}

