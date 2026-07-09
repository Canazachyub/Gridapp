// ============================================================================
// CONSTANTES DE LA APLICACION
// ============================================================================

export const APP_NAME = 'GridApp';
export const APP_VERSION = '1.0.0';

// ============================================================================
// COLORES POR TIPO DE COLUMNA
// ============================================================================

export const COLUMN_TYPE_COLORS = {
  text: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'text-blue-500'
  },
  image: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
    icon: 'text-purple-500'
  },
  formula: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    icon: 'text-amber-500'
  }
} as const;

// ============================================================================
// CONFIGURACION DE ROLES DE MEMORIZACION
// ============================================================================

export type StudyMode = 'learn' | 'recall' | 'test' | 'classic';

export const STUDY_MODES: { id: StudyMode; label: string; description: string }[] = [
  { id: 'learn', label: 'Aprender', description: 'Todo el contenido visible' },
  { id: 'recall', label: 'Active Recall', description: 'Solo concepto y pregunta visibles' },
  { id: 'test', label: 'Examen', description: 'Solo la pregunta visible' },
  { id: 'classic', label: 'Óptimo', description: 'Flashcard clásica: pregunta y respuesta' }
];

export const MEMORY_ROLE_COLORS = {
  concept: {
    base: 'from-blue-500 to-blue-600',
    border: 'border-blue-500',
    label: 'bg-blue-500 text-white',
    soft: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    icon: 'text-blue-500'
  },
  question: {
    base: 'from-red-500 to-red-600',
    border: 'border-red-500',
    label: 'bg-red-500 text-white',
    soft: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    icon: 'text-red-500'
  },
  answer: {
    base: 'from-green-500 to-green-600',
    border: 'border-green-500',
    label: 'bg-green-500 text-white',
    soft: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    icon: 'text-green-500'
  },
  mnemonic: {
    base: 'from-purple-500 to-purple-600',
    border: 'border-purple-500',
    label: 'bg-purple-500 text-white',
    soft: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
    icon: 'text-purple-500'
  },
  keyword: {
    base: 'from-indigo-500 to-indigo-600',
    border: 'border-indigo-500',
    label: 'bg-indigo-500 text-white',
    soft: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300',
    icon: 'text-indigo-500'
  },
  image: {
    base: 'from-cyan-500 to-cyan-600',
    border: 'border-cyan-500',
    label: 'bg-cyan-500 text-white',
    soft: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300',
    icon: 'text-cyan-500'
  },
  metadata: {
    base: 'from-slate-400 to-slate-500',
    border: 'border-slate-400',
    label: 'bg-slate-400 text-white',
    soft: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    icon: 'text-slate-400'
  },
  generic: {
    base: 'from-slate-500 to-slate-600',
    border: 'border-slate-500',
    label: 'bg-slate-500 text-white',
    soft: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    icon: 'text-slate-500'
  }
} as const;

export const MEMORY_ROLE_LABELS: Record<string, string> = {
  concept: 'CONCEPTO CLAVE',
  question: 'PREGUNTA',
  answer: 'RESPUESTA',
  mnemonic: 'NEMOTECNIA',
  image: 'IMAGEN',
  keyword: 'PALABRA CLAVE',
  metadata: 'METADATO',
  generic: 'NOTA'
};

// ============================================================================
// SHORTCUTS DE TECLADO
// ============================================================================

export const KEYBOARD_SHORTCUTS = {
  study: {
    next: { key: '→', description: 'Siguiente tarjeta' },
    previous: { key: '←', description: 'Tarjeta anterior' },
    revealAll: { key: 'Espacio', description: 'Revelar todas las celdas' },
    reset: { key: 'R', description: 'Reiniciar tarjeta' },
    toggleIndex: { key: 'I', description: 'Abrir/cerrar indice' },
    modeLearn: { key: '1', description: 'Modo Aprender' },
    modeRecall: { key: '2', description: 'Modo Active Recall' },
    modeTest: { key: '3', description: 'Modo Examen' },
    modeClassic: { key: '4', description: 'Modo Óptimo (flashcard clásica)' },
    exit: { key: 'Esc', description: 'Volver al dashboard' }
  },
  dashboard: {
    search: { key: '/', description: 'Buscar tema' },
    newTopic: { key: 'N', description: 'Crear nuevo tema' },
    refresh: { key: 'Ctrl+R', description: 'Actualizar datos' }
  }
} as const;

// ============================================================================
// MENSAJES
// ============================================================================

export const MESSAGES = {
  loading: 'Cargando...',
  saving: 'Guardando...',
  syncing: 'Sincronizando...',
  error: {
    generic: 'Ha ocurrido un error',
    network: 'Error de conexion',
    notFound: 'No encontrado',
    unauthorized: 'No autorizado'
  },
  success: {
    saved: 'Guardado correctamente',
    deleted: 'Eliminado correctamente',
    synced: 'Sincronizado correctamente'
  },
  empty: {
    topics: 'No hay temas. Crea uno nuevo para empezar.',
    cards: 'Este tema esta vacio. Agrega tarjetas para empezar a estudiar.'
  },
  confirm: {
    delete: 'Estas seguro de que quieres eliminar esto?',
    reset: 'Esto reiniciara tu progreso. Continuar?'
  }
} as const;

// ============================================================================
// ANIMACIONES
// ============================================================================

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500
} as const;

// ============================================================================
// BREAKPOINTS (mismo que Tailwind)
// ============================================================================

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

// ============================================================================
// GRID LAYOUTS
// ============================================================================

export function getGridCols(columnCount: number): string {
  switch (columnCount) {
    case 1:
      return 'grid-cols-1';
    case 2:
      return 'grid-cols-1 md:grid-cols-2';
    case 3:
      return 'grid-cols-1 md:grid-cols-3';
    case 4:
      return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';
    case 5:
    case 6:
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    default:
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  }
}
