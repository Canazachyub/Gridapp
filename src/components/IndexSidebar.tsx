import React from 'react';
import { X } from 'lucide-react';
import type { Card, ColumnConfig } from '../types';
import { cn } from '../utils/helpers';
import { IconButton } from './ui/Button';

// ============================================================================
// TIPOS
// ============================================================================

interface IndexSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  columns: ColumnConfig[];
  currentIndex: number;
  onSelectCard: (index: number) => void;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function IndexSidebar({
  isOpen,
  onClose,
  cards,
  columns,
  currentIndex,
  onSelectCard
}: IndexSidebarProps) {
  // Obtener el nombre de la primera columna para mostrar como titulo
  const firstColumn = columns[0];

  const handleSelect = (index: number) => {
    onSelectCard(index);
    // Cerrar en movil
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para movil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50',
          'w-72 bg-white dark:bg-slate-900',
          'border-r border-slate-200 dark:border-slate-800',
          'shadow-2xl',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">
              Indice
            </h3>
            <p className="text-xs text-slate-500">
              {cards.length} tarjetas
            </p>
          </div>
          <IconButton
            icon={<X size={18} />}
            onClick={onClose}
            label="Cerrar indice"
          />
        </div>

        {/* Lista de cards */}
        <div className="overflow-y-auto h-[calc(100%-65px)] p-2">
          {cards.length === 0 ? (
            <p className="text-center text-slate-400 py-8">
              No hay tarjetas
            </p>
          ) : (
            <div className="space-y-1">
              {cards.map((card, index) => {
                const firstContent = firstColumn
                  ? card.cells[firstColumn.name]
                  : `Tarjeta ${index + 1}`;

                return (
                  <button
                    key={card.id}
                    onClick={() => handleSelect(index)}
                    className={cn(
                      'w-full text-left px-3 py-3 rounded-lg',
                      'flex items-center gap-3',
                      'transition-colors',
                      index === currentIndex
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-l-4 border-primary-500'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs font-mono w-6',
                        index === currentIndex
                          ? 'text-primary-500'
                          : 'text-slate-400'
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 truncate text-sm">
                      {firstContent || 'Sin titulo'}
                    </span>
                    {index === currentIndex && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer con atajos */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs text-slate-400 text-center">
            Presiona <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">I</kbd> para abrir/cerrar
          </p>
        </div>
      </div>
    </>
  );
}

export default IndexSidebar;
