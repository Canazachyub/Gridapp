import type { Card, ColumnConfig } from '../types';
import { MemoryTile } from './MemoryTile';
import {
  detectMemoryRole,
  sortColumnsByMemoryRole,
  looksLikeImageUrl,
  type MemoryRole
} from '../utils/helpers';

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
// LÓGICA DE TAMAÑO BENTO (dinámico según rol + contenido)
// ============================================================================

type TileSize = 'hero' | 'wide' | 'tall' | 'normal';

// Clases estáticas (literales) para que Tailwind las incluya en el build.
// En móvil (< sm) todo es 1 columna; la asimetría bento aparece desde sm.
const SIZE_CLASSES: Record<TileSize, string> = {
  hero: 'sm:col-span-2 sm:row-span-2',
  wide: 'sm:col-span-2',
  tall: 'sm:row-span-2',
  normal: ''
};

/**
 * Decide el tamaño de cada tile según su rol de memorización y la cantidad
 * de contenido. Así el grid se adapta al contenido de cada tarjeta en lugar
 * de usar celdas de tamaño uniforme.
 */
function getTileSize(
  role: MemoryRole,
  contentLength: number,
  isImage: boolean
): TileSize {
  if (isImage) return 'tall';

  switch (role) {
    case 'answer':
      // La respuesta/validación suele ser la más rica → protagonista
      return contentLength > 160 ? 'hero' : 'wide';
    case 'question':
      return contentLength > 120 ? 'wide' : 'normal';
    case 'mnemonic':
      return contentLength > 140 ? 'wide' : 'normal';
    case 'concept':
    case 'keyword':
      return contentLength > 180 ? 'wide' : 'normal';
    default:
      // Genérico: crece con la longitud del texto
      if (contentLength > 220) return 'hero';
      if (contentLength > 110) return 'wide';
      return 'normal';
  }
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
  // Prioridad visual: 1. Pregunta, 2. Respuesta, 3. Concepto, 4. Palabra clave, 5. Nemotecnia, 6. Imagen, 7. Genérico
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

  return (
    <div
      className={
        'grid w-full min-h-full ' +
        'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ' +
        'auto-rows-[minmax(150px,auto)] grid-flow-row-dense ' +
        'gap-3 sm:gap-4'
      }
    >
      {positionedColumns.map((col, index) => {
        const content = card.cells[col.name] || '';
        const isImage = col.type === 'image' || looksLikeImageUrl(content);
        const size = getTileSize(col.role, content.trim().length, isImage);

        return (
          <GridTile
            key={col.name}
            column={col}
            content={content}
            revealed={revealedCells.has(col.name)}
            onToggle={onToggleCell}
            index={index}
            sizeClass={SIZE_CLASSES[size]}
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
}

function GridTile({
  column,
  content,
  revealed,
  onToggle,
  index,
  sizeClass
}: GridTileProps) {
  return (
    <div
      className={`animate-fade-in min-h-[150px] ${sizeClass}`}
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
