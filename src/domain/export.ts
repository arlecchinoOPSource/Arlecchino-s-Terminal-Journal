import type { JSONContent } from '@tiptap/react';

/** What an exported entry needs; timestamps are Unix milliseconds. */
export interface ExportableEntry { title: string; content: JSONContent; created_at: number; updated_at: number }

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const stamp = (ms: number) => new Date(ms).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' });
const alignments = new Set(['left', 'center', 'right']);
// Only these style values can reach an export; they match the editor and native allowlists.
const safeFont = (v: unknown) => typeof v === 'string' && /^['A-Za-z ,-]+$/.test(v) ? v : null;
const safeSize = (v: unknown) => typeof v === 'string' && /^\d{1,2}px$/.test(v) ? v : null;

function titleStyle(content: JSONContent): string {
  const a=content.attrs??{};
  const styles=[safeFont(a.titleFontFamily)&&`font-family: ${safeFont(a.titleFontFamily)}`,safeSize(a.titleFontSize)&&`font-size: ${safeSize(a.titleFontSize)}`,typeof a.titleBold==='boolean'&&`font-weight: ${a.titleBold?'bold':'normal'}`,typeof a.titleItalic==='boolean'&&`font-style: ${a.titleItalic?'italic':'normal'}`,(a.titleUnderline===true||a.titleStrike===true)&&`text-decoration: ${[a.titleUnderline===true?'underline':'',a.titleStrike===true?'line-through':''].filter(Boolean).join(' ')}`,alignments.has(a.titleAlign)&&`text-align: ${a.titleAlign}`].filter(Boolean).join('; ');
  return styles?` style="${escapeHtml(styles)}"`:'';
}

function inlineHtml(node: JSONContent): string {
  if (node.type === 'hardBreak') return '<br>';
  if (node.type !== 'text') return '';
  let html = escapeHtml(node.text ?? '');
  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') html = `<strong>${html}</strong>`;
    else if (mark.type === 'italic') html = `<em>${html}</em>`;
    else if (mark.type === 'underline') html = `<u>${html}</u>`;
    else if (mark.type === 'strike') html = `<s>${html}</s>`;
    else if (mark.type === 'textStyle') {
      const style = [safeFont(mark.attrs?.fontFamily) && `font-family: ${safeFont(mark.attrs?.fontFamily)}`, safeSize(mark.attrs?.fontSize) && `font-size: ${safeSize(mark.attrs?.fontSize)}`].filter(Boolean).join('; ');
      if (style) html = `<span style="${escapeHtml(style)}">${html}</span>`;
    }
  }
  return html;
}
const children = (node: JSONContent, render: (n: JSONContent) => string) => (node.content ?? []).map(render).join('');
const align = (node: JSONContent) => alignments.has(node.attrs?.textAlign) && node.attrs?.textAlign !== 'left' ? ` style="text-align: ${node.attrs?.textAlign}"` : '';

function blockHtml(node: JSONContent): string {
  switch (node.type) {
    case 'paragraph': return `<p${align(node)}>${children(node, inlineHtml)}</p>\n`;
    case 'heading': { const level = Math.min(3, Math.max(1, Number(node.attrs?.level) || 1)) + 1; return `<h${level}${align(node)}>${children(node, inlineHtml)}</h${level}>\n`; }
    case 'bulletList': return `<ul>\n${children(node, blockHtml)}</ul>\n`;
    case 'orderedList': { const start = Number.isInteger(node.attrs?.start) && node.attrs?.start !== 1 ? ` start="${node.attrs?.start}"` : ''; return `<ol${start}>\n${children(node, blockHtml)}</ol>\n`; }
    case 'listItem': return `<li>${children(node, blockHtml).trim()}</li>\n`;
    case 'blockquote': return `<blockquote>\n${children(node, blockHtml)}</blockquote>\n`;
    case 'table': return `<table>\n${children(node, blockHtml)}</table>\n`;
    case 'tableRow': return `<tr>${children(node, blockHtml)}</tr>\n`;
    case 'tableHeader': case 'tableCell': {
      const tag = node.type === 'tableHeader' ? 'th' : 'td';
      const span = ['colspan', 'rowspan'].map(k => Number.isInteger(node.attrs?.[k]) && node.attrs?.[k] > 1 ? ` ${k}="${node.attrs?.[k]}"` : '').join('');
      return `<${tag}${span}>${children(node, blockHtml).trim()}</${tag}>`;
    }
    default: return '';
  }
}

/**
 * A complete, self-contained HTML document: no scripts, links, images or
 * external resources; every piece of journal text is escaped.
 */
export function entryToHtml(entry: ExportableEntry): string {
  const title = entry.title.trim() || 'Untitled';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
<title>${escapeHtml(title)}</title>
<style>
body { max-width: 42rem; margin: 3rem auto; padding: 0 1.25rem; font: 17px/1.65 Georgia, 'Times New Roman', serif; color: #1a1a1a; background: #fff; }
h1 { font-size: 1.9rem; line-height: 1.25; margin: 0 0 .25rem; }
.meta { color: #666; font: 14px/1.5 system-ui, sans-serif; margin: 0 0 2rem; }
blockquote { margin: 0 0 1em; padding-left: 1em; border-left: 3px solid #ccc; color: #444; }
table { border-collapse: collapse; width: 100%; margin: 0 0 1em; }
th, td { border: 1px solid #bbb; padding: .4em .6em; vertical-align: top; text-align: left; }
th p, td p, li p { margin: 0; }
</style>
</head>
<body>
<article>
<h1${titleStyle(entry.content)}>${escapeHtml(title)}</h1>
<p class="meta">Written ${escapeHtml(stamp(entry.created_at))} · Last changed ${escapeHtml(stamp(entry.updated_at))} · Exported from Terminal</p>
${children(entry.content, blockHtml)}</article>
</body>
</html>
`;
}

function inlineText(node: JSONContent): string {
  return node.type === 'hardBreak' ? '\n' : node.type === 'text' ? node.text ?? '' : '';
}
function blockText(node: JSONContent, prefix = ''): string[] {
  const text = () => children(node, inlineText);
  switch (node.type) {
    case 'paragraph': return [prefix + text().replace(/\n/g, `\n${prefix}`)];
    case 'heading': return [`${'#'.repeat(Number(node.attrs?.level) || 1)} ${text()}`];
    case 'blockquote': return (node.content ?? []).flatMap(n => blockText(n, `${prefix}> `));
    case 'bulletList': case 'orderedList': {
      const first = Number.isInteger(node.attrs?.start) ? node.attrs?.start : 1;
      return [(node.content ?? []).map((item, i) => {
        const marker = node.type === 'bulletList' ? '- ' : `${first + i}. `;
        const lines = (item.content ?? []).flatMap(n => blockText(n)).join('\n').split('\n');
        return lines.map((line, j) => prefix + (j === 0 ? marker : ' '.repeat(marker.length)) + line).join('\n');
      }).join('\n')];
    }
    case 'table': return [(node.content ?? []).map(row => '| ' + (row.content ?? []).map(cell => (cell.content ?? []).flatMap(n => blockText(n)).join(' ').replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ')).join(' | ') + ' |').join('\n')];
    default: return [];
  }
}

/** Plain text with light markers (#, -, 1., >, |) so structure survives without formatting. */
export function entryToText(entry: ExportableEntry): string {
  const title = entry.title.trim() || 'Untitled';
  const blocks = (entry.content.content ?? []).flatMap(n => blockText(n));
  return [title, '='.repeat(Math.min(Math.max(title.length, 3), 72)), `Written ${stamp(entry.created_at)} · Last changed ${stamp(entry.updated_at)}`, '', ...blocks.flatMap(b => [b, ''])].join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

/** A file-name stem from the title: no path separators or control characters. */
export function exportFileStem(title: string): string {
  const cleaned = [...title.normalize('NFC')].map(c => c.charCodeAt(0) < 32 || '\\/:*?"<>|'.includes(c) ? ' ' : c).join('');
  // Drop dot-only fragments such as ".." so a title can never read as a relative path.
  const stem = cleaned.split(/\s+/).filter(part => part && !/^\.+$/.test(part)).join(' ').replace(/^\.+/, '').slice(0, 80).trim();
  return stem || 'Untitled entry';
}
