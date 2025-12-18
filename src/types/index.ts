// ============================================================================
// TIPOS PRINCIPALES
// ============================================================================

export type ColumnType = 'text' | 'image' | 'formula';

export type ViewType = 'dashboard' | 'creator' | 'editor' | 'study' | 'settings';

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

// ============================================================================
// ESTRUCTURAS DE DATOS
// ============================================================================

export interface ColumnConfig {
  id: string;
  name: string;
  type: ColumnType;
  order: number;
}

export interface CellData {
  [columnName: string]: string;
}

export interface Card {
  id: number;
  rowIndex: number;
  cells: CellData;
}

export interface Topic {
  id: string;
  name: string;
  cardCount: number;
  columns: ColumnConfig[];
  lastModified?: string;
  // Datos locales
  cards?: Card[];
  progress?: StudyProgress;
}

// ============================================================================
// PROGRESO Y ESTADISTICAS
// ============================================================================

export interface StudyProgress {
  topicId: string;
  totalCards: number;
  viewedCards: number[];
  revealedCells: { [cardId: number]: string[] };
  lastStudied?: string;
  completionPercentage: number;
}

export interface StudySession {
  topicId: string;
  currentIndex: number;
  totalCards: number;
  revealedCards: Set<number>;
  startTime: number;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  version: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: number;
  };
  timestamp: string;
}

export interface TopicsResponse {
  topics: Topic[];
}

export interface CardsResponse {
  topic: string;
  headers: ColumnConfig[];
  cards: Card[];
  totalCards: number;
}

export interface UploadResponse {
  fileId: string;
  fileName: string;
  url: string;
  webViewLink: string;
  size: number;
}

// ============================================================================
// PAYLOADS PARA API
// ============================================================================

export interface CreateTopicPayload {
  title: string;
  columns: { name: string; type: ColumnType }[];
}

export interface AddCardPayload {
  topicName: string;
  cells: CellData;
}

export interface UpdateCardPayload {
  topicName: string;
  rowId: number;
  cells: CellData;
}

export interface DeleteCardPayload {
  topicName: string;
  rowId: number;
}

export interface UploadImagePayload {
  imageData: string;  // Base64
  fileName: string;
  mimeType?: string;
}

// ============================================================================
// ESTADO DE LA APP
// ============================================================================

export interface AppState {
  topics: Topic[];
  currentTopic: Topic | null;
  currentView: ViewType;
  syncStatus: SyncStatus;
  isLoading: boolean;
  error: string | null;
  isDarkMode: boolean;
}

export interface AppContextType extends AppState {
  // Acciones
  loadTopics: () => Promise<void>;
  selectTopic: (topic: Topic) => void;
  setView: (view: ViewType) => void;
  createTopic: (payload: CreateTopicPayload) => Promise<void>;
  deleteTopic: (topicName: string) => Promise<void>;
  addCard: (payload: AddCardPayload) => Promise<void>;
  updateCard: (payload: UpdateCardPayload) => Promise<void>;
  deleteCard: (payload: DeleteCardPayload) => Promise<void>;
  uploadImage: (payload: UploadImagePayload) => Promise<string>;
  toggleDarkMode: () => void;
  clearError: () => void;
}

// ============================================================================
// UTILIDADES
// ============================================================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
