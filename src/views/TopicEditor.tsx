import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Eye } from 'lucide-react';
import type { Card, ColumnConfig, CellData } from '../types';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { cn, generateId } from '../utils/helpers';
import { Button, IconButton } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { ImageUploader } from '../components/ImageUploader';
import { Modal } from '../components/ui/Modal';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function TopicEditor() {
  const {
    currentTopic,
    setView,
    addCard,
    updateCard,
    deleteCard,
    uploadImage,
    isLoading
  } = useApp();

  const [cards, setCards] = useState<Card[]>([]);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Modal de imagen
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    cardIndex: number;
    columnName: string;
  }>({ isOpen: false, cardIndex: -1, columnName: '' });

  // Cargar cards
  useEffect(() => {
    async function loadCards() {
      if (!currentTopic) return;

      setLoadingCards(true);
      try {
        if (api.isConfigured()) {
          const response = await api.getCards(currentTopic.name);
          setCards(response.cards);
          setColumns(response.headers);
        } else {
          // Usar datos locales
          setCards(currentTopic.cards || []);
          setColumns(currentTopic.columns);
        }
      } catch (error) {
        console.error('Error loading cards:', error);
        setCards(currentTopic.cards || []);
        setColumns(currentTopic.columns);
      } finally {
        setLoadingCards(false);
      }
    }

    loadCards();
  }, [currentTopic]);

  // Volver
  const handleBack = () => {
    if (hasChanges) {
      if (confirm('Tienes cambios sin guardar. Deseas salir?')) {
        setView('dashboard');
      }
    } else {
      setView('dashboard');
    }
  };

  // Ir a estudiar
  const handleStudy = () => {
    setView('study');
  };

  // Agregar fila
  const handleAddRow = () => {
    const newCard: Card = {
      id: Date.now(),
      rowIndex: cards.length,
      cells: columns.reduce((acc, col) => {
        acc[col.name] = '';
        return acc;
      }, {} as CellData)
    };
    setCards([...cards, newCard]);
    setHasChanges(true);
  };

  // Actualizar celda
  const handleCellChange = (cardIndex: number, columnName: string, value: string) => {
    setCards(cards.map((card, i) =>
      i === cardIndex
        ? { ...card, cells: { ...card.cells, [columnName]: value } }
        : card
    ));
    setHasChanges(true);
  };

  // Eliminar fila
  const handleDeleteRow = (cardIndex: number) => {
    const card = cards[cardIndex];
    setCards(cards.filter((_, i) => i !== cardIndex));
    setHasChanges(true);

    // Eliminar del servidor si existe
    if (currentTopic && card.id > 0 && api.isConfigured()) {
      deleteCard({ topicName: currentTopic.name, rowId: card.id });
    }
  };

  // Guardar todo
  const handleSave = async () => {
    if (!currentTopic) return;

    setIsSaving(true);

    try {
      for (const card of cards) {
        // Si es nueva (id temporal)
        if (card.id > Date.now() - 1000000) {
          await addCard({
            topicName: currentTopic.name,
            cells: card.cells
          });
        } else {
          await updateCard({
            topicName: currentTopic.name,
            rowId: card.id,
            cells: card.cells
          });
        }
      }

      setHasChanges(false);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar subida de imagen
  const handleImageUpload = useCallback(async (
    base64: string,
    fileName: string,
    mimeType: string
  ): Promise<string | null> => {
    return uploadImage({ imageData: base64, fileName, mimeType });
  }, [uploadImage]);

  // Aplicar imagen
  const applyImage = (url: string) => {
    const { cardIndex, columnName } = imageModal;
    handleCellChange(cardIndex, columnName, url);
    setImageModal({ isOpen: false, cardIndex: -1, columnName: '' });
  };

  if (!currentTopic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">No hay tema seleccionado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <IconButton
                icon={<ArrowLeft size={20} />}
                onClick={handleBack}
                label="Volver"
              />
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentTopic.name}
                </h1>
                <p className="text-xs text-slate-500">
                  {cards.length} tarjetas
                  {hasChanges && ' - Sin guardar'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                leftIcon={<Eye size={16} />}
                onClick={handleStudy}
                disabled={cards.length === 0}
              >
                <span className="hidden sm:inline">Estudiar</span>
              </Button>
              <Button
                leftIcon={<Save size={16} />}
                onClick={handleSave}
                isLoading={isSaving}
                disabled={!hasChanges}
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loadingCards ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="w-12 px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                      #
                    </th>
                    {columns.map(col => (
                      <th
                        key={col.id}
                        className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase"
                      >
                        <div className="flex items-center gap-2">
                          {col.name}
                          {col.type === 'image' && (
                            <ImageIcon size={12} className="text-purple-500" />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="w-12 px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {cards.map((card, cardIndex) => (
                    <tr
                      key={card.id}
                      className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-3 py-2 text-xs text-slate-400 font-mono">
                        {cardIndex + 1}
                      </td>
                      {columns.map(col => (
                        <td key={col.id} className="px-2 py-2">
                          {col.type === 'image' ? (
                            <ImageCell
                              value={card.cells[col.name]}
                              onEdit={() =>
                                setImageModal({
                                  isOpen: true,
                                  cardIndex,
                                  columnName: col.name
                                })
                              }
                            />
                          ) : (
                            <Textarea
                              value={card.cells[col.name] || ''}
                              onChange={e =>
                                handleCellChange(cardIndex, col.name, e.target.value)
                              }
                              placeholder="..."
                              rows={2}
                              className="text-sm"
                            />
                          )}
                        </td>
                      ))}
                      <td className="px-2 py-2">
                        <IconButton
                          icon={<Trash2 size={16} />}
                          onClick={() => handleDeleteRow(cardIndex)}
                          variant="ghost"
                          label="Eliminar fila"
                          className="text-slate-400 hover:text-red-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Agregar fila */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleAddRow}
                className={cn(
                  'w-full py-3 border-2 border-dashed rounded-xl',
                  'flex items-center justify-center gap-2',
                  'text-sm font-medium transition-colors',
                  'border-slate-300 dark:border-slate-700',
                  'text-slate-500 hover:border-primary-400 hover:text-primary-600'
                )}
              >
                <Plus size={18} />
                Agregar tarjeta
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal de imagen */}
      <Modal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ isOpen: false, cardIndex: -1, columnName: '' })}
        title="Agregar imagen"
        size="md"
      >
        <ImageUploader
          value={
            imageModal.cardIndex >= 0
              ? cards[imageModal.cardIndex]?.cells[imageModal.columnName]
              : ''
          }
          onChange={applyImage}
          onUpload={handleImageUpload}
        />
      </Modal>
    </div>
  );
}

// ============================================================================
// IMAGE CELL
// ============================================================================

interface ImageCellProps {
  value: string;
  onEdit: () => void;
}

function ImageCell({ value, onEdit }: ImageCellProps) {
  if (value) {
    return (
      <div
        className="relative group cursor-pointer"
        onClick={onEdit}
      >
        <img
          src={value}
          alt="Preview"
          className="w-24 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
          <span className="text-xs text-white">Cambiar</span>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onEdit}
      className={cn(
        'w-24 h-16 rounded-lg border-2 border-dashed',
        'border-slate-300 dark:border-slate-700',
        'flex items-center justify-center',
        'hover:border-primary-400 transition-colors'
      )}
    >
      <ImageIcon size={18} className="text-slate-400" />
    </button>
  );
}

export default TopicEditor;
