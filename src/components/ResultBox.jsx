import { useState } from 'react';
import { BlockMath, InlineMath } from './MathView.jsx';

/**
 * Komponen ResultBox: menampilkan ringkasan hasil turunan simbolik dan evaluasi x0
 */
export default function ResultBox({ result }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const {
    latexExpression,
    latexDerivative,
    hasX0,
    x0,
    f_x0,
    latex_f_x0,
    f_prime_x0,
    latex_f_prime_x0,
    tangentLine,
  } = result;

  const copyToClipboard = () => {
    let textToCopy = `f'(x) = ${result.derivative}`;
    if (hasX0 && tangentLine) {
      textToCopy += `\nNilai di x0 = ${x0}: f(${x0}) = ${f_x0}, f'(${x0}) = ${f_prime_x0}\nPersamaan Garis Singgung: ${tangentLine.equation}`;
    }
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/60 to-white p-5 shadow-sm dark:border-blue-900/40 dark:from-slate-900 dark:to-slate-900/90 sm:p-6">
      {/* Header ResultBox */}
      <div className="flex items-center justify-between border-b border-blue-100/80 pb-3 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white dark:bg-blue-500">
            ✓
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Hasil Perhitungan
          </h3>
        </div>

        <button
          type="button"
          onClick={copyToClipboard}
          className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {copied ? (
            <>
              <span className="text-emerald-600 dark:text-emerald-400">✓</span>
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <span>Salin</span>
            </>
          )}
        </button>
      </div>

      {/* Kartu Utama: f'(x) */}
      <div className="rounded-xl border border-blue-200/80 bg-white p-4 shadow-xs dark:border-blue-900/60 dark:bg-slate-800/80">
        <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Turunan Pertama f'(x)
        </div>
        <div className="mt-2 text-blue-900 dark:text-blue-100">
          <BlockMath math={`f'(x) = ${latexDerivative}`} />
        </div>
      </div>

      {/* Informasi Tambahan Jika Titik x0 Diberikan */}
      {hasX0 && tangentLine && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Nilai f(x0) dan kemiringan m */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Evaluasi di Titik <InlineMath math={`x_0 = ${x0}`} />
            </div>
            <div className="mt-2 space-y-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 dark:border-slate-700/60">
                <span>Nilai fungsi:</span>
                <InlineMath math={`f(${x0}) = ${latex_f_x0}`} />
              </div>
              <div className="flex items-center justify-between pt-1">
                <span>Kemiringan (gradien m):</span>
                <InlineMath math={`m = f'(${x0}) = ${latex_f_prime_x0}`} />
              </div>
            </div>
          </div>

          {/* Persamaan Garis Singgung */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Persamaan Garis Singgung di ({x0}, {latex_f_x0})
            </div>
            <div className="mt-2 text-slate-900 dark:text-slate-100">
              <BlockMath math={tangentLine.latexEquation} />
            </div>
            <div className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
              Bentuk titik-kemiringan: <InlineMath math={tangentLine.pointSlopeForm} />
            </div>
          </div>
        </div>
      )}

      {/* Info Fungsi Awal */}
      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
        <span>Fungsi awal:</span>
        <InlineMath math={`f(x) = ${latexExpression}`} />
      </div>
    </div>
  );
}
