import { useState } from 'react';
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
  CloudOff
} from 'lucide-react';
import type { Topic } from '../types';
import { useApp } from '../contexts/AppContext';
import { cn } from '../utils/helpers';
import { Button, IconButton } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TopicCardSkeleton } from '../components/ui/Spinner';
import { CircularProgress } from '../components/ui/Progress';
import { ConfirmModal } from '../components/ui/Modal';
import { storage } from '../services/storage';

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
    toggleDarkMode
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

          {/* Boton crear */}
          <Button
            onClick={() => setView('creator')}
            leftIcon={<Plus size={18} />}
            className="whitespace-nowrap"
          >
            Crear Hoja
          </Button>
        </div>

        {/* Grid de topics */}
        {isLoading && topics.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <TopicCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredTopics.length === 0 ? (
          <EmptyState
            hasSearch={searchQuery.length > 0}
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
              />
            ))}
          </div>
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
}

function TopicCard({ topic, onStudy, onEdit }: TopicCardProps) {
  const progress = storage.getStudyProgress(topic.id);
  const progressPercent = progress?.completionPercentage || 0;

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
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {topic.cardCount} tarjetas
        </span>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {topic.columns.length} columnas
        </span>
      </div>

      {/* Columnas preview */}
      <div className="flex flex-wrap gap-1 mb-6">
        {topic.columns.slice(0, 3).map(col => (
          <span
            key={col.id}
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
