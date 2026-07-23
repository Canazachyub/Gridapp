import type { Card, ColumnConfig } from '../types';
import { MemoryTile } from './MemoryTile';
import {
  detectMemoryRole,
  sortColumnsByMemoryRole,
  looksLikeImageUrl,
  type MemoryRole
} from '../utils/helpers';
import { cn } from '../utils/helpers';

// ============================================================================
// TIPOS
// ============================================================================

interface StudyGridProps {
  card: Card;
  columns: ColumnConfig[];
  revealedCells: Set<string>;
  onToggleCell?: (columnName: string, revealed: boolean) => void;
}

interface PositionedColumn extends ColumnConfig {
  role: MemoryRole;
}

// ============================================================================
// LÓGICA DE DISTRIBUCIÓN BENTO PERFECTA
// ============================================================================

/**
 * Determina las clases del contenedor según el número total de tarjetas.
 * Esto evita columnas vacías y crea una distribución Bento perfecta de 100% de ancho por fila.
 */
function getContainerGridClass(totalCount: number): string {
  switch (totalCount) {
    case 1:
      return 'grid-cols-1 max-w-2xl';
    case 2:
      return 'grid-cols-1 sm:grid-cols-2 max-w-4xl';
    case 3:
      return 'grid-cols-1 md:grid-cols-3 max-w-6xl';
    case 4:
      return 'grid-cols-1 sm:grid-cols-2 max-w-5xl';
    case 5:
      // Sistema de 6 columnas: Fila 1 (3 items x 2 cols = 6), Fila 2 (2 items x 3 cols = 6)
      return 'grid-cols-1 md:grid-cols-6 max-w-6xl';
    case 6:
      return 'grid-cols-1 md:grid-cols-3 max-w-6xl';
    case 7:
      // Sistema de 6 columnas: Fila 1 (3 x 2 cols), Fila 2 (2 x 3 cols), Fila 3 (2 x 3 cols)
      return 'grid-cols-1 md:grid-cols-6 max-w-6xl';
    default:
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-7xl';
  }
}

/**
 * Asigna la cantidad de columnas span a cada casilla para balancear la cuadrícula sin huecos.
 */
function getTileSpanClasses(
  index: number,
  totalCount: number,
  role: MemoryRole,
  isImage: boolean
): string {
  if (totalCount === 1 || totalCount === 2) {
    return 'col-span-1';
  }

  if (totalCount === 3) {
    return 'md:col-span-1';
  }

  if (totalCount === 4) {
    return 'sm:col-span-1';
  }

  if (totalCount === 5) {
    // 5 elementos en un grid de 6 columnas:
    // Fila 1 (índices 0, 1, 2): 2 columnas cada uno -> (3x2 = 6 columnas, fila completa)
    // Fila 2 (índices 3, 4): 3 columnas cada uno -> (2x3 = 6 columnas, fila completa)
    if (index < 3) {
      return 'md:col-span-2';
    }
    return 'md:col-span-3';
  }

  if (totalCount === 6) {
    return 'md:col-span-1';
  }

  if (totalCount === 7) {
    if (index < 3) return 'md:col-span-2';
    return 'md:col-span-3';
  }

  // Para 8+ tarjetas
  if (isImage) return 'sm:col-span-2 lg:col-span-2';
  if (role === 'answer' || role === 'question') return 'sm:col-span-2';
  return 'col-span-1';
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function StudyGrid({
  card,
  columns,
  revealedCells,
  onToggleCell
}: StudyGridProps) {
  // Detectar roles, filtrar vacías y ocultar metadatos (se muestran en el header)
  const positionedColumns: PositionedColumn[] = sortColumnsByMemoryRole(
    columns
      .filter(col => {
        const role = detectMemoryRole(col.name);
        if (role === 'metadata') return false;
        const value = card.cells[col.name];
        return value && value.trim().length > 0;
      })
      .map(col => ({ ...col, role: detectMemoryRole(col.name) }))
  );

  const totalCount = positionedColumns.length;
  const containerGridClass = getContainerGridClass(totalCount);

  return (
    <div className={cn('w-full mx-auto grid gap-3 sm:gap-5 pb-6', containerGridClass)}>
      {positionedColumns.map((col, index) => {
        const content = card.cells[col.name] || '';
        const isImage = col.type === 'image' || looksLikeImageUrl(content);
        const spanClass = getTileSpanClasses(index, totalCount, col.role, isImage);

        return (
          <GridTile
            key={col.name}
            column={col}
            content={content}
            revealed={revealedCells.has(col.name)}
            onToggle={onToggleCell}
            index={index}
            sizeClass={spanClass}
            isImage={isImage}
          />
        );
      })}
    </div>
  );
}

// ============================================================================
// TILE INDIVIDUAL DEL GRID
// ============================================================================

interface GridTileProps {
  column: ColumnConfig;
  content: string;
  revealed: boolean;
  onToggle?: (columnName: string, revealed: boolean) => void;
  index: number;
  sizeClass: string;
  isImage: boolean;
}

function GridTile({
  column,
  content,
  revealed,
  onToggle,
  index,
  sizeClass,
  isImage
}: GridTileProps) {
  return (
    <div
      className={cn(
        'animate-fade-in transition-all duration-300',
        isImage ? 'min-h-[250px] sm:min-h-[290px]' : 'min-h-[180px] sm:min-h-[210px]',
        sizeClass
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <MemoryTile
        column={column}
        content={content}
        isRevealed={revealed}
        onReveal={(isRevealed) => onToggle?.(column.name, isRevealed)}
        className="h-full"
      />
    </div>
  );
}

export default StudyGrid;
