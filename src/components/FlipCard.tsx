import { useState, useEffect } from 'react';
import { Eye, Image as ImageIcon, Calculator, Sparkles } from 'lucide-react';
import type { ColumnType } from '../types';
import { cn } from '../utils/helpers';

// ============================================================================
// COLORES ESTILO GOOGLE (Material Design)
// ============================================================================

const GOOGLE_COLORS = [
  { // Azul Google
    front: 'from-blue-500 to-blue-600',
    back: 'border-blue-500',
    label: 'bg-blue-500 text-white',
    accent: 'from-blue-500 to-blue-600',
    icon: 'text-blue-100',
    text: 'text-blue-600'
  },
  { // Rojo Google
    front: 'from-red-500 to-red-600',
    back: 'border-red-500',
    label: 'bg-red-500 text-white',
    accent: 'from-red-500 to-red-600',
    icon: 'text-red-100',
    text: 'text-red-600'
  },
  { // Amarillo Google
    front: 'from-amber-400 to-amber-500',
    back: 'border-amber-500',
    label: 'bg-amber-500 text-white',
    accent: 'from-amber-400 to-amber-500',
    icon: 'text-amber-100',
    text: 'text-amber-600'
  },
  { // Verde Google
    front: 'from-green-500 to-green-600',
    back: 'border-green-500',
    label: 'bg-green-500 text-white',
    accent: 'from-green-500 to-green-600',
    icon: 'text-green-100',
    text: 'text-green-600'
  },
  { // Morado
    front: 'from-purple-500 to-purple-600',
    back: 'border-purple-500',
    label: 'bg-purple-500 text-white',
    accent: 'from-purple-500 to-purple-600',
    icon: 'text-purple-100',
    text: 'text-purple-600'
  },
  { // Cyan
    front: 'from-cyan-500 to-cyan-600',
    back: 'border-cyan-500',
    label: 'bg-cyan-500 text-white',
    accent: 'from-cyan-500 to-cyan-600',
    icon: 'text-cyan-100',
    text: 'text-cyan-600'
  }
];

// ============================================================================
// TIPOS
// ============================================================================

interface FlipCardProps {
  content: string;
  type: ColumnType;
  label: string;
  colorIndex?: number;
  isRevealed?: boolean;
  onReveal?: () => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function FlipCard({
  content,
  type,
  label,
  colorIndex = 0,
  isRevealed = false,
  onReveal
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(isRevealed);
  const colors = GOOGLE_COLORS[colorIndex % GOOGLE_COLORS.length];

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

  return (
    <div
      className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] cursor-pointer group perspective-1000"
      onClick={handleClick}
    >
      <div
        className={cn(
          'relative w-full h-full duration-600 preserve-3d transition-transform ease-out',
          isFlipped && 'rotate-y-180'
        )}
      >
        {/* ========== CARA FRONTAL (OCULTA) ========== */}
        <div
          className={cn(
            'absolute w-full h-full backface-hidden rounded-2xl sm:rounded-3xl shadow-2xl',
            'flex flex-col items-center justify-center p-4 sm:p-6 md:p-8',
            'transition-all duration-300',
            'bg-gradient-to-br',
            colors.front,
            'hover:shadow-3xl hover:scale-[1.02]'
          )}
        >
          {/* Patron decorativo */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl">
            <div className="absolute -top-16 sm:-top-20 -right-16 sm:-right-20 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-8 sm:-bottom-10 -left-8 sm:-left-10 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full" />
          </div>

          {/* Etiqueta superior */}
          <div className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 right-3 sm:right-4 md:right-6">
            <span className="inline-block px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider sm:tracking-widest">
              {label}
            </span>
          </div>

          {/* Icono central grande */}
          <div className="relative z-10 mb-3 sm:mb-4 md:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              {type === 'image' ? (
                <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
              ) : type === 'formula' ? (
                <Calculator className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
              ) : (
                <Eye className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
              )}
            </div>
          </div>

          {/* Texto de accion */}
          <p className="relative z-10 text-white/90 font-semibold text-sm sm:text-base md:text-lg">
            Toca para revelar
          </p>

          {/* Indicador animado */}
          <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 flex gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* ========== CARA TRASERA (REVELADA) ========== */}
        <div
          className={cn(
            'absolute w-full h-full backface-hidden rotate-y-180 rounded-2xl sm:rounded-3xl',
            'flex flex-col overflow-hidden',
            'bg-white dark:bg-slate-900',
            'shadow-2xl border-2 sm:border-4',
            colors.back
          )}
        >
          {/* Barra superior con gradiente */}
          <div className={cn('h-1.5 sm:h-2 md:h-3 bg-gradient-to-r', colors.accent)} />

          {/* Header con label */}
          <div className="px-3 sm:px-4 md:px-6 pt-2 sm:pt-3 md:pt-5 pb-1 sm:pb-2 md:pb-3">
            <span className={cn(
              'inline-block px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest',
              colors.label
            )}>
              {label}
            </span>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-h-0 px-3 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6 overflow-y-auto custom-scrollbar">
            <div className="min-h-full flex items-center justify-center">
              {type === 'image' ? (
                <ImageContent content={content} />
              ) : type === 'formula' ? (
                <FormulaContent content={content} />
              ) : (
                <TextContent content={content} />
              )}
            </div>
          </div>

          {/* Footer con hint */}
          <div className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
            <p className="text-center text-xs sm:text-sm text-slate-400 font-medium">
              Toca para ocultar
            </p>
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
      <div className="text-center">
        <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-2 sm:mb-3" />
        <p className="text-slate-400 italic text-sm sm:text-base md:text-lg">Sin contenido</p>
      </div>
    );
  }

  // Ajustar tamaño de fuente según la longitud del contenido
  const getTextSize = () => {
    const length = content.length;
    if (length > 200) return 'text-sm sm:text-base md:text-lg lg:text-xl';
    if (length > 100) return 'text-base sm:text-lg md:text-xl lg:text-2xl';
    if (length > 50) return 'text-lg sm:text-xl md:text-2xl lg:text-3xl';
    return 'text-xl sm:text-2xl md:text-3xl lg:text-4xl';
  };

  return (
    <p className={cn(
      'text-center font-semibold text-slate-800 dark:text-slate-100 leading-relaxed w-full',
      getTextSize()
    )}>
      {content}
    </p>
  );
}

function ImageContent({ content }: { content: string }) {
  if (!content) {
    return (
      <div className="flex flex-col items-center text-slate-400">
        <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mb-2 sm:mb-3 opacity-50" />
        <span className="text-sm sm:text-base md:text-lg">Sin imagen</span>
      </div>
    );
  }

  return (
    <img
      src={content}
      alt="Contenido visual"
      className="max-w-full max-h-full object-contain rounded-xl sm:rounded-2xl shadow-lg"
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
      <div className="text-center">
        <Calculator className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-2 sm:mb-3" />
        <p className="text-slate-400 italic text-sm sm:text-base md:text-lg">Sin formula</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'font-mono text-lg sm:text-xl md:text-2xl lg:text-3xl text-center font-bold',
        'text-slate-800 dark:text-slate-100',
        'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900',
        'p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl w-full',
        'border-2 border-slate-200 dark:border-slate-700',
        'shadow-inner'
      )}
    >
      {content}
    </div>
  );
}

// ============================================================================
// WRAPPER CON COLORES AUTOMATICOS
// ============================================================================

interface ColoredFlipCardProps extends Omit<FlipCardProps, 'colorIndex'> {
  index: number;
}

export function ColoredFlipCard({ index, ...props }: ColoredFlipCardProps) {
  return <FlipCard {...props} colorIndex={index} />;
}

export default FlipCard;
