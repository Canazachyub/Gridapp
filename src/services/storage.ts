import type { Topic, StudyProgress, Card } from '../types';

// ============================================================================
// CLAVES DE STORAGE
// ============================================================================

const STORAGE_KEYS = {
  TOPICS: 'gridapp_topics',
  PROGRESS: 'gridapp_progress',
  SETTINGS: 'gridapp_settings',
  CACHE_TIMESTAMP: 'gridapp_cache_timestamp',
  PENDING_SYNC: 'gridapp_pending_sync'
} as const;

// Tiempo de vida del cache (5 minutos)
const CACHE_TTL = 5 * 60 * 1000;

// ============================================================================
// FUNCIONES GENERICAS
// ============================================================================

function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    console.error(`Error reading ${key} from localStorage`);
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
}

// ============================================================================
// TEMAS
// ============================================================================

export function getTopicsFromCache(): Topic[] {
  return getItem<Topic[]>(STORAGE_KEYS.TOPICS) || [];
}

export function saveTopicsToCache(topics: Topic[]): void {
  setItem(STORAGE_KEYS.TOPICS, topics);
  setItem(STORAGE_KEYS.CACHE_TIMESTAMP, Date.now());
}

export function isCacheValid(): boolean {
  const timestamp = getItem<number>(STORAGE_KEYS.CACHE_TIMESTAMP);
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_TTL;
}

export function clearTopicsCache(): void {
  removeItem(STORAGE_KEYS.TOPICS);
  removeItem(STORAGE_KEYS.CACHE_TIMESTAMP);
}

// ============================================================================
// PROGRESO DE ESTUDIO
// ============================================================================

export function getStudyProgress(topicId: string): StudyProgress | null {
  const allProgress = getItem<Record<string, StudyProgress>>(STORAGE_KEYS.PROGRESS) || {};
  return allProgress[topicId] || null;
}

export function saveStudyProgress(progress: StudyProgress): void {
  const allProgress = getItem<Record<string, StudyProgress>>(STORAGE_KEYS.PROGRESS) || {};
  allProgress[progress.topicId] = {
    ...progress,
    lastStudied: new Date().toISOString()
  };
  setItem(STORAGE_KEYS.PROGRESS, allProgress);
}

export function getAllStudyProgress(): Record<string, StudyProgress> {
  return getItem<Record<string, StudyProgress>>(STORAGE_KEYS.PROGRESS) || {};
}

export function clearStudyProgress(topicId?: string): void {
  if (topicId) {
    const allProgress = getItem<Record<string, StudyProgress>>(STORAGE_KEYS.PROGRESS) || {};
    delete allProgress[topicId];
    setItem(STORAGE_KEYS.PROGRESS, allProgress);
  } else {
    removeItem(STORAGE_KEYS.PROGRESS);
  }
}

// ============================================================================
// SETTINGS
// ============================================================================

interface AppSettings {
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  autoSync: boolean;
  showKeyboardHints: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  fontSize: 'medium',
  autoSync: true,
  showKeyboardHints: true
};

export function getSettings(): AppSettings {
  return getItem<AppSettings>(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
}

export function saveSettings(settings: Partial<AppSettings>): void {
  const current = getSettings();
  setItem(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
}

export function resetSettings(): void {
  setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

// ============================================================================
// SYNC OFFLINE
// ============================================================================

interface PendingOperation {
  id: string;
  type: 'add' | 'update' | 'delete';
  topicName: string;
  data: Card | { rowId: number };
  timestamp: number;
}

export function getPendingOperations(): PendingOperation[] {
  return getItem<PendingOperation[]>(STORAGE_KEYS.PENDING_SYNC) || [];
}

export function addPendingOperation(operation: Omit<PendingOperation, 'id' | 'timestamp'>): void {
  const pending = getPendingOperations();
  pending.push({
    ...operation,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now()
  });
  setItem(STORAGE_KEYS.PENDING_SYNC, pending);
}

export function removePendingOperation(id: string): void {
  const pending = getPendingOperations();
  const filtered = pending.filter(op => op.id !== id);
  setItem(STORAGE_KEYS.PENDING_SYNC, filtered);
}

export function clearPendingOperations(): void {
  removeItem(STORAGE_KEYS.PENDING_SYNC);
}

export function hasPendingOperations(): boolean {
  return getPendingOperations().length > 0;
}

// ============================================================================
// EXPORTAR STORAGE
// ============================================================================

export const storage = {
  // Topics
  getTopicsFromCache,
  saveTopicsToCache,
  isCacheValid,
  clearTopicsCache,
  // Progress
  getStudyProgress,
  saveStudyProgress,
  getAllStudyProgress,
  clearStudyProgress,
  // Settings
  getSettings,
  saveSettings,
  resetSettings,
  // Sync
  getPendingOperations,
  addPendingOperation,
  removePendingOperation,
  clearPendingOperations,
  hasPendingOperations
};

export default storage;
