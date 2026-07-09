import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, List, Keyboard, Clock } from 'lucide-react';
import type { Card, ColumnConfig } from '../types';
import { useApp } from '../contexts/AppContext';
import { useStudySession } from '../hooks/useStudySession';
import { useStudyKeyboard } from '../hooks/useKeyboard';
import { api } from '../services/api';
import { cn, detectMemoryRole } from '../utils/helpers';
import { STUDY_MODES, KEYBOARD_SHORTCUTS } from '../utils/constants';
import type { StudyMode } from '../utils/constants';
import { IconButton } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { StudyGrid } from '../components/StudyGrid';
import { ClassicFlashcard } from '../components/ClassicFlashcard';
import { IndexSidebar } from '../components/IndexSidebar';
import { NavigationBar } from '../components/NavigationBar';
import { Modal } from '../components/ui/Modal';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function StudyMode() {
  const { currentTopic, setView, initialCardIndex, clearInitialCardIndex } = useApp();

  const [cards, setCards] = useState<Card[]>([]);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [pendingCardIndex, setPendingCardIndex] = useState<number | null>(null);
  const [classicFlipped, setClassicFlipped] = useState(false);

  // Hook de sesion de estudio
  const {
    currentIndex,
    totalCards,
    currentCard,
    revealedCells,
    studyMode,
    goToNext,
    goToPrevious,
    goToCard,
    toggleCell,
    revealAllCells,
    resetCurrentCard,
    setStudyMode
  } = useStudySession(currentTopic, cards, columns);

  // Extraer metadato de sesión/bloque si existe
  const metadataColumn = columns.find(col => detectMemoryRole(col.name) === 'metadata');
  const metadataValue = metadataColumn && currentCard
    ? currentCard.cells[metadataColumn.name]
    : null;

  // Resetear flip clásico al cambiar de tarjeta
  useEffect(() => {
    setClassicFlipped(false);
  }, [currentIndex]);

  // Cargar cards y columnas desde la API
  useEffect(() => {
    async function loadCards() {
      if (!currentTopic) return;

      setLoadingCards(true);
      try {
        if (api.isConfigured()) {
          const response = await api.getCards(currentTopic.name);
          setCards(response.cards || []);

          if (response.headers && response.headers.length > 0) {
            setColumns(response.headers);
          } else {
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

  // Capturar el índice inicial de tarjeta (desde búsqueda)
  useEffect(() => {
    if (initialCardIndex !== null) {
      setPendingCardIndex(initialCardIndex);
      clearInitialCardIndex();
    }
  }, [initialCardIndex, clearInitialCardIndex]);

  // Navegar a la tarjeta específica cuando las cards estén cargadas
  useEffect(() => {
    if (!loadingCards && pendingCardIndex !== null && cards.length > 0) {
      if (pendingCardIndex >= 0 && pendingCardIndex < cards.length) {
        goToCard(pendingCardIndex);
      }
      setPendingCardIndex(null);
    }
  }, [loadingCards, pendingCardIndex, cards.length, goToCard]);

  // Volver al dashboard
  const handleBack = useCallback(() => {
    setView('dashboard');
  }, [setView]);

  // Toggle indice
  const toggleIndex = useCallback(() => {
    setIsIndexOpen(prev => !prev);
  }, []);

  // Cambiar modo de estudio
  const handleModeChange = useCallback((mode: StudyMode) => {
    setStudyMode(mode);
    setClassicFlipped(false);
  }, [setStudyMode]);

  // Voltear tarjeta en modo clásico
  const handleClassicFlip = useCallback(() => {
    setClassicFlipped(prev => !prev);
  }, []);

  // Revelar todo: en modo clásico, voltear la tarjeta
  const handleRevealAll = useCallback(() => {
    if (studyMode === 'classic') {
      setClassicFlipped(true);
    } else {
      revealAllCells();
    }
  }, [studyMode, revealAllCells]);

  // Atajos de teclado
  useStudyKeyboard(
    {
      onNext: goToNext,
      onPrevious: goToPrevious,
      onRevealAll: handleRevealAll,
      onReset: resetCurrentCard,
      onToggleIndex: toggleIndex,
      onEscape: handleBack,
      onModeLearn: () => handleModeChange('learn'),
      onModeRecall: () => handleModeChange('recall'),
      onModeTest: () => handleModeChange('test'),
      onModeClassic: () => handleModeChange('classic')
    },
    !showShortcuts && !loadingCards
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

  return (
    <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-950">
      {/* Header compacto */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-2 z-20">
        <div className="flex items-center justify-between gap-3">
          {/* Izquierda: volver + título */}
          <div className="flex items-center gap-2 min-w-0">
            <IconButton
              icon={<ArrowLeft size={18} />}
              onClick={handleBack}
              label="Volver (Esc)"
            />
            <div className="min-w-0">
              <h1 className="font-bold text-slate-900 dark:text-white text-sm md:text-base line-clamp-1">
                {currentTopic.displayName || currentTopic.name}
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500">
                <span>{currentIndex + 1} / {totalCards}</span>
                {metadataValue && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400">
                      <Clock size={10} />
                      <span className="line-clamp-1">{metadataValue}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Centro: selector de modo */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            {STUDY_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                  studyMode === mode.id
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )}
                title={mode.description}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Derecha: acciones */}
          <div className="flex items-center gap-1">
            <IconButton
              icon={<Keyboard size={18} />}
              onClick={() => setShowShortcuts(true)}
              label="Atajos"
              className="hidden sm:flex"
            />
            <button
              onClick={toggleIndex}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isIndexOpen
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <List size={16} />
              <span className="hidden sm:inline">Índice</span>
            </button>
          </div>
        </div>

        {/* Selector de modo en móvil */}
        <div className="flex sm:hidden items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 mt-2">
          {STUDY_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={cn(
                'flex-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all',
                studyMode === mode.id
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </header>

      {/* Area principal */}
      <div className="flex-1 relative overflow-hidden min-h-0">
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
            'h-full overflow-y-auto p-3 sm:p-4 md:p-6',
            'bg-gradient-to-br from-slate-50 to-slate-100',
            'dark:from-slate-950 dark:to-slate-900'
          )}
          onClick={() => isIndexOpen && setIsIndexOpen(false)}
        >
          {currentCard && columns.length > 0 && (
            <div className="w-full h-full max-w-7xl mx-auto">
              {studyMode === 'classic' ? (
                <ClassicFlashcardView
                  card={currentCard}
                  columns={columns}
                  isFlipped={classicFlipped}
                  onFlip={handleClassicFlip}
                  onNext={goToNext}
                  onPrevious={goToPrevious}
                />
              ) : (
                <StudyGrid
                  card={currentCard}
                  columns={columns}
                  revealedCells={revealedCells}
                  onToggleCell={toggleCell}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Barra de navegacion compacta */}
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
// VISTA FLASHCARD CLÁSICA
// ============================================================================

interface ClassicFlashcardViewProps {
  card: Card;
  columns: ColumnConfig[];
  isFlipped: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

function ClassicFlashcardView({
  card,
  columns,
  isFlipped,
  onFlip,
  onNext,
  onPrevious
}: ClassicFlashcardViewProps) {
  const questionCol = columns.find(c => detectMemoryRole(c.name) === 'question');
  const answerCol = columns.find(c => detectMemoryRole(c.name) === 'answer');

  const question = questionCol ? card.cells[questionCol.name] : '';
  const answer = answerCol ? card.cells[answerCol.name] : '';

  if (!questionCol || !answerCol) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg">
          <p className="text-slate-600 dark:text-slate-400">
            El modo Óptimo requiere columnas <strong>Pregunta</strong> y <strong>Respuesta</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClassicFlashcard
      question={question}
      answer={answer}
      isFlipped={isFlipped}
      onFlip={onFlip}
      onNext={onNext}
      onPrevious={onPrevious}
    />
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
          Tema vacío
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
