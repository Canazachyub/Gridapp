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
        'px-4 py-3',
        'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]',
        className
      )}
    >
      {/* Barra de progreso */}
      <div className="mb-3">
        <ProgressBar value={progress} size="sm" />
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Boton anterior */}
        <button
          onClick={onPrevious}
          disabled={isFirst}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg',
            'font-medium transition-all',
            'text-slate-700 dark:text-slate-300',
            'hover:bg-slate-100 dark:hover:bg-slate-800',
            'disabled:opacity-30 disabled:cursor-not-allowed'
          )}
        >
          <ChevronLeft size={20} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Centro: contador + acciones */}
        <div className="flex items-center gap-4">
          {/* Botones de accion */}
          <div className="hidden sm:flex gap-2">
            <button
              onClick={onRevealAll}
              className="p-2 text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Revelar todo (Espacio)"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={onReset}
              className="p-2 text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Reiniciar (R)"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Contador */}
          <div className="flex flex-col items-center">
            <span className="font-mono font-bold text-lg text-slate-800 dark:text-white">
              {currentIndex + 1}
              <span className="text-slate-400 mx-1">/</span>
              {totalCards}
            </span>
          </div>
        </div>

        {/* Boton siguiente */}
        <button
          onClick={onNext}
          disabled={isLast}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg',
            'font-medium transition-all',
            'bg-primary-600 hover:bg-primary-700 text-white',
            'shadow-lg hover:shadow-primary-500/30',
            'disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:shadow-none disabled:cursor-not-allowed'
          )}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Indicador de atajos (movil) */}
      <div className="flex sm:hidden justify-center gap-4 mt-3 text-xs text-slate-400">
        <span>← → Navegar</span>
        <span>Espacio: Revelar</span>
      </div>
    </div>
  );
}

export default NavigationBar;
