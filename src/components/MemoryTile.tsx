import { useState, useEffect, useCallback } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Brain,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  FileText,
  KeyRound,
  Clock,
  Maximize2,
  X
} from 'lucide-react';
import type { ColumnConfig } from '../types';
import { cn, detectMemoryRole, looksLikeImageUrl, type MemoryRole } from '../utils/helpers';
import { formatCellContent } from '../utils/formatText';
import { MEMORY_ROLE_COLORS, MEMORY_ROLE_LABELS } from '../utils/constants';

// ============================================================================
// ICONOS POR ROL
// ============================================================================

const ROLE_ICONS: Record<MemoryRole, React.ElementType> = {
  concept: Brain,
  question: HelpCircle,
  answer: CheckCircle2,
  mnemonic: Lightbulb,
  image: ImageIcon,
  keyword: KeyRound,
  metadata: Clock,
  generic: FileText
};

// ============================================================================
// TIPOS
// ============================================================================

interface MemoryTileProps {
  column: ColumnConfig;
  content: string;
  isRevealed?: boolean;
  onReveal?: (revealed: boolean) => void;
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function MemoryTile({
  column,
  content,
  isRevealed = false,
  onReveal,
  className
}: MemoryTileProps) {
  const role = detectMemoryRole(column.name);
  const colors = MEMORY_ROLE_COLORS[role];
  const Icon = ROLE_ICONS[role];
  const label = MEMORY_ROLE_LABELS[role] || column.name.toUpperCase();

  const [revealed, setRevealed] = useState(isRevealed);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setRevealed(isRevealed);
  }, [isRevealed]);

  const handleClick = useCallback(() => {
    const next = !revealed;
    setRevealed(next);
    onReveal?.(next);
  }, [revealed, onReveal]);

  const isImageContent = column.type === 'image' || looksLikeImageUrl(content);
  const hasContent = content && content.trim().length > 0;

  return (
    <>
      <div
        className={cn(
          'relative w-full h-full min-h-[140px] rounded-2xl overflow-hidden',
          'cursor-pointer select-none',
          'transition-all duration-300 ease-out',
          'shadow-lg hover:shadow-xl',
          'group',
          className
        )}
        onClick={handleClick}
      >
        {/* ---------- CARA OCULTA ---------- */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center p-4',
            'bg-gradient-to-br',
            colors.base,
            'transition-all duration-300',
            revealed && 'opacity-0 scale-95 pointer-events-none'
          )}
        >
          {/* Decoración circular */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full" />
          </div>

          {/* Badge del rol */}
          <div className="absolute top-3 left-3 right-3 flex justify-center">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              {label}
            </span>
          </div>

          {/* Icono central */}
          <div className="relative z-10 mt-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
          </div>

          {/* Hint */}
          <p className="relative z-10 mt-3 text-white/80 text-xs sm:text-sm font-medium">
            Toca para revelar
          </p>
        </div>

        {/* ---------- CARA REVELADA ---------- */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col overflow-hidden',
            'bg-white dark:bg-slate-900',
            'border-2 rounded-2xl',
            colors.border,
            'transition-all duration-300',
            !revealed && 'opacity-0 scale-95 pointer-events-none'
          )}
        >
          {/* Barra superior con color */}
          <div className={cn('h-1.5 bg-gradient-to-r', colors.base)} />

          {/* Header con badge */}
          <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <span className={cn(
              'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
              colors.label
            )}>
              {label}
            </span>
            {isImageContent && hasContent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxOpen(true);
                }}
                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                aria-label="Ampliar imagen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-h-0 p-3 overflow-y-auto custom-scrollbar">
            <TileContent
              content={content}
              type={column.type}
              isImage={isImageContent}
              imageError={imageError}
              imageLoaded={imageLoaded}
              onImageError={() => setImageError(true)}
              onImageLoad={() => setImageLoaded(true)}
            />
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
            <p className="text-center text-[10px] sm:text-xs text-slate-400 font-medium">
              Toca para ocultar
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox para imágenes */}
      {lightboxOpen && isImageContent && hasContent && (
        <ImageLightbox
          src={content.trim()}
          alt={label}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

// ============================================================================
// CONTENIDO DEL TILE
// ============================================================================

interface TileContentProps {
  content: string;
  type: string;
  isImage: boolean;
  imageError: boolean;
  imageLoaded: boolean;
  onImageError: () => void;
  onImageLoad: () => void;
}

function TileContent({
  content,
  type,
  isImage,
  imageError,
  imageLoaded,
  onImageError,
  onImageLoad
}: TileContentProps) {
  if (!content || content.trim().length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <Sparkles className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-sm italic">Sin contenido</span>
      </div>
    );
  }

  if (isImage) {
    if (imageError) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
          <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
          <p className="text-xs mb-2">No se pudo cargar la imagen</p>
          <a
            href={content.trim()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-primary-600 hover:underline break-all max-w-full px-2"
          >
            Ver imagen original
          </a>
        </div>
      );
    }

    return (
      <div className="h-full flex items-center justify-center relative">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-slate-300 animate-pulse" />
          </div>
        )}
        <img
          src={content.trim()}
          alt="Contenido visual"
          className={cn(
            'max-w-full max-h-full object-contain rounded-xl shadow-md transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onError={onImageError}
          onLoad={onImageLoad}
        />
      </div>
    );
  }

  if (type === 'formula') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="font-mono text-base sm:text-lg md:text-xl text-center font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 w-full">
          {content}
        </div>
      </div>
    );
  }

  // Texto normal con tamaño adaptativo
  const length = content.length;
  const textSize =
    length > 300 ? 'text-xs sm:text-sm' :
    length > 150 ? 'text-sm sm:text-base' :
    length > 60 ? 'text-base sm:text-lg' :
    'text-lg sm:text-xl md:text-2xl';

  return (
    <div className="h-full flex items-center justify-center">
      <div
        className={cn(
          'text-slate-800 dark:text-slate-100 leading-relaxed w-full',
          textSize
        )}
        dangerouslySetInnerHTML={{ __html: formatCellContent(content) }}
      />
    </div>
  );
}

// ============================================================================
// LIGHTBOX SIMPLE
// ============================================================================

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-full"
      >
        <X className="w-6 h-6" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export default MemoryTile;
