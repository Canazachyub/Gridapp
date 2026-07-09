import { useState, useCallback, useEffect } from 'react';
import type { Topic, Card, StudyProgress, ColumnConfig } from '../types';
import { storage } from '../services/storage';
import { detectMemoryRole } from '../utils/helpers';
import type { StudyMode } from '../utils/constants';

interface UseStudySessionReturn {
  // Estado
  currentIndex: number;
  totalCards: number;
  currentCard: Card | null;
  revealedCells: Set<string>;
  studyMode: StudyMode;
  isComplete: boolean;
  progress: StudyProgress | null;

  // Navegacion
  goToNext: () => void;
  goToPrevious: () => void;
  goToCard: (index: number) => void;

  // Interaccion
  revealCell: (columnName: string) => void;
  toggleCell: (columnName: string, revealed: boolean) => void;
  revealAllCells: () => void;
  resetCurrentCard: () => void;
  resetSession: () => void;
  setStudyMode: (mode: StudyMode) => void;

  // Progreso
  getProgressPercentage: () => number;
  getViewedPercentage: () => number;
}

export function useStudySession(
  topic: Topic | null,
  cards: Card[],
  overrideColumns?: ColumnConfig[]
): UseStudySessionReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set([0]));
  const [progress, setProgress] = useState<StudyProgress | null>(null);
  const [studyMode, setStudyModeState] = useState<StudyMode>('learn');

  const totalCards = cards.length;
  const currentCard = cards[currentIndex] || null;
  const isComplete = viewedCards.size === totalCards && totalCards > 0;

  // Usar columnas override si se proporcionan (ej. headers recien cargados de la API)
  const effectiveColumns = overrideColumns && overrideColumns.length > 0
    ? overrideColumns
    : topic?.columns || [];

  // Helper: obtener columnas a revelar segun el modo de estudio
  const getDefaultRevealedForMode = useCallback((mode: StudyMode): Set<string> => {
    if (effectiveColumns.length === 0) return new Set();

    switch (mode) {
      case 'learn':
        return new Set(effectiveColumns.map(c => c.name));
      case 'recall':
        return new Set(
          effectiveColumns
            .filter(c => {
              const role = detectMemoryRole(c.name);
              return role === 'concept' || role === 'question';
            })
            .map(c => c.name)
        );
      case 'test':
        return new Set(
          effectiveColumns
            .filter(c => detectMemoryRole(c.name) === 'question')
            .map(c => c.name)
        );
      default:
        return new Set();
    }
  }, [effectiveColumns]);



  // Revelar celdas por defecto segun modo al iniciar, cambiar de tema o cambiar columnas
  useEffect(() => {
    if (effectiveColumns.length > 0 && revealedCells.size === 0) {
      setRevealedCells(getDefaultRevealedForMode(studyMode));
    }
  }, [topic, effectiveColumns]); // Al cambiar de tema o columnas

  // Cambiar modo de estudio
  const setStudyMode = useCallback((mode: StudyMode) => {
    setStudyModeState(mode);
    setRevealedCells(getDefaultRevealedForMode(mode));
  }, [getDefaultRevealedForMode]);

  // Cargar progreso guardado
  useEffect(() => {
    if (topic) {
      const savedProgress = storage.getStudyProgress(topic.id);
      if (savedProgress) {
        setProgress(savedProgress);
        setViewedCards(new Set(savedProgress.viewedCards));

        // Restaurar celdas reveladas
        if (savedProgress.revealedCells && savedProgress.revealedCells[currentIndex]) {
          setRevealedCells(new Set(savedProgress.revealedCells[currentIndex]));
        }
      }
    }
  }, [topic, currentIndex]);

  // Guardar progreso
  const saveProgress = useCallback(() => {
    if (!topic) return;

    const revealedCellsObj: Record<number, string[]> = {};
    if (currentCard) {
      revealedCellsObj[currentCard.id] = Array.from(revealedCells);
    }

    const newProgress: StudyProgress = {
      topicId: topic.id,
      totalCards,
      viewedCards: Array.from(viewedCards),
      revealedCells: revealedCellsObj,
      completionPercentage: (viewedCards.size / totalCards) * 100
    };

    storage.saveStudyProgress(newProgress);
    setProgress(newProgress);
  }, [topic, totalCards, viewedCards, revealedCells, currentCard]);

  // Navegar a la siguiente tarjeta
  const goToNext = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      saveProgress();
      setCurrentIndex(prev => prev + 1);
      setViewedCards(prev => new Set([...prev, currentIndex + 1]));
      setRevealedCells(getDefaultRevealedForMode(studyMode));
    }
  }, [currentIndex, totalCards, saveProgress, studyMode, getDefaultRevealedForMode]);

  // Navegar a la tarjeta anterior
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      saveProgress();
      setCurrentIndex(prev => prev - 1);
      setRevealedCells(getDefaultRevealedForMode(studyMode));
    }
  }, [currentIndex, saveProgress, studyMode, getDefaultRevealedForMode]);

  // Ir a una tarjeta especifica
  const goToCard = useCallback((index: number) => {
    if (index >= 0 && index < totalCards) {
      saveProgress();
      setCurrentIndex(index);
      setViewedCards(prev => new Set([...prev, index]));
      setRevealedCells(getDefaultRevealedForMode(studyMode));
    }
  }, [totalCards, saveProgress, studyMode, getDefaultRevealedForMode]);

  // Revelar una celda
  const revealCell = useCallback((columnName: string) => {
    setRevealedCells(prev => new Set([...prev, columnName]));
  }, []);

  // Alternar visibilidad de una celda (usado por tiles con estado propio)
  const toggleCell = useCallback((columnName: string, revealed: boolean) => {
    setRevealedCells(prev => {
      const next = new Set(prev);
      if (revealed) {
        next.add(columnName);
      } else {
        next.delete(columnName);
      }
      return next;
    });
  }, []);

  // Revelar todas las celdas de la tarjeta actual
  const revealAllCells = useCallback(() => {
    const allColumns = effectiveColumns.map(c => c.name);
    setRevealedCells(new Set(allColumns));
  }, [effectiveColumns]);

  // Resetear la tarjeta actual (vuelve al modo actual)
  const resetCurrentCard = useCallback(() => {
    setRevealedCells(getDefaultRevealedForMode(studyMode));
  }, [studyMode, getDefaultRevealedForMode]);

  // Resetear toda la sesion
  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setRevealedCells(getDefaultRevealedForMode(studyMode));
    setViewedCards(new Set([0]));

    if (topic) {
      storage.clearStudyProgress(topic.id);
    }
  }, [topic, studyMode, getDefaultRevealedForMode]);

  // Calcular porcentaje de progreso
  const getProgressPercentage = useCallback(() => {
    if (totalCards === 0) return 0;
    return Math.round(((currentIndex + 1) / totalCards) * 100);
  }, [currentIndex, totalCards]);

  // Calcular porcentaje de tarjetas vistas
  const getViewedPercentage = useCallback(() => {
    if (totalCards === 0) return 0;
    return Math.round((viewedCards.size / totalCards) * 100);
  }, [viewedCards, totalCards]);

  return {
    currentIndex,
    totalCards,
    currentCard,
    revealedCells,
    studyMode,
    isComplete,
    progress,
    goToNext,
    goToPrevious,
    goToCard,
    revealCell,
    toggleCell,
    revealAllCells,
    resetCurrentCard,
    resetSession,
    setStudyMode,
    getProgressPercentage,
    getViewedPercentage
  };
}

export default useStudySession;
