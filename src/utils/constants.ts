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
// SHORTCUTS DE TECLADO
// ============================================================================

export const KEYBOARD_SHORTCUTS = {
  study: {
    next: { key: '→', description: 'Siguiente tarjeta' },
    previous: { key: '←', description: 'Tarjeta anterior' },
    revealAll: { key: 'Espacio', description: 'Revelar todas las celdas' },
    reset: { key: 'R', description: 'Reiniciar tarjeta' },
    toggleIndex: { key: 'I', description: 'Abrir/cerrar indice' },
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
