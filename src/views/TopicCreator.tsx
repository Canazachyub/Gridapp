import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Type, Image, Calculator, GripVertical } from 'lucide-react';
import type { ColumnType } from '../types';
import { useApp } from '../contexts/AppContext';
import { cn, generateId } from '../utils/helpers';
import { Button, IconButton } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

// ============================================================================
// TIPOS
// ============================================================================

interface ColumnDraft {
  id: string;
  name: string;
  type: ColumnType;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function TopicCreator() {
  const { createTopic, setView, isLoading } = useApp();

  const [title, setTitle] = useState('');
  const [columns, setColumns] = useState<ColumnDraft[]>([
    { id: generateId(), name: 'Pregunta', type: 'text' },
    { id: generateId(), name: 'Respuesta', type: 'text' }
  ]);
  const [error, setError] = useState<string | null>(null);

  // Agregar columna
  const addColumn = () => {
    if (columns.length >= 6) {
      setError('Maximo 6 columnas permitidas');
      return;
    }
    setColumns([
      ...columns,
      { id: generateId(), name: `Columna ${columns.length + 1}`, type: 'text' }
    ]);
  };

  // Actualizar columna
  const updateColumn = (id: string, field: keyof ColumnDraft, value: string) => {
    setColumns(columns.map(col =>
      col.id === id ? { ...col, [field]: value } : col
    ));
  };

  // Eliminar columna
  const removeColumn = (id: string) => {
    if (columns.length <= 1) {
      setError('Debe haber al menos una columna');
      return;
    }
    setColumns(columns.filter(col => col.id !== id));
  };

  // Guardar
  const handleSave = async () => {
    // Validaciones
    if (!title.trim()) {
      setError('El titulo es requerido');
      return;
    }

    if (columns.some(col => !col.name.trim())) {
      setError('Todas las columnas deben tener nombre');
      return;
    }

    setError(null);

    const success = await createTopic({
      title: title.trim(),
      columns: columns.map(col => ({
        name: col.name.trim(),
        type: col.type
      }))
    });

    if (success) {
      setView('dashboard');
    }
  };

  // Volver
  const handleBack = () => {
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <IconButton
            icon={<ArrowLeft size={20} />}
            onClick={handleBack}
            label="Volver"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Nueva Hoja de Estudio
            </h1>
            <p className="text-sm text-slate-500">
              Define la estructura de tu tema
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8 border border-slate-200 dark:border-slate-800">
          {/* Titulo */}
          <div className="mb-8">
            <Input
              label="Titulo del tema"
              placeholder="Ej: Latin - Sufijos"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Columnas */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Columnas
              </h2>
              <span className="text-sm text-slate-500">
                {columns.length}/6
              </span>
            </div>

            <div className="space-y-3">
              {columns.map((col, index) => (
                <ColumnRow
                  key={col.id}
                  column={col}
                  index={index}
                  canDelete={columns.length > 1}
                  onUpdate={(field, value) => updateColumn(col.id, field, value)}
                  onDelete={() => removeColumn(col.id)}
                />
              ))}
            </div>

            {/* Boton agregar columna */}
            <button
              onClick={addColumn}
              disabled={columns.length >= 6}
              className={cn(
                'w-full mt-4 py-3 border-2 border-dashed rounded-xl',
                'flex items-center justify-center gap-2',
                'text-sm font-medium transition-colors',
                columns.length >= 6
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:border-primary-400 hover:text-primary-600'
              )}
            >
              <Plus size={18} />
              Agregar columna
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Preview */}
          <PreviewSection title={title} columns={columns} />

          {/* Acciones */}
          <div className="flex gap-3 mt-8">
            <Button
              variant="secondary"
              onClick={handleBack}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isLoading}
              className="flex-1"
            >
              Crear Tema
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COLUMN ROW
// ============================================================================

interface ColumnRowProps {
  column: ColumnDraft;
  index: number;
  canDelete: boolean;
  onUpdate: (field: keyof ColumnDraft, value: string) => void;
  onDelete: () => void;
}

function ColumnRow({ column, index, canDelete, onUpdate, onDelete }: ColumnRowProps) {
  const typeOptions = [
    { value: 'text', label: 'Texto' },
    { value: 'image', label: 'Imagen' },
    { value: 'formula', label: 'Formula' }
  ];

  const typeIcon = {
    text: <Type size={14} />,
    image: <Image size={14} />,
    formula: <Calculator size={14} />
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl',
        'bg-slate-50 dark:bg-slate-800/50',
        'border border-slate-200 dark:border-slate-700'
      )}
    >
      {/* Numero */}
      <div className="flex items-center gap-1 text-slate-400">
        <GripVertical size={14} className="cursor-grab" />
        <span className="text-xs font-mono w-4">{index + 1}</span>
      </div>

      {/* Nombre */}
      <input
        type="text"
        value={column.name}
        onChange={e => onUpdate('name', e.target.value)}
        placeholder="Nombre de columna"
        className={cn(
          'flex-1 px-3 py-1.5 rounded-lg',
          'bg-white dark:bg-slate-900',
          'border border-slate-200 dark:border-slate-700',
          'text-sm text-slate-800 dark:text-white',
          'focus:outline-none focus:ring-2 focus:ring-primary-500'
        )}
      />

      {/* Tipo */}
      <div className="flex items-center gap-2">
        <span className="text-slate-400">
          {typeIcon[column.type]}
        </span>
        <Select
          options={typeOptions}
          value={column.type}
          onChange={value => onUpdate('type', value)}
          className="w-28"
        />
      </div>

      {/* Eliminar */}
      <IconButton
        icon={<Trash2 size={16} />}
        onClick={onDelete}
        disabled={!canDelete}
        variant="ghost"
        label="Eliminar columna"
        className="text-slate-400 hover:text-red-500"
      />
    </div>
  );
}

// ============================================================================
// PREVIEW SECTION
// ============================================================================

interface PreviewSectionProps {
  title: string;
  columns: ColumnDraft[];
}

function PreviewSection({ title, columns }: PreviewSectionProps) {
  if (!title && columns.length === 0) return null;

  const typeColors = {
    text: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    image: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    formula: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
  };

  return (
    <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-medium text-slate-500 mb-3">Vista previa</h3>

      <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
        <h4 className="font-bold text-slate-800 dark:text-white mb-3">
          {title || 'Sin titulo'}
        </h4>

        <div className="flex flex-wrap gap-2">
          {columns.map(col => (
            <span
              key={col.id}
              className={cn(
                'text-xs font-medium px-2 py-1 rounded-full',
                typeColors[col.type]
              )}
            >
              {col.name || 'Sin nombre'}
            </span>
          ))}
        </div>

        <p className="text-xs text-slate-400 mt-3">
          {columns.length} columnas definidas
        </p>
      </div>
    </div>
  );
}

export default TopicCreator;
