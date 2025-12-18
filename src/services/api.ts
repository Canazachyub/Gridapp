import type {
  ApiResponse,
  Topic,
  Card,
  CardsResponse,
  CreateTopicPayload,
  AddCardPayload,
  UpdateCardPayload,
  DeleteCardPayload,
  UploadImagePayload,
  UploadResponse,
  ColumnConfig
} from '../types';

// ============================================================================
// CONFIGURACION
// ============================================================================

const GAS_URL = import.meta.env.VITE_GAS_URL || '';

// Timeout para las peticiones (ms)
const REQUEST_TIMEOUT = 30000;

// ============================================================================
// CLIENTE HTTP
// ============================================================================

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function apiGet<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const searchParams = new URLSearchParams({ action, ...params });
  const url = `${GAS_URL}?${searchParams.toString()}`;

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error((data as unknown as { error: { message: string } }).error?.message || 'Unknown error');
  }

  return data.data;
}

async function apiPost<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetchWithTimeout(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ action, ...payload })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error((data as unknown as { error: { message: string } }).error?.message || 'Unknown error');
  }

  return data.data;
}

// ============================================================================
// API DE TEMAS
// ============================================================================

export async function getTopics(): Promise<Topic[]> {
  return apiGet<Topic[]>('getTopics');
}

export async function createTopic(payload: CreateTopicPayload): Promise<Topic> {
  return apiPost<Topic>('createTopic', {
    title: payload.title,
    columns: payload.columns
  });
}

export async function deleteTopic(topicName: string): Promise<{ deleted: string }> {
  return apiPost<{ deleted: string }>('deleteTopic', { topicName });
}

// ============================================================================
// API DE TARJETAS
// ============================================================================

export async function getCards(topicName: string): Promise<CardsResponse> {
  return apiGet<CardsResponse>('getCards', { topic: topicName });
}

export async function addCard(payload: AddCardPayload): Promise<Card> {
  return apiPost<Card>('addCard', payload);
}

export async function updateCard(payload: UpdateCardPayload): Promise<Card> {
  return apiPost<Card>('updateCard', payload);
}

export async function deleteCard(payload: DeleteCardPayload): Promise<{ deleted: number }> {
  return apiPost<{ deleted: number }>('deleteCard', payload);
}

// ============================================================================
// API DE IMAGENES
// ============================================================================

export async function uploadImage(payload: UploadImagePayload): Promise<UploadResponse> {
  return apiPost<UploadResponse>('uploadImage', payload);
}

// ============================================================================
// API DE CONFIGURACION
// ============================================================================

export async function getTopicConfig(topicName: string): Promise<Record<string, string>> {
  return apiGet<Record<string, string>>('getTopicConfig', { topic: topicName });
}

export async function updateTopicConfig(
  topicName: string,
  columns: ColumnConfig[]
): Promise<void> {
  return apiPost<void>('updateTopicConfig', { topicName, columns });
}

// ============================================================================
// API DE SINCRONIZACION
// ============================================================================

export async function syncData(topics: Topic[]): Promise<{ topic: string; status: string }[]> {
  return apiPost<{ topic: string; status: string }[]>('syncData', { topics });
}

// ============================================================================
// UTILIDADES
// ============================================================================

export async function ping(): Promise<boolean> {
  try {
    const response = await apiGet<{ status: string }>('ping');
    return response.status === 'online';
  } catch {
    return false;
  }
}

export function isConfigured(): boolean {
  return GAS_URL !== '';
}

// ============================================================================
// EXPORTAR CLIENTE
// ============================================================================

export const api = {
  // Temas
  getTopics,
  createTopic,
  deleteTopic,
  // Tarjetas
  getCards,
  addCard,
  updateCard,
  deleteCard,
  // Imagenes
  uploadImage,
  // Config
  getTopicConfig,
  updateTopicConfig,
  // Sync
  syncData,
  // Utils
  ping,
  isConfigured
};

export default api;
