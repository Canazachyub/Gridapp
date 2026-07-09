import { useEffect, useCallback } from 'react';

type KeyboardCallback = () => void;

interface KeyboardShortcuts {
  [key: string]: KeyboardCallback;
}

interface UseKeyboardOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboard(
  shortcuts: KeyboardShortcuts,
  options: UseKeyboardOptions = {}
): void {
  const { enabled = true, preventDefault = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignorar si el foco esta en un input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Construir la tecla con modificadores
      const parts: string[] = [];
      if (event.ctrlKey || event.metaKey) parts.push('ctrl');
      if (event.altKey) parts.push('alt');
      if (event.shiftKey) parts.push('shift');
      parts.push(event.key.toLowerCase());

      const keyCombo = parts.join('+');
      const simpleKey = event.key.toLowerCase();

      // Buscar coincidencia
      const callback = shortcuts[keyCombo] || shortcuts[simpleKey];

      if (callback) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    },
    [shortcuts, enabled, preventDefault]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);
}

// ============================================================================
// SHORTCUTS PREDEFINIDOS PARA ESTUDIO
// ============================================================================

export interface StudyKeyboardActions {
  onNext: () => void;
  onPrevious: () => void;
  onRevealAll: () => void;
  onReset: () => void;
  onToggleIndex: () => void;
  onEscape: () => void;
  onModeLearn?: () => void;
  onModeRecall?: () => void;
  onModeTest?: () => void;
  onModeClassic?: () => void;
}

export function useStudyKeyboard(
  actions: StudyKeyboardActions,
  enabled: boolean = true
): void {
  const shortcuts: KeyboardShortcuts = {
    arrowright: actions.onNext,
    arrowleft: actions.onPrevious,
    ' ': actions.onRevealAll,  // Espacio
    'r': actions.onReset,
    'i': actions.onToggleIndex,
    'escape': actions.onEscape
  };

  if (actions.onModeLearn) shortcuts['1'] = actions.onModeLearn;
  if (actions.onModeRecall) shortcuts['2'] = actions.onModeRecall;
  if (actions.onModeTest) shortcuts['3'] = actions.onModeTest;
  if (actions.onModeClassic) shortcuts['4'] = actions.onModeClassic;

  useKeyboard(shortcuts, { enabled });
}

// ============================================================================
// SHORTCUTS PREDEFINIDOS PARA DASHBOARD
// ============================================================================

export interface DashboardKeyboardActions {
  onSearch: () => void;
  onNewTopic: () => void;
  onRefresh: () => void;
}

export function useDashboardKeyboard(
  actions: DashboardKeyboardActions,
  enabled: boolean = true
): void {
  useKeyboard(
    {
      'ctrl+k': actions.onSearch,
      '/': actions.onSearch,
      'n': actions.onNewTopic,
      'ctrl+r': actions.onRefresh
    },
    { enabled }
  );
}

export default useKeyboard;
