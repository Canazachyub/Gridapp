import { useState, useCallback, useEffect } from 'react';
import type { Topic, CreateTopicPayload, Card, SyncStatus } from '../types';
import { api } from '../services/api';
import { storage } from '../services/storage';

interface UseTopicsReturn {
  topics: Topic[];
  isLoading: boolean;
  error: string | null;
  syncStatus: SyncStatus;
  loadTopics: () => Promise<void>;
  createTopic: (payload: CreateTopicPayload) => Promise<Topic | null>;
  deleteTopic: (topicName: string) => Promise<boolean>;
  getTopicCards: (topicName: string) => Promise<Card[]>;
  refreshTopic: (topicName: string) => Promise<void>;
}

export function useTopics(): UseTopicsReturn {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');

  // Cargar topics al iniciar
  const loadTopics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSyncStatus('syncing');

    try {
      // Primero cargar desde cache
      if (storage.isCacheValid()) {
        const cachedTopics = storage.getTopicsFromCache();
        if (cachedTopics.length > 0) {
          setTopics(cachedTopics);
        }
      }

      // Luego actualizar desde API si esta configurada
      if (api.isConfigured()) {
        const apiTopics = await api.getTopics();
        setTopics(apiTopics);
        storage.saveTopicsToCache(apiTopics);
        setSyncStatus('synced');
      } else {
        // Modo offline - usar datos de demo
        const cachedTopics = storage.getTopicsFromCache();
        if (cachedTopics.length === 0) {
          setTopics(DEMO_TOPICS);
          storage.saveTopicsToCache(DEMO_TOPICS);
        }
        setSyncStatus('offline');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading topics';
      setError(message);
      setSyncStatus('error');

      // Fallback a cache
      const cachedTopics = storage.getTopicsFromCache();
      if (cachedTopics.length > 0) {
        setTopics(cachedTopics);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Crear nuevo topic
  const createTopic = useCallback(async (payload: CreateTopicPayload): Promise<Topic | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (api.isConfigured()) {
        const newTopic = await api.createTopic(payload);
        setTopics(prev => [...prev, newTopic]);
        storage.saveTopicsToCache([...topics, newTopic]);
        return newTopic;
      } else {
        // Modo offline
        const newTopic: Topic = {
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
        const updatedTopics = [...topics, newTopic];
        setTopics(updatedTopics);
        storage.saveTopicsToCache(updatedTopics);
        return newTopic;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating topic';
      setError(message);
      return null;
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

      const updatedTopics = topics.filter(t => t.name !== topicName);
      setTopics(updatedTopics);
      storage.saveTopicsToCache(updatedTopics);
      storage.clearStudyProgress(topicName.toLowerCase().replace(/\s+/g, '-'));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting topic';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [topics]);

  // Obtener cards de un topic
  const getTopicCards = useCallback(async (topicName: string): Promise<Card[]> => {
    try {
      if (api.isConfigured()) {
        const response = await api.getCards(topicName);
        return response.cards;
      }

      // Buscar en cache local
      const topic = topics.find(t => t.name === topicName);
      return topic?.cards || [];
    } catch (err) {
      console.error('Error loading cards:', err);
      return [];
    }
  }, [topics]);

  // Refrescar un topic especifico
  const refreshTopic = useCallback(async (topicName: string) => {
    if (!api.isConfigured()) return;

    try {
      const response = await api.getCards(topicName);
      setTopics(prev =>
        prev.map(t =>
          t.name === topicName
            ? { ...t, cards: response.cards, cardCount: response.totalCards }
            : t
        )
      );
    } catch (err) {
      console.error('Error refreshing topic:', err);
    }
  }, []);

  // Cargar al montar
  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  return {
    topics,
    isLoading,
    error,
    syncStatus,
    loadTopics,
    createTopic,
    deleteTopic,
    getTopicCards,
    refreshTopic
  };
}

// ============================================================================
// DATOS DE DEMO (modo offline)
// ============================================================================

const DEMO_TOPICS: Topic[] = [
  {
    id: 'latin-sufijos',
    name: 'Latin - Sufijos',
    cardCount: 3,
    columns: [
      { id: 'c1', name: 'Sufijo', type: 'text', order: 1 },
      { id: 'c2', name: 'Significado', type: 'text', order: 2 },
      { id: 'c3', name: 'Ejemplo', type: 'text', order: 3 },
      { id: 'c4', name: 'Definicion', type: 'text', order: 4 }
    ],
    cards: [
      { id: 2, rowIndex: 0, cells: { 'Sufijo': '-a', 'Significado': 'agente / ocupacion', 'Ejemplo': 'escrib-a', 'Definicion': 'Que escribe, oficio de escritura.' } },
      { id: 3, rowIndex: 1, cells: { 'Sufijo': '-alis, -aris', 'Significado': 'relacion / pertenencia', 'Ejemplo': 'vit-al', 'Definicion': 'Intima relacion con la vida.' } },
      { id: 4, rowIndex: 2, cells: { 'Sufijo': '-ax/-ix/-ox', 'Significado': 'tendencia intensa', 'Ejemplo': 'fal-az', 'Definicion': 'Que es muy enganoso.' } }
    ]
  },
  {
    id: 'latin-raices',
    name: 'Latin - Raices',
    cardCount: 3,
    columns: [
      { id: 'c1', name: 'Raiz', type: 'text', order: 1 },
      { id: 'c2', name: 'Significado', type: 'text', order: 2 },
      { id: 'c3', name: 'Ejemplo', type: 'text', order: 3 },
      { id: 'c4', name: 'Definicion', type: 'text', order: 4 }
    ],
    cards: [
      { id: 2, rowIndex: 0, cells: { 'Raiz': 'acer, acris', 'Significado': 'acido, agrio', 'Ejemplo': 'acrimonia', 'Definicion': 'Aspereza de las cosas.' } },
      { id: 3, rowIndex: 1, cells: { 'Raiz': 'aedes', 'Significado': 'templo, edificio', 'Ejemplo': 'edificio', 'Definicion': 'Construccion fija.' } },
      { id: 4, rowIndex: 2, cells: { 'Raiz': 'aequus', 'Significado': 'igual, equilibrio', 'Ejemplo': 'ecuacion', 'Definicion': 'Igualdad de incognitas.' } }
    ]
  },
  {
    id: 'origenes-raices',
    name: 'Origenes y Raices',
    cardCount: 3,
    columns: [
      { id: 'c1', name: 'Origen', type: 'text', order: 1 },
      { id: 'c2', name: 'Raiz (Procedencia)', type: 'text', order: 2 },
      { id: 'c3', name: 'Nucleo (Ejemplo)', type: 'formula', order: 3 }
    ],
    cards: [
      { id: 2, rowIndex: 0, cells: { 'Origen': 'Latino', 'Raiz (Procedencia)': 'Forme / Rectus', 'Nucleo (Ejemplo)': 'Forma, uniforme / Recto' } },
      { id: 3, rowIndex: 1, cells: { 'Origen': 'Griego', 'Raiz (Procedencia)': 'Morfo / Teo', 'Nucleo (Ejemplo)': 'Amorfo / Ateo' } },
      { id: 4, rowIndex: 2, cells: { 'Origen': 'Quechua', 'Raiz (Procedencia)': "Ch'aki / Ch'ullu", 'Nucleo (Ejemplo)': 'Charqui / Chullo' } }
    ]
  }
];

export default useTopics;
