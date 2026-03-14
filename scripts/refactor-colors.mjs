import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = 'd:/Projects/chatbot-ai/src';

function getAllFiles(dir, exts = ['.tsx', '.ts', '.jsx', '.js']) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllFiles(full, exts));
    } else if (exts.includes(extname(entry.name))) {
      results.push(full);
    }
  }
  return results;
}

// Order matters: more specific patterns first
const replacements = [
  // ── Remove dark: slate overrides (CSS vars handle dark mode) ─────────────
  [/\s?dark:bg-slate-\d+(?:\/\d+)?\b/g, ''],
  [/\s?dark:text-slate-\d+(?:\/\d+)?\b/g, ''],
  [/\s?dark:border-slate-\d+(?:\/\d+)?\b/g, ''],
  [/\s?dark:hover:bg-slate-\d+(?:\/\d+)?\b/g, ''],
  [/\s?dark:hover:text-slate-\d+(?:\/\d+)?\b/g, ''],
  [/\s?dark:hover:border-slate-\d+(?:\/\d+)?\b/g, ''],

  // ── Gradients ─────────────────────────────────────────────────────────────
  [/\bfrom-blue-\d+(?:\/\d+)?\b/g, 'from-[var(--primary)]'],
  [/\bfrom-indigo-\d+(?:\/\d+)?\b/g, 'from-[var(--primary)]'],
  [/\bfrom-slate-\d+(?:\/\d+)?\b/g, 'from-[var(--bg-page)]'],
  [/\bto-blue-\d+(?:\/\d+)?\b/g, 'to-[var(--primary-light)]'],
  [/\bto-indigo-\d+(?:\/\d+)?\b/g, 'to-[var(--primary-light)]'],
  [/\bto-slate-\d+(?:\/\d+)?\b/g, 'to-[var(--bg-page)]'],

  // ── Hover backgrounds ─────────────────────────────────────────────────────
  [/\bhover:bg-indigo-\d+(?:\/\d+)?\b/g, 'hover:bg-[var(--primary-hover)]'],
  [/\bhover:bg-blue-\d+(?:\/\d+)?\b/g, 'hover:bg-[var(--primary-hover)]'],
  [/\bhover:bg-slate-50\b/g, 'hover:bg-[var(--bg-surface)]'],
  [/\bhover:bg-slate-100\b/g, 'hover:bg-[var(--bg-surface)]'],
  [/\bhover:bg-slate-200\b/g, 'hover:bg-[var(--bg-card)]'],
  [/\bhover:bg-slate-800\b/g, 'hover:bg-[var(--bg-page)]'],
  [/\bhover:bg-slate-900\b/g, 'hover:bg-[var(--bg-page)]'],
  [/\bhover:bg-green-\d+(?:\/\d+)?\b/g, 'hover:bg-[var(--success)]'],
  [/\bhover:bg-red-\d+(?:\/\d+)?\b/g, 'hover:bg-[var(--danger)]'],
  [/\bhover:bg-amber-\d+(?:\/\d+)?\b/g, 'hover:bg-[var(--warning)]'],
  [/\bhover:bg-emerald-\d+(?:\/\d+)?\b/g, 'hover:bg-[var(--success)]'],

  // ── Hover text ────────────────────────────────────────────────────────────
  [/\bhover:text-indigo-\d+(?:\/\d+)?\b/g, 'hover:text-[var(--primary)]'],
  [/\bhover:text-blue-\d+(?:\/\d+)?\b/g, 'hover:text-[var(--primary)]'],
  [/\bhover:text-slate-\d+(?:\/\d+)?\b/g, 'hover:text-[var(--text-secondary)]'],
  [/\bhover:text-green-\d+(?:\/\d+)?\b/g, 'hover:text-[var(--success)]'],
  [/\bhover:text-red-\d+(?:\/\d+)?\b/g, 'hover:text-[var(--danger)]'],
  [/\bhover:text-amber-\d+(?:\/\d+)?\b/g, 'hover:text-[var(--warning)]'],

  // ── Hover border ──────────────────────────────────────────────────────────
  [/\bhover:border-slate-\d+(?:\/\d+)?\b/g, 'hover:border-[var(--border-default)]'],
  [/\bhover:border-indigo-\d+(?:\/\d+)?\b/g, 'hover:border-[var(--primary)]'],
  [/\bhover:border-blue-\d+(?:\/\d+)?\b/g, 'hover:border-[var(--primary)]'],

  // ── Focus ring / outline ───────────────────────────────────────────────────
  [/\bfocus:ring-indigo-\d+(?:\/\d+)?\b/g, 'focus:ring-[var(--primary)]'],
  [/\bfocus:ring-blue-\d+(?:\/\d+)?\b/g, 'focus:ring-[var(--primary)]'],
  [/\bfocus:ring-slate-\d+(?:\/\d+)?\b/g, 'focus:ring-[var(--border-strong)]'],
  [/\bfocus:border-indigo-\d+(?:\/\d+)?\b/g, 'focus:border-[var(--primary)]'],
  [/\bfocus:border-blue-\d+(?:\/\d+)?\b/g, 'focus:border-[var(--primary)]'],
  [/\bfocus:border-slate-\d+(?:\/\d+)?\b/g, 'focus:border-[var(--border-default)]'],
  [/\bfocus-visible:ring-indigo-\d+(?:\/\d+)?\b/g, 'focus-visible:ring-[var(--primary)]'],
  [/\bfocus-visible:ring-blue-\d+(?:\/\d+)?\b/g, 'focus-visible:ring-[var(--primary)]'],
  [/\bfocus-visible:ring-slate-\d+(?:\/\d+)?\b/g, 'focus-visible:ring-[var(--border-strong)]'],

  // ── Backgrounds ──────────────────────────────────────────────────────────
  [/\bbg-slate-50\b/g, 'bg-[var(--bg-surface)]'],
  [/\bbg-slate-100\b/g, 'bg-[var(--bg-surface)]'],
  [/\bbg-slate-200\b/g, 'bg-[var(--bg-card)]'],
  [/\bbg-slate-300\b/g, 'bg-[var(--bg-card)]'],
  [/\bbg-slate-400\b/g, 'bg-[var(--bg-card)]'],
  [/\bbg-slate-700\b/g, 'bg-[var(--bg-page)]'],
  [/\bbg-slate-800\b/g, 'bg-[var(--bg-page)]'],
  [/\bbg-slate-900\b/g, 'bg-[var(--bg-page)]'],
  [/\bbg-slate-950\b/g, 'bg-[var(--bg-page)]'],
  [/\bbg-indigo-\d+(?:\/\d+)?\b/g, 'bg-[var(--primary)]'],
  [/\bbg-blue-\d+(?:\/\d+)?\b/g, 'bg-[var(--primary)]'],
  [/\bbg-green-\d+(?:\/\d+)?\b/g, 'bg-[var(--success)]'],
  [/\bbg-emerald-\d+(?:\/\d+)?\b/g, 'bg-[var(--success)]'],
  [/\bbg-red-\d+(?:\/\d+)?\b/g, 'bg-[var(--danger)]'],
  [/\bbg-amber-\d+(?:\/\d+)?\b/g, 'bg-[var(--warning)]'],

  // ── Text ─────────────────────────────────────────────────────────────────
  [/\btext-slate-900\b/g, 'text-[var(--text-primary)]'],
  [/\btext-slate-800\b/g, 'text-[var(--text-primary)]'],
  [/\btext-slate-700\b/g, 'text-[var(--text-primary)]'],
  [/\btext-slate-50\b/g, 'text-[var(--text-primary)]'],
  [/\btext-slate-100\b/g, 'text-[var(--text-primary)]'],
  [/\btext-slate-600\b/g, 'text-[var(--text-secondary)]'],
  [/\btext-slate-500\b/g, 'text-[var(--text-secondary)]'],
  [/\btext-slate-400\b/g, 'text-[var(--text-muted)]'],
  [/\btext-slate-300\b/g, 'text-[var(--text-muted)]'],
  [/\btext-slate-200\b/g, 'text-[var(--text-muted)]'],
  [/\btext-indigo-\d+(?:\/\d+)?\b/g, 'text-[var(--primary)]'],
  [/\btext-blue-\d+(?:\/\d+)?\b/g, 'text-[var(--primary)]'],
  [/\btext-green-\d+(?:\/\d+)?\b/g, 'text-[var(--success)]'],
  [/\btext-emerald-\d+(?:\/\d+)?\b/g, 'text-[var(--success)]'],
  [/\btext-red-\d+(?:\/\d+)?\b/g, 'text-[var(--danger)]'],
  [/\btext-amber-\d+(?:\/\d+)?\b/g, 'text-[var(--warning)]'],

  // ── Borders ──────────────────────────────────────────────────────────────
  [/\bborder-slate-200\b/g, 'border-[var(--border-default)]'],
  [/\bborder-slate-300\b/g, 'border-[var(--border-default)]'],
  [/\bborder-slate-100\b/g, 'border-[var(--border-default)]'],
  [/\bborder-slate-700\b/g, 'border-[var(--border-strong)]'],
  [/\bborder-slate-800\b/g, 'border-[var(--border-strong)]'],
  [/\bborder-slate-900\b/g, 'border-[var(--border-strong)]'],
  [/\bborder-slate-400\b/g, 'border-[var(--border-default)]'],
  [/\bborder-slate-500\b/g, 'border-[var(--border-default)]'],
  [/\bborder-slate-600\b/g, 'border-[var(--border-strong)]'],
  [/\bborder-indigo-\d+(?:\/\d+)?\b/g, 'border-[var(--primary)]'],
  [/\bborder-blue-\d+(?:\/\d+)?\b/g, 'border-[var(--primary)]'],
  [/\bborder-green-\d+(?:\/\d+)?\b/g, 'border-[var(--success)]'],
  [/\bborder-red-\d+(?:\/\d+)?\b/g, 'border-[var(--danger)]'],
  [/\bborder-amber-\d+(?:\/\d+)?\b/g, 'border-[var(--warning)]'],
  [/\bborder-emerald-\d+(?:\/\d+)?\b/g, 'border-[var(--success)]'],

  // ── Ring colors ──────────────────────────────────────────────────────────
  [/\bring-indigo-\d+(?:\/\d+)?\b/g, 'ring-[var(--primary)]'],
  [/\bring-blue-\d+(?:\/\d+)?\b/g, 'ring-[var(--primary)]'],
  [/\bring-slate-\d+(?:\/\d+)?\b/g, 'ring-[var(--border-strong)]'],
  [/\bring-green-\d+(?:\/\d+)?\b/g, 'ring-[var(--success)]'],
  [/\bring-red-\d+(?:\/\d+)?\b/g, 'ring-[var(--danger)]'],

  // ── Divide colors ────────────────────────────────────────────────────────
  [/\bdivide-slate-\d+(?:\/\d+)?\b/g, 'divide-[var(--border-default)]'],

  // ── Placeholder text ──────────────────────────────────────────────────────
  [/\bplaceholder-slate-\d+(?:\/\d+)?\b/g, 'placeholder-[var(--text-muted)]'],
  [/\bplaceholder:text-slate-\d+(?:\/\d+)?\b/g, 'placeholder:text-[var(--text-muted)]'],

  // ── Outline ───────────────────────────────────────────────────────────────
  [/\boutline-slate-\d+(?:\/\d+)?\b/g, 'outline-[var(--border-default)]'],
  [/\boutline-indigo-\d+(?:\/\d+)?\b/g, 'outline-[var(--primary)]'],
  [/\boutline-blue-\d+(?:\/\d+)?\b/g, 'outline-[var(--primary)]'],

  // ── Shadow with color ─────────────────────────────────────────────────────
  [/\bshadow-indigo-\d+(?:\/\d+)?\b/g, 'shadow-[var(--primary)]'],
  [/\bshadow-blue-\d+(?:\/\d+)?\b/g, 'shadow-[var(--primary)]'],
  [/\bshadow-slate-\d+(?:\/\d+)?\b/g, 'shadow-[var(--border-default)]'],

  // ── Decoration ───────────────────────────────────────────────────────────
  [/\bdecoration-indigo-\d+(?:\/\d+)?\b/g, 'decoration-[var(--primary)]'],
  [/\bdecoration-blue-\d+(?:\/\d+)?\b/g, 'decoration-[var(--primary)]'],
  [/\bdecoration-slate-\d+(?:\/\d+)?\b/g, 'decoration-[var(--text-muted)]'],

  // ── Caret / accent ────────────────────────────────────────────────────────
  [/\bcaret-indigo-\d+(?:\/\d+)?\b/g, 'caret-[var(--primary)]'],
  [/\bcaret-blue-\d+(?:\/\d+)?\b/g, 'caret-[var(--primary)]'],
  [/\baccent-indigo-\d+(?:\/\d+)?\b/g, 'accent-[var(--primary)]'],
  [/\baccent-blue-\d+(?:\/\d+)?\b/g, 'accent-[var(--primary)]'],

  // ── via gradient stop ─────────────────────────────────────────────────────
  [/\bvia-blue-\d+(?:\/\d+)?\b/g, 'via-[var(--primary)]'],
  [/\bvia-indigo-\d+(?:\/\d+)?\b/g, 'via-[var(--primary)]'],
  [/\bvia-slate-\d+(?:\/\d+)?\b/g, 'via-[var(--bg-card)]'],

  // ── Remaining slate bg variants not yet caught ────────────────────────────
  [/\bbg-slate-500\b/g, 'bg-[var(--bg-card)]'],
  [/\bbg-slate-600\b/g, 'bg-[var(--bg-card)]'],
];

let totalChanged = 0;
let filesChanged = 0;

for (const filePath of getAllFiles(ROOT)) {
  let content = readFileSync(filePath, 'utf8');
  const original = content;
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  if (content !== original) {
    writeFileSync(filePath, content, 'utf8');
    filesChanged++;
    totalChanged++;
    console.log(`Updated: ${filePath.replace('d:/Projects/chatbot-ai/src/', '')}`);
  }
}


console.log(`\nDone. Updated ${filesChanged} files.`);
