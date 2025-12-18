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
      className="relative w-full h-80 md:h-96 lg:h-[420px] cursor-pointer group perspective-1000"
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
            'absolute w-full h-full backface-hidden rounded-3xl shadow-2xl',
            'flex flex-col items-center justify-center p-8',
            'transition-all duration-300',
            'bg-gradient-to-br',
            colors.front,
            'hover:shadow-3xl hover:scale-[1.02]'
          )}
        >
          {/* Patron decorativo */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
          </div>

          {/* Etiqueta superior */}
          <div className="absolute top-6 left-6 right-6">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold uppercase tracking-widest">
              {label}
            </span>
          </div>

          {/* Icono central grande */}
          <div className="relative z-10 mb-6">
            <div className="w-24 h-24 md:w-28 md:h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              {type === 'image' ? (
                <ImageIcon className="w-12 h-12 md:w-14 md:h-14 text-white" />
              ) : type === 'formula' ? (
                <Calculator className="w-12 h-12 md:w-14 md:h-14 text-white" />
              ) : (
                <Eye className="w-12 h-12 md:w-14 md:h-14 text-white" />
              )}
            </div>
          </div>

          {/* Texto de accion */}
          <p className="relative z-10 text-white/90 font-semibold text-lg md:text-xl">
            Toca para revelar
          </p>

          {/* Indicador animado */}
          <div className="absolute bottom-6 flex gap-2">
            <span className="w-3 h-3 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-3 h-3 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-3 h-3 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* ========== CARA TRASERA (REVELADA) ========== */}
        <div
          className={cn(
            'absolute w-full h-full backface-hidden rotate-y-180 rounded-3xl',
            'flex flex-col overflow-hidden',
            'bg-white dark:bg-slate-900',
            'shadow-2xl border-4',
            colors.back
          )}
        >
          {/* Barra superior con gradiente */}
          <div className={cn('h-3 bg-gradient-to-r', colors.accent)} />

          {/* Header con label */}
          <div className="px-6 pt-5 pb-3">
            <span className={cn(
              'inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest',
              colors.label
            )}>
              {label}
            </span>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 flex items-center justify-center px-6 pb-6 overflow-y-auto custom-scrollbar">
            {type === 'image' ? (
              <ImageContent content={content} />
            ) : type === 'formula' ? (
              <FormulaContent content={content} />
            ) : (
              <TextContent content={content} />
            )}
          </div>

          {/* Footer con hint */}
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
            <p className="text-center text-sm text-slate-400 font-medium">
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
        <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-400 italic text-lg">Sin contenido</p>
      </div>
    );
  }

  return (
    <p className="text-center font-semibold text-slate-800 dark:text-slate-100 text-2xl md:text-3xl lg:text-4xl leading-relaxed">
      {content}
    </p>
  );
}

function ImageContent({ content }: { content: string }) {
  if (!content) {
    return (
      <div className="flex flex-col items-center text-slate-400">
        <ImageIcon className="w-16 h-16 mb-3 opacity-50" />
        <span className="text-lg">Sin imagen</span>
      </div>
    );
  }

  return (
    <img
      src={content}
      alt="Contenido visual"
      className="max-w-full max-h-full object-contain rounded-2xl shadow-lg"
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
        <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-400 italic text-lg">Sin formula</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'font-mono text-2xl md:text-3xl lg:text-4xl text-center font-bold',
        'text-slate-800 dark:text-slate-100',
        'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900',
        'p-6 rounded-2xl w-full',
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
