import { Folder as FolderIcon, ChevronRight, Trash2, MoreVertical } from 'lucide-react';
import type { Folder } from '../types';
import { cn } from '../utils/helpers';
import { useState } from 'react';

// ============================================================================
// COLORES PARA CARPETAS
// ============================================================================

const FOLDER_COLORS = [
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', light: 'bg-blue-100 dark:bg-blue-900/30' },
  { bg: 'bg-red-500', hover: 'hover:bg-red-600', light: 'bg-red-100 dark:bg-red-900/30' },
  { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', light: 'bg-amber-100 dark:bg-amber-900/30' },
  { bg: 'bg-green-500', hover: 'hover:bg-green-600', light: 'bg-green-100 dark:bg-green-900/30' },
  { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', light: 'bg-purple-100 dark:bg-purple-900/30' },
  { bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600', light: 'bg-cyan-100 dark:bg-cyan-900/30' },
];

// ============================================================================
// TIPOS
// ============================================================================

interface FolderCardProps {
  folder: Folder;
  colorIndex?: number;
  onSelect: (folder: Folder) => void;
  onDelete?: (folderId: string) => void;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function FolderCard({
  folder,
  colorIndex = 0,
  onSelect,
  onDelete
}: FolderCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const colors = FOLDER_COLORS[colorIndex % FOLDER_COLORS.length];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.(folder.id);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <div
      onClick={() => onSelect(folder)}
      className={cn(
        'relative group cursor-pointer',
        'bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl',
        'border-2 border-slate-200 dark:border-slate-700',
        'hover:border-primary-400 dark:hover:border-primary-500',
        'hover:shadow-lg hover:shadow-primary-500/10',
        'active:scale-[0.98]',
        'transition-all duration-200',
        'p-4 sm:p-5'
      )}
    >
      {/* Header con icono de carpeta */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={cn(
          'w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center',
          colors.light
        )}>
          <FolderIcon className={cn('w-5 h-5 sm:w-7 sm:h-7', colors.bg.replace('bg-', 'text-'))} />
        </div>

        {/* Menu de opciones */}
        {onDelete && (
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className={cn(
                'p-1.5 sm:p-2 rounded-lg sm:opacity-0 sm:group-hover:opacity-100',
                'hover:bg-slate-100 dark:hover:bg-slate-700',
                'transition-all'
              )}
            >
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </button>

            {showMenu && (
              <div className={cn(
                'absolute right-0 top-full mt-1 z-10',
                'bg-white dark:bg-slate-800',
                'border border-slate-200 dark:border-slate-700',
                'rounded-lg shadow-lg',
                'py-1 min-w-28 sm:min-w-32'
              )}>
                <button
                  onClick={handleDelete}
                  className={cn(
                    'w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm',
                    'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
                    'flex items-center gap-2'
                  )}
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nombre de la carpeta */}
      <h3 className="font-semibold text-base sm:text-lg text-slate-800 dark:text-white mb-1 truncate">
        {folder.name}
      </h3>

      {/* Conteo de temas */}
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3 sm:mb-4">
        {folder.topicCount} {folder.topicCount === 1 ? 'tema' : 'temas'}
      </p>

      {/* Preview de temas */}
      {folder.topics.length > 0 && (
        <div className="space-y-1">
          {folder.topics.slice(0, 3).map((topic, idx) => (
            <div
              key={idx}
              className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate flex items-center gap-1"
            >
              <span className={cn('w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full flex-shrink-0', colors.bg)} />
              {topic.name}
            </div>
          ))}
          {folder.topics.length > 3 && (
            <div className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
              +{folder.topics.length - 3} más
            </div>
          )}
        </div>
      )}

      {/* Indicador de navegación */}
      <div className={cn(
        'absolute right-3 sm:right-4 bottom-3 sm:bottom-4',
        'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center',
        'bg-slate-100 dark:bg-slate-700',
        'group-hover:bg-primary-500 group-hover:text-white',
        'transition-all'
      )}>
        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-white" />
      </div>
    </div>
  );
}

// ============================================================================
// CARPETA PARA TEMAS SIN CATEGORIZAR
// ============================================================================

interface UncategorizedCardProps {
  topicCount: number;
  onSelect: () => void;
}

export function UncategorizedCard({ topicCount, onSelect }: UncategorizedCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'relative group cursor-pointer',
        'bg-slate-50 dark:bg-slate-900 rounded-xl sm:rounded-2xl',
        'border-2 border-dashed border-slate-300 dark:border-slate-600',
        'hover:border-slate-400 dark:hover:border-slate-500',
        'hover:shadow-md',
        'active:scale-[0.98]',
        'transition-all duration-200',
        'p-4 sm:p-5'
      )}
    >
      <div className="flex items-start mb-3 sm:mb-4">
        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center bg-slate-200 dark:bg-slate-700">
          <FolderIcon className="w-5 h-5 sm:w-7 sm:h-7 text-slate-400" />
        </div>
      </div>

      <h3 className="font-semibold text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-1">
        Sin Categoría
      </h3>

      <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
        {topicCount} {topicCount === 1 ? 'tema' : 'temas'}
      </p>

      <div className={cn(
        'absolute right-3 sm:right-4 bottom-3 sm:bottom-4',
        'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center',
        'bg-slate-200 dark:bg-slate-700',
        'group-hover:bg-slate-400 group-hover:text-white',
        'transition-all'
      )}>
        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-white" />
      </div>
    </div>
  );
}

export default FolderCard;
