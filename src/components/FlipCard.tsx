import React, { useState, useEffect } from 'react';
import { Eye, Image as ImageIcon, Calculator } from 'lucide-react';
import type { ColumnType } from '../types';
import { cn } from '../utils/helpers';
import { COLUMN_TYPE_COLORS } from '../utils/constants';

// ============================================================================
// TIPOS
// ============================================================================

interface FlipCardProps {
  content: string;
  type: ColumnType;
  label: string;
  isRevealed?: boolean;
  onReveal?: () => void;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function FlipCard({
  content,
  type,
  label,
  isRevealed = false,
  onReveal
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(isRevealed);

  // Sincronizar con prop externa
  useEffect(() => {
    setIsFlipped(isRevealed);
  }, [isRevealed]);

  const handleClick = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      onReveal?.();
    } else {
      setIsFlipped(false);
    }
  };

  const colors = COLUMN_TYPE_COLORS[type];

  return (
    <div
      className="relative w-full h-64 md:h-72 lg:h-80 cursor-pointer group perspective-1000"
      onClick={handleClick}
    >
      <div
        className={cn(
          'relative w-full h-full duration-500 preserve-3d transition-transform',
          isFlipped && 'rotate-y-180'
        )}
      >
        {/* CARA FRONTAL (OCULTA) */}
        <div
          className={cn(
            'absolute w-full h-full backface-hidden rounded-2xl shadow-lg',
            'flex flex-col items-center justify-center p-6',
            'transition-all hover:shadow-xl',
            'border-2 bg-gradient-to-br',
            colors.bg,
            isFlipped ? 'border-slate-200 dark:border-slate-700' : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500'
          )}
        >
          {/* Etiqueta de tipo */}
          <div
            className={cn(
              'absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider',
              colors.bg,
              colors.text
            )}
          >
            {label}
          </div>

          {/* Icono segun tipo */}
          <div className="mb-4">
            {type === 'image' ? (
              <ImageIcon className="w-16 h-16 text-slate-300 dark:text-slate-600" />
            ) : type === 'formula' ? (
              <Calculator className="w-16 h-16 text-slate-300 dark:text-slate-600" />
            ) : (
              <Eye className="w-16 h-16 text-slate-300 dark:text-slate-600" />
            )}
          </div>

          <p className="text-slate-400 dark:text-slate-500 font-medium text-sm text-center">
            Toca para revelar
          </p>

          {/* Indicador de interactividad */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-pulse" />
              <span className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-pulse delay-100" />
              <span className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-pulse delay-200" />
            </div>
          </div>
        </div>

        {/* CARA TRASERA (REVELADA) */}
        <div
          className={cn(
            'absolute w-full h-full backface-hidden rotate-y-180 rounded-2xl shadow-xl',
            'flex flex-col p-6 overflow-hidden',
            'bg-white dark:bg-slate-900',
            'border-2 border-primary-500'
          )}
        >
          {/* Barra superior de color */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-500 to-primary-600" />

          {/* Etiqueta */}
          <span
            className={cn(
              'text-xs font-bold uppercase mb-4 tracking-wider',
              colors.text
            )}
          >
            {label}
          </span>

          {/* Contenido */}
          <div className="flex-1 flex items-center justify-center w-full overflow-y-auto custom-scrollbar">
            {type === 'image' ? (
              <ImageContent content={content} />
            ) : type === 'formula' ? (
              <FormulaContent content={content} />
            ) : (
              <TextContent content={content} />
            )}
          </div>

          {/* Indicador de flip */}
          <div className="absolute bottom-3 right-3 text-xs text-slate-400">
            Toca para ocultar
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONTENIDO POR TIPO
// ============================================================================

function TextContent({ content }: { content: string }) {
  if (!content) {
    return (
      <p className="text-slate-400 italic text-center">Sin contenido</p>
    );
  }

  return (
    <p className="text-center font-medium text-slate-800 dark:text-slate-100 text-lg md:text-xl leading-relaxed">
      {content}
    </p>
  );
}

function ImageContent({ content }: { content: string }) {
  if (!content) {
    return (
      <div className="flex flex-col items-center text-slate-400">
        <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
        <span className="text-sm">Sin imagen</span>
      </div>
    );
  }

  return (
    <img
      src={content}
      alt="Contenido visual"
      className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
      }}
    />
  );
}

function FormulaContent({ content }: { content: string }) {
  if (!content) {
    return (
      <p className="text-slate-400 italic text-center">Sin formula</p>
    );
  }

  return (
    <div
      className={cn(
        'font-mono text-xl md:text-2xl text-center font-bold',
        'text-slate-800 dark:text-slate-100',
        'bg-slate-50 dark:bg-slate-800',
        'p-4 rounded-lg w-full',
        'border border-slate-200 dark:border-slate-700',
        'shadow-inner'
      )}
    >
      {content}
    </div>
  );
}

// ============================================================================
// MINI FLIP CARD (para vistas de preview)
// ============================================================================

interface MiniFlipCardProps {
  content: string;
  type: ColumnType;
  label: string;
}

export function MiniFlipCard({ content, type, label }: MiniFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const colors = COLUMN_TYPE_COLORS[type];

  return (
    <div
      className="relative w-full h-24 cursor-pointer group perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          'relative w-full h-full duration-300 preserve-3d transition-transform',
          isFlipped && 'rotate-y-180'
        )}
      >
        {/* Front */}
        <div
          className={cn(
            'absolute w-full h-full backface-hidden rounded-lg',
            'flex items-center justify-center p-3',
            'border',
            colors.bg,
            colors.border
          )}
        >
          <span className="text-xs text-slate-400">{label}</span>
        </div>

        {/* Back */}
        <div
          className={cn(
            'absolute w-full h-full backface-hidden rotate-y-180 rounded-lg',
            'flex items-center justify-center p-3',
            'bg-white dark:bg-slate-800 border border-primary-300'
          )}
        >
          <p className="text-sm text-slate-700 dark:text-slate-300 text-center truncate">
            {content || 'Vacio'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default FlipCard;
