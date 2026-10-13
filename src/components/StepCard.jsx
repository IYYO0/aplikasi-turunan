import { BlockMath, InlineMath, MathText } from './MathView.jsx';
import { cleanLatex } from '../utils/latex.js';

/**
 * Render judul langkah dengan aman:
 * Jika memuat format "Turunan Suku ke-X: <latex>", render bagian latex dengan InlineMath.
 * Jika memuat notasi $...$, gunakan MathText.
 * Selain itu, tampilkan sebagai teks biasa.
 */
function renderTitle(title) {
  if (!title) return null;

  if (title.includes('$')) {
    return <MathText text={title} />;
  }

  // Format "Turunan Suku ke-X: <ekspresi latex>"
  const colonIndex = title.indexOf(': ');
  if (colonIndex !== -1) {
    const label = title.slice(0, colonIndex + 2);
    const mathPart = title.slice(colonIndex + 2);
    const cleaned = cleanLatex(mathPart);

    return (
      <span className="inline-flex items-center gap-1.5 flex-wrap">
        <span>{label}</span>
        <InlineMath math={cleaned} />
      </span>
    );
  }

  return title;
}

/**
 * Komponen StepCard: menampilkan penjelasan langkah turunan dan rumus KaTeX
 */
export default function StepCard({
  stepNumber = 1,
  title = '',
  rule = '',
  explanation = '',
  latex = '',
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      {/* Header Langkah */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800/80">
        <div className="flex items-center space-x-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm dark:bg-blue-500">
            {stepNumber}
          </span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 sm:text-base">
            {renderTitle(title)}
          </h4>
        </div>

        {rule && (
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
            {rule}
          </span>
        )}
      </div>

      {/* Deskripsi & Penjelasan */}
      {explanation && (
        <div className="pt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            <MathText text={explanation} />
          </p>
        </div>
      )}

      {/* Tampilan Rumus KaTeX */}
      {latex && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100 overflow-x-auto dark:border-slate-800 dark:bg-slate-950/60">
          <BlockMath math={latex} />
        </div>
      )}
    </div>
  );
}

