import type { Card, ColumnConfig } from '../types';
import { MemoryTile } from './MemoryTile';
import { detectMemoryRole, sortColumnsByMemoryRole, type MemoryRole, cn } from '../utils/helpers';

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
// CLASES DE SPAN POR ROL
// Prioridad visual: pregunta y respuesta arriba, concepto abajo, resto al final.
// ============================================================================

const ROLE_SPAN_CLASSES: Record<MemoryRole, string> = {
  // Pregunta y respuesta: tiles estándar, altos para leer bien
  question: 'col-span-1 min-h-[140px] sm:min-h-[160px]',
  answer: 'col-span-1 min-h-[140px] sm:min-h-[160px]',
  // Concepto: en desktop ocupa 1 columna pero 2 filas de alto para darle presencia
  concept: 'col-span-1 md:col-span-2 lg:col-span-1 lg:row-span-2 min-h-[140px] sm:min-h-[160px]',
  // Palabra clave, nemotecnia, imagen y genéricos: tiles estándar
  keyword: 'col-span-1 min-h-[140px] sm:min-h-[160px]',
  mnemonic: 'col-span-1 min-h-[140px] sm:min-h-[160px]',
  image: 'col-span-1 min-h-[140px] sm:min-h-[160px]',
  metadata: 'col-span-1 min-h-[140px] sm:min-h-[160px]',
  generic: 'col-span-1 min-h-[140px] sm:min-h-[160px]'
};

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
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-min md:auto-rows-fr content-start">
      {positionedColumns.map((col, index) => (
        <GridTile
          key={col.name}
          column={col}
          content={card.cells[col.name] || ''}
          revealed={revealedCells.has(col.name)}
          onToggle={onToggleCell}
          className={ROLE_SPAN_CLASSES[col.role]}
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
  className?: string;
  index: number;
}

function GridTile({ column, content, revealed, onToggle, className, index }: GridTileProps) {
  return (
    <div
      className={cn('animate-fade-in', className)}
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
