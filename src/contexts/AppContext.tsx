import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type {
  Topic,
  ViewType,
  SyncStatus,
  CreateTopicPayload,
  AddCardPayload,
  UpdateCardPayload,
  DeleteCardPayload,
  UploadImagePayload
} from '../types';
import { api } from '../services/api';
import { storage } from '../services/storage';

// ============================================================================
// TIPOS DEL CONTEXTO
// ============================================================================

interface AppContextType {
  // Estado
  topics: Topic[];
  currentTopic: Topic | null;
  currentView: ViewType;
  syncStatus: SyncStatus;
  isLoading: boolean;
  error: string | null;
  isDarkMode: boolean;

  // Acciones
  loadTopics: () => Promise<void>;
  selectTopic: (topic: Topic | null) => void;
  setView: (view: ViewType) => void;
  createTopic: (payload: CreateTopicPayload) => Promise<boolean>;
  deleteTopic: (topicName: string) => Promise<boolean>;
  addCard: (payload: AddCardPayload) => Promise<boolean>;
  updateCard: (payload: UpdateCardPayload) => Promise<boolean>;
  deleteCard: (payload: DeleteCardPayload) => Promise<boolean>;
  uploadImage: (payload: UploadImagePayload) => Promise<string | null>;
  toggleDarkMode: () => void;
  clearError: () => void;
  refreshCurrentTopic: () => Promise<void>;
}

// ============================================================================
// CONTEXTO
// ============================================================================

const AppContext = createContext<AppContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Estado principal
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const settings = storage.getSettings();
    return settings.darkMode;
  });

  // Aplicar modo oscuro al documento
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    storage.saveSettings({ darkMode: isDarkMode });
  }, [isDarkMode]);

  // Cargar topics
  const loadTopics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSyncStatus('syncing');

    try {
      // Cache primero
      const cached = storage.getTopicsFromCache();
      if (cached.length > 0) {
        setTopics(cached);
      }

      // API si disponible
      if (api.isConfigured()) {
        const apiTopics = await api.getTopics();
        setTopics(apiTopics);
        storage.saveTopicsToCache(apiTopics);
        setSyncStatus('synced');
      } else {
        setSyncStatus('offline');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading topics';
      setError(message);
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Seleccionar topic
  const selectTopic = useCallback((topic: Topic | null) => {
    setCurrentTopic(topic);
  }, []);

  // Cambiar vista
  const setView = useCallback((view: ViewType) => {
    setCurrentView(view);
  }, []);

  // Crear topic
  const createTopic = useCallback(async (payload: CreateTopicPayload): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      let newTopic: Topic;

      if (api.isConfigured()) {
        newTopic = await api.createTopic(payload);
      } else {
        newTopic = {
          id: payload.title.toLowerCase().replace(/\s+/g, '-'),
          name: payload.title,
          cardCount: 0,
          columns: payload.columns.map((c, i) => ({
            id: `col-${i}`,
            name: c.name,
            type: c.type,
            order: i + 1
          })),
          cards: []
        };
      }

      const updated = [...topics, newTopic];
      setTopics(updated);
      storage.saveTopicsToCache(updated);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating topic';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [topics]);

  // Eliminar topic
  const deleteTopic = useCallback(async (topicName: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if (api.isConfigured()) {
        await api.deleteTopic(topicName);
      }

      const updated = topics.filter(t => t.name !== topicName);
      setTopics(updated);
      storage.saveTopicsToCache(updated);

      if (currentTopic?.name === topicName) {
        setCurrentTopic(null);
        setCurrentView('dashboard');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting topic';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [topics, currentTopic]);

  // Agregar card
  const addCard = useCallback(async (payload: AddCardPayload): Promise<boolean> => {
    setError(null);

    try {
      if (api.isConfigured()) {
        await api.addCard(payload);
      }

      // Actualizar conteo local
      setTopics(prev =>
        prev.map(t =>
          t.name === payload.topicName
            ? { ...t, cardCount: t.cardCount + 1 }
            : t
        )
      );

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding card';
      setError(message);
      return false;
    }
  }, []);

  // Actualizar card
  const updateCard = useCallback(async (payload: UpdateCardPayload): Promise<boolean> => {
    setError(null);

    try {
      if (api.isConfigured()) {
        await api.updateCard(payload);
      }
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating card';
      setError(message);
      return false;
    }
  }, []);

  // Eliminar card
  const deleteCard = useCallback(async (payload: DeleteCardPayload): Promise<boolean> => {
    setError(null);

    try {
      if (api.isConfigured()) {
        await api.deleteCard(payload);
      }

      // Actualizar conteo local
      setTopics(prev =>
        prev.map(t =>
          t.name === payload.topicName
            ? { ...t, cardCount: Math.max(0, t.cardCount - 1) }
            : t
        )
      );

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting card';
      setError(message);
      return false;
    }
  }, []);

  // Subir imagen
  const uploadImage = useCallback(async (payload: UploadImagePayload): Promise<string | null> => {
    setError(null);

    try {
      if (api.isConfigured()) {
        const response = await api.uploadImage(payload);
        return response.url;
      }
      // Modo offline: retornar data URL temporal
      return `data:${payload.mimeType || 'image/png'};base64,${payload.imageData}`;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error uploading image';
      setError(message);
      return null;
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refrescar topic actual
  const refreshCurrentTopic = useCallback(async () => {
    if (!currentTopic || !api.isConfigured()) return;

    try {
      const response = await api.getCards(currentTopic.name);
      const updatedTopic = {
        ...currentTopic,
        cards: response.cards,
        cardCount: response.totalCards,
        columns: response.headers
      };

      setCurrentTopic(updatedTopic);
      setTopics(prev =>
        prev.map(t => (t.name === currentTopic.name ? updatedTopic : t))
      );
    } catch (err) {
      console.error('Error refreshing topic:', err);
    }
  }, [currentTopic]);

  // Cargar al iniciar
  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const value: AppContextType = {
    topics,
    currentTopic,
    currentView,
    syncStatus,
    isLoading,
    error,
    isDarkMode,
    loadTopics,
    selectTopic,
    setView,
    createTopic,
    deleteTopic,
    addCard,
    updateCard,
    deleteCard,
    uploadImage,
    toggleDarkMode,
    clearError,
    refreshCurrentTopic
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export default AppContext;
