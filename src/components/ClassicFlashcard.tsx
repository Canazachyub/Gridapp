import { HelpCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { cn } from '../utils/helpers';
import { MEMORY_ROLE_COLORS } from '../utils/constants';

// ============================================================================
// TIPOS
// ============================================================================

interface ClassicFlashcardProps {
  question: string;
  answer: string;
  isFlipped: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function ClassicFlashcard({
  question,
  answer,
  isFlipped,
  onFlip,
  onNext,
  onPrevious
}: ClassicFlashcardProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      {/* Tarjeta clásica */}
      <div
        className="relative w-full max-w-4xl aspect-[16/10] sm:aspect-[2/1] max-h-[60vh] cursor-pointer group perspective-1000"
        onClick={onFlip}
      >
        <div
          className={cn(
            'relative w-full h-full duration-500 preserve-3d transition-transform ease-out',
            isFlipped && 'rotate-y-180'
          )}
        >
          {/* ANVERSO - PREGUNTA */}
          <div
            className={cn(
              'absolute inset-0 backface-hidden rounded-2xl sm:rounded-3xl shadow-2xl',
              'flex flex-col items-center justify-center p-6 sm:p-10 md:p-14',
              'bg-gradient-to-br',
              MEMORY_ROLE_COLORS.question.base,
              'overflow-hidden'
            )}
          >
            {/* Decoración */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl">
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-white/10 rounded-full" />
            </div>

            {/* Badge */}
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                <HelpCircle size={12} />
                Pregunta
              </span>
            </div>

            {/* Contenido */}
            <div className="relative z-10 w-full overflow-y-auto custom-scrollbar flex items-center justify-center">
              <p className={cn(
                'text-center text-white font-semibold leading-relaxed',
                getTextSize(question)
              )}>
                {question || 'Sin pregunta'}
              </p>
            </div>

            {/* Hint */}
            <div className="absolute bottom-4 sm:bottom-6 flex flex-col items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <p className="text-white/80 text-xs sm:text-sm font-medium">
                Toca o Espacio para ver la respuesta
              </p>
            </div>
          </div>

          {/* REVERSO - RESPUESTA */}
          <div
            className={cn(
              'absolute inset-0 backface-hidden rotate-y-180 rounded-2xl sm:rounded-3xl shadow-2xl',
              'flex flex-col overflow-hidden',
              'bg-white dark:bg-slate-900',
              'border-4',
              MEMORY_ROLE_COLORS.answer.border
            )}
          >
            {/* Barra superior */}
            <div className={cn('h-2 bg-gradient-to-r', MEMORY_ROLE_COLORS.answer.base)} />

            {/* Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider',
                MEMORY_ROLE_COLORS.answer.label
              )}>
                <CheckCircle2 size={12} />
                Respuesta
              </span>
            </div>

            {/* Contenido */}
            <div className="flex-1 min-h-0 px-4 sm:px-8 md:px-12 py-4 overflow-y-auto custom-scrollbar flex items-center justify-center">
              <ClassicAnswerContent content={answer} />
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <p className="text-center text-xs sm:text-sm text-slate-400 font-medium">
                Toca o Espacio para volver a la pregunta
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles rápidos */}
      <div className="mt-4 sm:mt-6 flex items-center gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); onPrevious(); }}
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          ← Anterior
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onFlip(); }}
          className={cn(
            'px-5 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-transform active:scale-95',
            'bg-gradient-to-r',
            isFlipped ? MEMORY_ROLE_COLORS.question.base : MEMORY_ROLE_COLORS.answer.base
          )}
        >
          {isFlipped ? 'Ver pregunta' : 'Ver respuesta'}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// CONTENIDO DE RESPUESTA
// ============================================================================

function ClassicAnswerContent({ content }: { content: string }) {
  if (!content || content.trim().length === 0) {
    return (
      <p className="text-slate-400 italic text-base sm:text-lg">Sin respuesta</p>
    );
  }

  const hasBullets = content.includes('•') || content.includes('- ') || content.includes('\n');

  if (hasBullets) {
    return (
      <div
        className={cn(
          'text-slate-800 dark:text-slate-100 leading-relaxed w-full',
          getTextSize(content)
        )}
        dangerouslySetInnerHTML={{ __html: formatBulletText(content) }}
      />
    );
  }

  return (
    <p className={cn(
      'text-center font-semibold text-slate-800 dark:text-slate-100 leading-relaxed w-full',
      getTextSize(content)
    )}>
      {content}
    </p>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getTextSize(text: string): string {
  const length = text.length;
  if (length > 300) return 'text-sm sm:text-base';
  if (length > 150) return 'text-base sm:text-lg md:text-xl';
  if (length > 60) return 'text-lg sm:text-xl md:text-2xl';
  return 'text-xl sm:text-2xl md:text-3xl';
}

function formatBulletText(text: string): string {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length <= 1) return `<p class="text-center font-semibold">${escapeHtml(text)}</p>`;

  const items = lines.map(line => {
    const trimmed = line.trim().replace(/^[\s•\-\*]+/, '');
    return `<li class="mb-2">${escapeHtml(trimmed)}</li>`;
  }).join('');

  return `<ul class="list-disc pl-5 sm:pl-6 space-y-1 font-medium text-left">${items}</ul>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default ClassicFlashcard;
