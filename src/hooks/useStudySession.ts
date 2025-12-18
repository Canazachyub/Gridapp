import { useState, useCallback, useEffect } from 'react';
import type { Topic, Card, StudyProgress } from '../types';
import { storage } from '../services/storage';

interface UseStudySessionReturn {
  // Estado
  currentIndex: number;
  totalCards: number;
  currentCard: Card | null;
  revealedCells: Set<string>;
  isComplete: boolean;
  progress: StudyProgress | null;

  // Navegacion
  goToNext: () => void;
  goToPrevious: () => void;
  goToCard: (index: number) => void;

  // Interaccion
  revealCell: (columnName: string) => void;
  revealAllCells: () => void;
  resetCurrentCard: () => void;
  resetSession: () => void;

  // Progreso
  getProgressPercentage: () => number;
  getViewedPercentage: () => number;
}

export function useStudySession(topic: Topic | null, cards: Card[]): UseStudySessionReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set([0]));
  const [progress, setProgress] = useState<StudyProgress | null>(null);

  const totalCards = cards.length;
  const currentCard = cards[currentIndex] || null;
  const isComplete = viewedCards.size === totalCards && totalCards > 0;

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
      setRevealedCells(new Set());
    }
  }, [currentIndex, totalCards, saveProgress]);

  // Navegar a la tarjeta anterior
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      saveProgress();
      setCurrentIndex(prev => prev - 1);
      setRevealedCells(new Set());
    }
  }, [currentIndex, saveProgress]);

  // Ir a una tarjeta especifica
  const goToCard = useCallback((index: number) => {
    if (index >= 0 && index < totalCards) {
      saveProgress();
      setCurrentIndex(index);
      setViewedCards(prev => new Set([...prev, index]));
      setRevealedCells(new Set());
    }
  }, [totalCards, saveProgress]);

  // Revelar una celda
  const revealCell = useCallback((columnName: string) => {
    setRevealedCells(prev => new Set([...prev, columnName]));
  }, []);

  // Revelar todas las celdas de la tarjeta actual
  const revealAllCells = useCallback(() => {
    if (!topic) return;
    const allColumns = topic.columns.map(c => c.name);
    setRevealedCells(new Set(allColumns));
  }, [topic]);

  // Resetear la tarjeta actual
  const resetCurrentCard = useCallback(() => {
    setRevealedCells(new Set());
  }, []);

  // Resetear toda la sesion
  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setRevealedCells(new Set());
    setViewedCards(new Set([0]));

    if (topic) {
      storage.clearStudyProgress(topic.id);
    }
  }, [topic]);

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
    isComplete,
    progress,
    goToNext,
    goToPrevious,
    goToCard,
    revealCell,
    revealAllCells,
    resetCurrentCard,
    resetSession,
    getProgressPercentage,
    getViewedPercentage
  };
}

export default useStudySession;
