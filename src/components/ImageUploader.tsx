import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn, fileToBase64, compressImage } from '../utils/helpers';
import { Button } from './ui/Button';

// ============================================================================
// TIPOS
// ============================================================================

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onUpload: (base64: string, fileName: string, mimeType: string) => Promise<string | null>;
  className?: string;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function ImageUploader({
  value,
  onChange,
  onUpload,
  className
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imagenes');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen es muy grande (max 10MB)');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Comprimir imagen
      const compressed = await compressImage(file, 1200, 0.85);
      const compressedFile = new File([compressed], file.name, { type: 'image/jpeg' });

      // Convertir a Base64
      const base64 = await fileToBase64(compressedFile);

      // Subir
      const url = await onUpload(base64, file.name, 'image/jpeg');

      if (url) {
        onChange(url);
      } else {
        setError('Error al subir la imagen');
      }
    } catch (err) {
      setError('Error al procesar la imagen');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {value ? (
        // Preview de imagen
        <div className="relative group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-40 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            title="Eliminar imagen"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        // Area de drop
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6',
            'flex flex-col items-center justify-center',
            'transition-colors cursor-pointer',
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-600',
            isUploading && 'pointer-events-none opacity-50'
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />

          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-2" />
              <p className="text-sm text-slate-500">Subiendo...</p>
            </>
          ) : (
            <>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                {isDragging ? (
                  <Upload className="w-6 h-6 text-primary-500" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                {isDragging ? (
                  'Suelta la imagen aqui'
                ) : (
                  <>
                    Arrastra una imagen o{' '}
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      haz clic para seleccionar
                    </span>
                  </>
                )}
              </p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG hasta 10MB</p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// URL INPUT (alternativa)
// ============================================================================

interface ImageUrlInputProps {
  value?: string;
  onChange: (url: string) => void;
}

export function ImageUrlInput({ value, onChange }: ImageUrlInputProps) {
  const [inputValue, setInputValue] = useState(value || '');

  const handleApply = () => {
    onChange(inputValue);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="url"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
          className={cn(
            'flex-1 px-3 py-2 rounded-lg border',
            'bg-white dark:bg-slate-900',
            'border-slate-300 dark:border-slate-700',
            'text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-500'
          )}
        />
        <Button size="sm" onClick={handleApply}>
          Aplicar
        </Button>
      </div>

      {inputValue && (
        <div className="relative">
          <img
            src={inputValue}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
