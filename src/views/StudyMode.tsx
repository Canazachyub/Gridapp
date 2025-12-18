import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, List, RotateCcw, Keyboard } from 'lucide-react';
import type { Card, ColumnConfig } from '../types';
import { useApp } from '../contexts/AppContext';
import { useStudySession } from '../hooks/useStudySession';
import { useStudyKeyboard } from '../hooks/useKeyboard';
import { api } from '../services/api';
import { cn } from '../utils/helpers';
import { getGridCols, KEYBOARD_SHORTCUTS } from '../utils/constants';
import { IconButton } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { FlipCard } from '../components/FlipCard';
import { IndexSidebar } from '../components/IndexSidebar';
import { NavigationBar } from '../components/NavigationBar';
import { Modal } from '../components/ui/Modal';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function StudyMode() {
  const { currentTopic, setView } = useApp();

  const [cards, setCards] = useState<Card[]>([]);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Hook de sesion de estudio
  const {
    currentIndex,
    totalCards,
    currentCard,
    revealedCells,
    goToNext,
    goToPrevious,
    goToCard,
    revealCell,
    revealAllCells,
    resetCurrentCard,
    resetSession
  } = useStudySession(currentTopic, cards);

  // Cargar cards y columnas desde la API
  useEffect(() => {
    async function loadCards() {
      if (!currentTopic) return;

      setLoadingCards(true);
      try {
        if (api.isConfigured()) {
          const response = await api.getCards(currentTopic.name);
          console.log('=== DEBUG API Response ===');
          console.log('Full response:', response);
          console.log('Headers:', response.headers);
          console.log('Headers count:', response.headers?.length);
          console.log('Cards:', response.cards);
          console.log('Cards count:', response.cards?.length);
          console.log('First header:', response.headers?.[0]);
          console.log('First card:', response.cards?.[0]);
          console.log('=========================');

          setCards(response.cards || []);

          // Usar las columnas de la respuesta (headers reales de la hoja)
          if (response.headers && response.headers.length > 0) {
            console.log('Setting columns from headers:', response.headers.length);
            setColumns(response.headers);
          } else {
            console.log('Fallback to topic columns:', currentTopic.columns?.length);
            setColumns(currentTopic.columns || []);
          }
        } else {
          setCards(currentTopic.cards || []);
          setColumns(currentTopic.columns || []);
        }
      } catch (error) {
        console.error('Error loading cards:', error);
        setCards(currentTopic.cards || []);
        setColumns(currentTopic.columns || []);
      } finally {
        setLoadingCards(false);
      }
    }

    loadCards();
  }, [currentTopic]);

  // Volver al dashboard
  const handleBack = useCallback(() => {
    setView('dashboard');
  }, [setView]);

  // Toggle indice
  const toggleIndex = useCallback(() => {
    setIsIndexOpen(prev => !prev);
  }, []);

  // Atajos de teclado
  useStudyKeyboard(
    {
      onNext: goToNext,
      onPrevious: goToPrevious,
      onRevealAll: revealAllCells,
      onReset: resetCurrentCard,
      onToggleIndex: toggleIndex,
      onEscape: handleBack
    },
    !showShortcuts && !loadingCards // Desactivar si modal abierto
  );

  if (!currentTopic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-500">No hay tema seleccionado</p>
      </div>
    );
  }

  if (loadingCards) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-slate-500 mt-4">Cargando tarjetas...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return <EmptyStudyState topicName={currentTopic.name} onBack={handleBack} />;
  }

  // Usar las columnas del estado (cargadas de la API)
  const gridCols = getGridCols(columns.length);

  return (
    <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconButton
              icon={<ArrowLeft size={20} />}
              onClick={handleBack}
              label="Volver (Esc)"
            />
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-sm md:text-base line-clamp-1">
                {currentTopic.name}
              </h1>
              <p className="text-xs text-slate-500">Modo estudio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Atajos */}
            <IconButton
              icon={<Keyboard size={18} />}
              onClick={() => setShowShortcuts(true)}
              label="Ver atajos"
              className="hidden sm:flex"
            />

            {/* Reiniciar */}
            <IconButton
              icon={<RotateCcw size={18} />}
              onClick={resetSession}
              label="Reiniciar sesion"
            />

            {/* Indice */}
            <button
              onClick={toggleIndex}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                isIndexOpen
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <List size={18} />
              <span className="hidden sm:inline">Indice</span>
            </button>
          </div>
        </div>
      </header>

      {/* Area principal */}
      <div className="flex-1 relative overflow-hidden">
        {/* Sidebar de indice */}
        <IndexSidebar
          isOpen={isIndexOpen}
          onClose={() => setIsIndexOpen(false)}
          cards={cards}
          columns={columns}
          currentIndex={currentIndex}
          onSelectCard={goToCard}
        />

        {/* Area de tarjetas */}
        <div
          className={cn(
            'h-full overflow-y-auto p-4 md:p-8',
            'flex items-center justify-center',
            'bg-gradient-to-br from-slate-50 to-slate-100',
            'dark:from-slate-950 dark:to-slate-900'
          )}
          onClick={() => isIndexOpen && setIsIndexOpen(false)}
        >
          {currentCard && columns.length > 0 && (
            <div className={cn('grid gap-4 md:gap-6 w-full max-w-6xl mx-auto', gridCols)}>
              {columns.map((col, colIndex) => {
                const cellContent = currentCard.cells[col.name] || '';
                const isRevealed = revealedCells.has(col.name);

                return (
                  <FlipCard
                    key={`card-${currentCard.id}-col-${colIndex}`}
                    label={col.name}
                    type={col.type || 'text'}
                    content={cellContent}
                    colorIndex={colIndex}
                    isRevealed={isRevealed}
                    onReveal={() => revealCell(col.name)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Barra de navegacion */}
      <NavigationBar
        currentIndex={currentIndex}
        totalCards={totalCards}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onRevealAll={revealAllCells}
        onReset={resetCurrentCard}
      />

      {/* Modal de atajos */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStudyStateProps {
  topicName: string;
  onBack: () => void;
}

function EmptyStudyState({ topicName, onBack }: EmptyStudyStateProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <List className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          Tema vacio
        </h2>
        <p className="text-slate-500 mb-6">
          "{topicName}" no tiene tarjetas. Agrega algunas para empezar a estudiar.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Volver al dashboard
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// KEYBOARD SHORTCUTS MODAL
// ============================================================================

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts = KEYBOARD_SHORTCUTS.study;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Atajos de teclado" size="sm">
      <div className="space-y-3">
        {Object.entries(shortcuts).map(([key, { key: shortcut, description }]) => (
          <div
            key={key}
            className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
          >
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {description}
            </span>
            <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-mono">
              {shortcut}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export default StudyMode;
