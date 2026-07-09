// ============================================================================
// FORMATEO DE TEXTO EN CELDAS
// ============================================================================
// Reglas de marcado sencillo (Markdown-like) soportadas en cualquier celda:
//
//   *texto*           → negrita
//   _texto_           → subrayado
//   ==texto==         → resaltado amarillo
//   `texto`           → estilo código/monoespaciado
//
// Además se respetan los saltos de línea del Excel/Google Sheets.
// Las líneas que empiecen con "•", "-" o "*" se convierten en lista.
// ============================================================================

export interface TextFormatRules {
  boldMarker: string;
  underlineMarker: string;
  highlightMarker: string;
  codeMarker: string;
}

export const DEFAULT_FORMAT_RULES: TextFormatRules = {
  boldMarker: '*',
  underlineMarker: '_',
  highlightMarker: '==',
  codeMarker: '`'
};

/**
 * Escapa caracteres HTML peligrosos
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Aplica formato inline Markdown-like sobre un texto ya escapado.
 * Procesa en orden para evitar conflictos entre marcadores.
 */
export function parseInlineMarkdown(
  text: string,
  rules: TextFormatRules = DEFAULT_FORMAT_RULES
): string {
  let formatted = text;

  // Código inline: `texto`
  formatted = formatted.replace(
    /`([^`]+)`/g,
    '<code class="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">$1</code>'
  );

  // Resaltado: ==texto==
  const highlightRegex = new RegExp(
    `${escapeRegex(rules.highlightMarker)}([^${escapeRegex(rules.highlightMarker)}]+)${escapeRegex(rules.highlightMarker)}`,
    'g'
  );
  formatted = formatted.replace(
    highlightRegex,
    '<mark class="bg-yellow-200 dark:bg-yellow-600/40 px-1 rounded font-semibold">$1</mark>'
  );

  // Negrita: *texto*
  const boldRegex = new RegExp(
    `${escapeRegex(rules.boldMarker)}([^${escapeRegex(rules.boldMarker)}\n]+)${escapeRegex(rules.boldMarker)}`,
    'g'
  );
  formatted = formatted.replace(
    boldRegex,
    '<strong class="font-bold">$1</strong>'
  );

  // Subrayado: _texto_
  const underlineRegex = new RegExp(
    `${escapeRegex(rules.underlineMarker)}([^${escapeRegex(rules.underlineMarker)}\n]+)${escapeRegex(rules.underlineMarker)}`,
    'g'
  );
  formatted = formatted.replace(
    underlineRegex,
    '<span class="underline underline-offset-2 decoration-2 decoration-current">$1</span>'
  );

  return formatted;
}

/**
 * Formatea el contenido completo de una celda:
 * - Respeta saltos de línea.
 * - Detecta listas por viñetas.
 * - Aplica negrita, subrayado y resaltado según marcadores.
 */
export function formatCellContent(text: string): string {
  if (!text || text.trim().length === 0) return '';

  const lines = text.split('\n');

  // Si solo hay una línea sin viñetas, devolvemos un párrafo centrado
  const nonEmptyLines = lines.filter(line => line.trim());
  if (nonEmptyLines.length === 1 && !isBulletLine(nonEmptyLines[0])) {
    return `<p class="text-center font-semibold">${parseInlineMarkdown(escapeHtml(text))}</p>`;
  }

  // Detectar si la mayoría de líneas son viñetas
  const bulletLinesCount = nonEmptyLines.filter(isBulletLine).length;
  const mostlyBullets = bulletLinesCount >= nonEmptyLines.length / 2 && bulletLinesCount > 0;

  if (mostlyBullets) {
    const items = nonEmptyLines.map(line => {
      const trimmed = line.trim().replace(/^\s*[•\-\*]\s*/, '');
      return `<li class="mb-1.5">${parseInlineMarkdown(escapeHtml(trimmed))}</li>`;
    }).join('');
    return `<ul class="list-disc pl-4 sm:pl-5 space-y-1 font-medium text-left">${items}</ul>`;
  }

  // Texto con saltos de línea pero sin ser lista mayoritaria
  const paragraphs = nonEmptyLines.map(line => {
    const trimmed = line.trim();
    if (isBulletLine(trimmed)) {
      const cleaned = trimmed.replace(/^\s*[•\-\*]\s*/, '');
      return `<li class="mb-1.5">${parseInlineMarkdown(escapeHtml(cleaned))}</li>`;
    }
    return `<p class="mb-2 last:mb-0">${parseInlineMarkdown(escapeHtml(trimmed))}</p>`;
  }).join('');

  // Si al menos una viñeta quedó suelta, envolver todo en ul
  if (paragraphs.includes('<li')) {
    return `<ul class="list-disc pl-4 sm:pl-5 space-y-1 font-medium text-left">${paragraphs.replace(/<\/p><li/g, '</li><li').replace(/<p>/g, '<li>').replace(/<\/p>/g, '</li>')}</ul>`;
  }

  return `<div class="space-y-1">${paragraphs}</div>`;
}

/**
 * Determina si una línea comienza como viñeta
 */
function isBulletLine(line: string): boolean {
  return /^\s*[•\-\*]\s+/.test(line);
}

/**
 * Escapa caracteres especiales de regex
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
