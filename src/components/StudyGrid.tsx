import type { Card, ColumnConfig } from '../types';
import { MemoryTile } from './MemoryTile';
import { detectMemoryRole, sortColumnsByMemoryRole, type MemoryRole } from '../utils/helpers';

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
    <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 content-start auto-rows-min">
      {positionedColumns.map((col, index) => (
        <GridTile
          key={col.name}
          column={col}
          content={card.cells[col.name] || ''}
          revealed={revealedCells.has(col.name)}
          onToggle={onToggleCell}
          index={index}
        />
      ))}
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
}

function GridTile({ column, content, revealed, onToggle, index }: GridTileProps) {
  return (
    <div
      className="animate-fade-in min-h-[160px] sm:min-h-[180px]"
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
