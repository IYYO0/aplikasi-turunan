import { BlockMath } from '../components/MathView.jsx';

/**
 * Komponen Placeholder untuk modul yang akan hadir pada tahap berikutnya
 */
export default function PlaceholderModule({
  title = 'Modul Kalkulus',
  latex = '',
  description = 'Modul ini sedang disiapkan dan akan segera hadir pada tahap berikutnya.',
  onSwitchToDerivative,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/50 p-8 text-center backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/50 sm:p-12">
      <div className="mb-4 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
        Tahap Selanjutnya
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        {title}
      </h2>

      {latex && (
        <div className="my-6 rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 shadow-inner dark:border-slate-800 dark:bg-slate-950/50">
          <BlockMath math={latex} />
        </div>
      )}

      <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>

      {onSwitchToDerivative && (
        <button
          type="button"
          onClick={onSwitchToDerivative}
          className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <span>Buka Modul Turunan (Aktif)</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      )}
    </div>
  );
}
