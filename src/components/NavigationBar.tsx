import { ChevronLeft, ChevronRight, RotateCcw, Eye } from 'lucide-react';
import { cn } from '../utils/helpers';
import { ProgressBar } from './ui/Progress';

// ============================================================================
// TIPOS
// ============================================================================

interface NavigationBarProps {
  currentIndex: number;
  totalCards: number;
  onPrevious: () => void;
  onNext: () => void;
  onRevealAll: () => void;
  onReset: () => void;
  className?: string;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function NavigationBar({
  currentIndex,
  totalCards,
  onPrevious,
  onNext,
  onRevealAll,
  onReset,
  className
}: NavigationBarProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalCards - 1;
  const progress = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800',
        'px-3 sm:px-4 py-2 sm:py-3',
        'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]',
        className
      )}
    >
      {/* Barra de progreso */}
      <div className="mb-2 sm:mb-3">
        <ProgressBar value={progress} size="sm" />
      </div>

      {/* Fila principal: navegación */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Boton anterior */}
        <button
          onClick={onPrevious}
          disabled={isFirst}
          className={cn(
            'flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg',
            'font-medium transition-all text-sm sm:text-base',
            'text-slate-700 dark:text-slate-300',
            'hover:bg-slate-100 dark:hover:bg-slate-800',
            'disabled:opacity-30 disabled:cursor-not-allowed'
          )}
        >
          <ChevronLeft className="w-5 h-5 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Centro: contador */}
        <div className="flex flex-col items-center">
          <span className="font-mono font-bold text-base sm:text-lg text-slate-800 dark:text-white">
            {currentIndex + 1}
            <span className="text-slate-400 mx-1">/</span>
            {totalCards}
          </span>
        </div>

        {/* Boton siguiente */}
        <button
          onClick={onNext}
          disabled={isLast}
          className={cn(
            'flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg',
            'font-medium transition-all text-sm sm:text-base',
            'bg-primary-600 hover:bg-primary-700 text-white',
            'shadow-lg hover:shadow-primary-500/30',
            'disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:shadow-none disabled:cursor-not-allowed'
          )}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-5 h-5 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Fila de acciones - VISIBLE EN MÓVIL */}
      <div className="flex justify-center gap-3 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onRevealAll}
          className={cn(
            'flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg',
            'text-xs sm:text-sm font-medium',
            'text-primary-600 dark:text-primary-400',
            'bg-primary-50 dark:bg-primary-900/30',
            'hover:bg-primary-100 dark:hover:bg-primary-900/50',
            'transition-colors'
          )}
        >
          <Eye className="w-4 h-4" />
          <span>Revelar</span>
          <kbd className="hidden sm:inline ml-1 px-1.5 py-0.5 bg-primary-100 dark:bg-primary-800 rounded text-[10px]">
            Espacio
          </kbd>
        </button>
        <button
          onClick={onReset}
          className={cn(
            'flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg',
            'text-xs sm:text-sm font-medium',
            'text-slate-600 dark:text-slate-400',
            'bg-slate-100 dark:bg-slate-800',
            'hover:bg-slate-200 dark:hover:bg-slate-700',
            'transition-colors'
          )}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Ocultar</span>
          <kbd className="hidden sm:inline ml-1 px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">
            R
          </kbd>
        </button>
      </div>
    </div>
  );
}

export default NavigationBar;
