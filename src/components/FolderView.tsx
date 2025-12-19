import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, X, FileText, Loader2 } from 'lucide-react';
import type { Folder, FolderTopic, SearchResult } from '../types';
import { cn } from '../utils/helpers';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

// ============================================================================
// TIPOS
// ============================================================================

interface FolderViewProps {
  folder: Folder;
  onBack: () => void;
  onSelectTopic: (topicName: string, cardIndex?: number) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  onSearch: (query: string) => Promise<void>;
  onClearSearch: () => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function FolderView({
  folder,
  onBack,
  onSelectTopic,
  searchResults,
  isSearching,
  onSearch,
  onClearSearch
}: FolderViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Debounce de búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      onClearSearch();
      setShowResults(false);
      return;
    }

    const timer = setTimeout(() => {
      onSearch(searchQuery);
      setShowResults(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch, onClearSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    onClearSearch();
    setShowResults(false);
  }, [onClearSearch]);

  const handleResultClick = useCallback((result: SearchResult) => {
    // Pasar el índice de la tarjeta para navegar directamente a ella
    onSelectTopic(result.topicName, result.cardIndex);
    handleClearSearch();
  }, [onSelectTopic, handleClearSearch]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className={cn(
        'sticky top-0 z-20',
        'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl',
        'border-b border-slate-200 dark:border-slate-800',
        'px-3 sm:px-4 py-3 sm:py-4'
      )}>
        <div className="max-w-6xl mx-auto">
          {/* Navegación */}
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Volver</span>
            </Button>
            <h1 className="text-base sm:text-xl font-bold text-slate-800 dark:text-white truncate flex-1">
              {folder.name}
            </h1>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {folder.topicCount} {folder.topicCount === 1 ? 'tema' : 'temas'}
            </span>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative">
            <Input
              placeholder="Buscar en todos los índices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )
              }
              rightIcon={
                searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )
              }
              className="pr-10"
            />

            {/* Resultados de búsqueda dropdown */}
            {showResults && searchQuery && (
              <SearchResultsDropdown
                results={searchResults}
                isLoading={isSearching}
                query={searchQuery}
                onResultClick={handleResultClick}
              />
            )}
          </div>
        </div>
      </header>

      {/* Contenido - Lista de temas */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <h2 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 sm:mb-4">
          Temas en esta carpeta
        </h2>

        {folder.topics.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-slate-400">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
            <p className="text-base sm:text-lg">Esta carpeta está vacía</p>
            <p className="text-xs sm:text-sm mt-1">Asigna temas a esta carpeta desde el dashboard</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {folder.topics.map((topic) => (
              <TopicCard
                key={topic.name}
                topic={topic}
                onSelect={() => onSelectTopic(topic.name)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================================================
// RESULTADOS DE BÚSQUEDA
// ============================================================================

interface SearchResultsDropdownProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
  onResultClick: (result: SearchResult) => void;
}

function SearchResultsDropdown({
  results,
  isLoading,
  query,
  onResultClick
}: SearchResultsDropdownProps) {
  if (isLoading) {
    return (
      <div className={cn(
        'absolute left-0 right-0 top-full mt-2 z-30',
        'bg-white dark:bg-slate-800',
        'border border-slate-200 dark:border-slate-700',
        'rounded-xl shadow-2xl',
        'p-4 sm:p-6 text-center'
      )}>
        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mx-auto text-primary-500" />
        <p className="text-xs sm:text-sm text-slate-500 mt-2">Buscando...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={cn(
        'absolute left-0 right-0 top-full mt-2 z-30',
        'bg-white dark:bg-slate-800',
        'border border-slate-200 dark:border-slate-700',
        'rounded-xl shadow-2xl',
        'p-4 sm:p-6 text-center'
      )}>
        <Search className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-slate-300 mb-2" />
        <p className="text-xs sm:text-sm text-slate-500">Sin resultados para "{query}"</p>
      </div>
    );
  }

  // Agrupar resultados por tema
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.topicName]) {
      acc[result.topicName] = [];
    }
    acc[result.topicName].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className={cn(
      'absolute left-0 right-0 top-full mt-2 z-30',
      'bg-white dark:bg-slate-800',
      'border border-slate-200 dark:border-slate-700',
      'rounded-xl shadow-2xl',
      'max-h-72 sm:max-h-96 overflow-y-auto'
    )}>
      <div className="p-2.5 sm:p-3 border-b border-slate-100 dark:border-slate-700">
        <p className="text-[10px] sm:text-xs text-slate-500">
          {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
        </p>
      </div>

      {Object.entries(groupedResults).map(([topicName, topicResults]) => (
        <div key={topicName} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
          <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-900/50">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {topicName}
            </span>
          </div>
          {topicResults.map((result, idx) => (
            <button
              key={`${result.cardId}-${idx}`}
              onClick={() => onResultClick(result)}
              className={cn(
                'w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left',
                'hover:bg-slate-50 dark:hover:bg-slate-700/50',
                'active:bg-slate-100 dark:active:bg-slate-600/50',
                'transition-colors'
              )}
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] sm:text-xs font-bold text-primary-600 dark:text-primary-400">
                    #{result.cardIndex + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-white truncate">
                    <HighlightMatch text={result.value} query={query} />
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-400">
                    Columna: {result.columnName}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// HIGHLIGHT DE COINCIDENCIAS
// ============================================================================

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-inherit rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// ============================================================================
// TARJETA DE TEMA
// ============================================================================

interface TopicCardProps {
  topic: FolderTopic;
  onSelect: () => void;
}

function TopicCard({ topic, onSelect }: TopicCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left p-4 sm:p-5 rounded-xl sm:rounded-2xl',
        'bg-white dark:bg-slate-800',
        'border-2 border-slate-200 dark:border-slate-700',
        'hover:border-primary-400 dark:hover:border-primary-500',
        'hover:shadow-lg hover:shadow-primary-500/10',
        'active:scale-[0.98]',
        'transition-all duration-200',
        'group'
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {topic.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {topic.cardCount} tarjeta{topic.cardCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </button>
  );
}

export default FolderView;
