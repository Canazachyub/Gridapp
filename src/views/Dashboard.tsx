import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Plus,
  BookOpen,
  Settings,
  RefreshCw,
  Search,
  Moon,
  Sun,
  WifiOff,
  Cloud,
  CloudOff,
  FolderPlus,
  Folder,
  ChevronDown,
  X
} from 'lucide-react';
import type { Topic, Folder as FolderType } from '../types';
import { useApp } from '../contexts/AppContext';
import { cn } from '../utils/helpers';
import { Button, IconButton } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TopicCardSkeleton } from '../components/ui/Spinner';
import { CircularProgress } from '../components/ui/Progress';
import { ConfirmModal, Modal } from '../components/ui/Modal';
import { storage } from '../services/storage';
import { FolderCard } from '../components/FolderCard';
import { FolderView } from '../components/FolderView';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function Dashboard() {
  const {
    topics,
    isLoading,
    syncStatus,
    isDarkMode,
    loadTopics,
    selectTopic,
    setView,
    deleteTopic,
    toggleDarkMode,
    // Estado de carpetas
    folders,
    currentFolder,
    uncategorizedTopics,
    searchResults,
    isSearching,
    selectFolder,
    createFolder,
    deleteFolder,
    assignTopicToFolder,
    removeTopicFromFolder,
    searchInFolder,
    clearSearchResults
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Filtrar topics
  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Manejar estudio
  const handleStudy = (topic: Topic) => {
    selectTopic(topic);
    setView('study');
  };

  // Manejar edicion
  const handleEdit = (topic: Topic) => {
    selectTopic(topic);
    setView('editor');
  };

  // Manejar eliminacion
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    await deleteTopic(deleteTarget.name);
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  // Manejar creación de carpeta
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setIsCreatingFolder(true);
    await createFolder(newFolderName.trim());
    setIsCreatingFolder(false);
    setNewFolderName('');
    setShowCreateFolder(false);
  };

  // Manejar selección de tema desde carpeta
  const handleSelectTopicFromFolder = useCallback((topicName: string) => {
    const topic = topics.find(t => t.name === topicName);
    if (topic) {
      selectTopic(topic);
      setView('study');
    }
  }, [topics, selectTopic, setView]);

  // Obtener la carpeta actual de un tema
  const getTopicFolder = useCallback((topicName: string): FolderType | null => {
    return folders.find(f => f.topics.some(t => t.name === topicName)) || null;
  }, [folders]);

  // Si hay una carpeta seleccionada, mostrar FolderView
  if (currentFolder) {
    return (
      <FolderView
        folder={currentFolder}
        onBack={() => selectFolder(null)}
        onSelectTopic={handleSelectTopicFromFolder}
        searchResults={searchResults}
        isSearching={isSearching}
        onSearch={searchInFolder}
        onClearSearch={clearSearchResults}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo y titulo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  GridApp
                </h1>
                <p className="text-xs text-slate-500">Estudio inteligente</p>
              </div>
            </div>

            {/* Acciones del header */}
            <div className="flex items-center gap-2">
              {/* Indicador de sync */}
              <SyncIndicator status={syncStatus} />

              {/* Toggle dark mode */}
              <IconButton
                icon={isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                onClick={toggleDarkMode}
                label={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
              />

              {/* Refrescar */}
              <IconButton
                icon={<RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />}
                onClick={loadTopics}
                label="Refrescar"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Barra de acciones */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Busqueda */}
          <div className="flex-1">
            <Input
              placeholder="Buscar temas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowCreateFolder(true)}
              leftIcon={<FolderPlus size={18} />}
              className="whitespace-nowrap"
            >
              Nueva Carpeta
            </Button>
            <Button
              onClick={() => setView('creator')}
              leftIcon={<Plus size={18} />}
              className="whitespace-nowrap"
            >
              Crear Hoja
            </Button>
          </div>
        </div>

        {/* Vista con búsqueda activa - mostrar todos los topics */}
        {searchQuery ? (
          <>
            {filteredTopics.length === 0 ? (
              <EmptyState
                hasSearch={true}
                onCreateClick={() => setView('creator')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTopics.map(topic => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    onStudy={() => handleStudy(topic)}
                    onEdit={() => handleEdit(topic)}
                    onDelete={() => setDeleteTarget(topic)}
                    folders={folders}
                    currentFolder={getTopicFolder(topic.name)}
                    onAssignToFolder={assignTopicToFolder}
                    onRemoveFromFolder={removeTopicFromFolder}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Sección de Carpetas */}
            {isLoading && folders.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map(i => (
                  <TopicCardSkeleton key={i} />
                ))}
              </div>
            ) : folders.length === 0 && uncategorizedTopics.length === 0 && topics.length === 0 ? (
              <EmptyState
                hasSearch={false}
                onCreateClick={() => setView('creator')}
              />
            ) : (
              <>
                {/* Grid de carpetas */}
                {folders.length > 0 && (
                  <section className="mb-10">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                      <FolderPlus className="w-5 h-5 text-primary-500" />
                      Carpetas
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {folders.map((folder, idx) => (
                        <FolderCard
                          key={folder.id}
                          folder={folder}
                          colorIndex={idx}
                          onSelect={selectFolder}
                          onDelete={deleteFolder}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Sección Sin Categoría */}
                {uncategorizedTopics.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-slate-400" />
                      Sin Categoría
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {uncategorizedTopics.map(topicInfo => {
                        const topic = topics.find(t => t.name === topicInfo.name);
                        if (!topic) return null;
                        return (
                          <TopicCard
                            key={topic.id}
                            topic={topic}
                            onStudy={() => handleStudy(topic)}
                            onEdit={() => handleEdit(topic)}
                            onDelete={() => setDeleteTarget(topic)}
                            folders={folders}
                            currentFolder={null}
                            onAssignToFolder={assignTopicToFolder}
                            onRemoveFromFolder={removeTopicFromFolder}
                          />
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Si no hay carpetas ni sin categoría pero sí temas (fallback) */}
                {folders.length === 0 && uncategorizedTopics.length === 0 && topics.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {topics.map(topic => (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        onStudy={() => handleStudy(topic)}
                        onEdit={() => handleEdit(topic)}
                        onDelete={() => setDeleteTarget(topic)}
                        folders={folders}
                        currentFolder={getTopicFolder(topic.name)}
                        onAssignToFolder={assignTopicToFolder}
                        onRemoveFromFolder={removeTopicFromFolder}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Modal de confirmacion de eliminacion */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar tema"
        message={`Estas seguro de eliminar "${deleteTarget?.name}"? Esta accion no se puede deshacer.`}
        confirmText="Eliminar"
        isLoading={isDeleting}
      />

      {/* Modal para crear carpeta */}
      <Modal
        isOpen={showCreateFolder}
        onClose={() => {
          setShowCreateFolder(false);
          setNewFolderName('');
        }}
        title="Nueva Carpeta"
      >
        <div className="space-y-4">
          <Input
            label="Nombre de la carpeta"
            placeholder="Ej: Razonamiento Verbal"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateFolder(false);
                setNewFolderName('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateFolder}
              isLoading={isCreatingFolder}
              disabled={!newFolderName.trim()}
            >
              Crear
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

// ============================================================================
// TOPIC CARD
// ============================================================================

interface TopicCardProps {
  topic: Topic;
  onStudy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  folders: FolderType[];
  currentFolder: FolderType | null;
  onAssignToFolder: (topicName: string, folderId: string, folderName: string) => Promise<boolean>;
  onRemoveFromFolder?: (topicName: string) => Promise<boolean>;
}

function TopicCard({
  topic,
  onStudy,
  onEdit,
  folders,
  currentFolder,
  onAssignToFolder,
  onRemoveFromFolder
}: TopicCardProps) {
  const progress = storage.getStudyProgress(topic.id);
  const progressPercent = progress?.completionPercentage || 0;
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFolderDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAssign = async (folder: FolderType) => {
    setIsAssigning(true);
    await onAssignToFolder(topic.name, folder.id, folder.name);
    setIsAssigning(false);
    setShowFolderDropdown(false);
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-2xl p-6',
        'shadow-sm hover:shadow-xl',
        'border border-slate-200 dark:border-slate-800',
        'hover:border-primary-200 dark:hover:border-primary-900',
        'transition-all duration-300',
        'group'
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div
          className={cn(
            'p-3 rounded-xl transition-colors',
            'bg-primary-50 dark:bg-primary-900/20',
            'group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40'
          )}
        >
          <BookOpen className="text-primary-600 dark:text-primary-400" size={24} />
        </div>

        {progressPercent > 0 && (
          <CircularProgress
            value={progressPercent}
            size={44}
            strokeWidth={4}
            showLabel={true}
            variant={progressPercent === 100 ? 'success' : 'primary'}
          />
        )}
      </div>

      {/* Titulo */}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
        {topic.name}
      </h3>

      {/* Info */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {topic.cardCount} tarjetas
        </span>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {topic.columns.length} columnas
        </span>
      </div>

      {/* Selector de carpeta - MÁS VISIBLE Y ACCESIBLE */}
      <div className="relative mb-4" ref={dropdownRef}>
        <button
          onClick={() => setShowFolderDropdown(!showFolderDropdown)}
          disabled={isAssigning || folders.length === 0}
          className={cn(
            'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl',
            'text-sm font-medium transition-all',
            currentFolder
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-200 dark:border-primary-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600',
            folders.length === 0 && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Folder className={cn(
              'w-4 h-4 flex-shrink-0',
              currentFolder ? 'text-primary-500' : 'text-slate-400'
            )} />
            <span className="truncate">
              {folders.length === 0
                ? 'Sin carpetas'
                : currentFolder
                  ? currentFolder.name
                  : 'Mover a carpeta...'}
            </span>
          </div>
          <ChevronDown className={cn(
            'w-4 h-4 flex-shrink-0 transition-transform',
            showFolderDropdown && 'rotate-180'
          )} />
        </button>

        {/* Dropdown de carpetas */}
        {showFolderDropdown && folders.length > 0 && (
          <div className={cn(
            'absolute left-0 right-0 top-full mt-1 z-20',
            'bg-white dark:bg-slate-800',
            'border border-slate-200 dark:border-slate-700',
            'rounded-xl shadow-xl',
            'py-1 max-h-48 overflow-y-auto'
          )}>
            {/* Opción para quitar de carpeta */}
            {currentFolder && onRemoveFromFolder && (
              <button
                onClick={async () => {
                  setIsAssigning(true);
                  await onRemoveFromFolder(topic.name);
                  setIsAssigning(false);
                  setShowFolderDropdown(false);
                }}
                disabled={isAssigning}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm',
                  'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
                  'border-b border-slate-100 dark:border-slate-700',
                  isAssigning && 'opacity-50 cursor-not-allowed'
                )}
              >
                <X className="w-4 h-4" />
                Quitar de {currentFolder.name}
              </button>
            )}

            {/* Lista de carpetas */}
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleAssign(folder)}
                disabled={isAssigning || currentFolder?.id === folder.id}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm',
                  'hover:bg-slate-50 dark:hover:bg-slate-700',
                  'transition-colors',
                  currentFolder?.id === folder.id && 'bg-primary-50 dark:bg-primary-900/30 text-primary-600',
                  isAssigning && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Folder className={cn(
                  'w-4 h-4 flex-shrink-0',
                  currentFolder?.id === folder.id ? 'text-primary-500' : 'text-slate-400'
                )} />
                <span className="flex-1 truncate text-slate-700 dark:text-slate-200">
                  {folder.name}
                </span>
                <span className="text-xs text-slate-400">
                  {folder.topicCount}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Columnas preview */}
      <div className="flex flex-wrap gap-1 mb-4">
        {topic.columns.slice(0, 3).map((col, idx) => (
          <span
            key={`${col.id || col.name}-${idx}`}
            className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded"
          >
            {col.name}
          </span>
        ))}
        {topic.columns.length > 3 && (
          <span className="text-[10px] text-slate-400 px-1">
            +{topic.columns.length - 3}
          </span>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <Button
          onClick={onStudy}
          className="flex-1"
          disabled={topic.cardCount === 0}
        >
          Estudiar
        </Button>
        <IconButton
          icon={<Settings size={18} />}
          onClick={onEdit}
          variant="secondary"
          label="Editar"
        />
      </div>
    </div>
  );
}

// ============================================================================
// SYNC INDICATOR
// ============================================================================

interface SyncIndicatorProps {
  status: 'synced' | 'syncing' | 'error' | 'offline';
}

function SyncIndicator({ status }: SyncIndicatorProps) {
  const config = {
    synced: { icon: Cloud, color: 'text-green-500', label: 'Sincronizado' },
    syncing: { icon: RefreshCw, color: 'text-primary-500 animate-spin', label: 'Sincronizando...' },
    error: { icon: CloudOff, color: 'text-red-500', label: 'Error de sincronizacion' },
    offline: { icon: WifiOff, color: 'text-slate-400', label: 'Modo offline' }
  };

  const { icon: Icon, color, label } = config[status];

  return (
    <div className="flex items-center gap-1.5 text-xs" title={label}>
      <Icon size={16} className={color} />
      <span className="hidden sm:inline text-slate-500">{label}</span>
    </div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  hasSearch: boolean;
  onCreateClick: () => void;
}

function EmptyState({ hasSearch, onCreateClick }: EmptyStateProps) {
  if (hasSearch) {
    return (
      <div className="text-center py-16">
        <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
          Sin resultados
        </h3>
        <p className="text-slate-500">
          No se encontraron temas que coincidan con tu busqueda
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <BookOpen className="w-10 h-10 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
        Comienza a estudiar
      </h3>
      <p className="text-slate-500 mb-6 max-w-md mx-auto">
        Crea tu primera hoja de estudio y organiza tus tarjetas con el sistema de grid oclusivo
      </p>
      <Button onClick={onCreateClick} leftIcon={<Plus size={18} />}>
        Crear mi primera hoja
      </Button>
    </div>
  );
}

export default Dashboard;
