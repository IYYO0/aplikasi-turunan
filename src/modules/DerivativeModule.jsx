import { useState } from 'react';
import MathInput from '../components/MathInput.jsx';
import ResultBox from '../components/ResultBox.jsx';
import StepCard from '../components/StepCard.jsx';
import GraphView from '../components/GraphView.jsx';
import { calculateDerivative } from '../engine/derivative.js';

export default function DerivativeModule() {
  const [expr, setExpr] = useState('x^3 - 4*x^2 + 5*x - 7');
  const [x0, setX0] = useState('2');
  const [result, setResult] = useState(() => {
    try {
      return calculateDerivative('x^3 - 4*x^2 + 5*x - 7', '2');
    } catch {
      return null;
    }
  });
  const [error, setError] = useState('');

  // Contoh soal untuk dicoba cepat oleh pengguna
  const examplePresets = [
    { label: 'Polinomial', expr: 'x^4 - 3*x^2 + 5', x0: '1' },
    { label: 'Hasil Kali', expr: 'x * sin(x)', x0: '2' },
    { label: 'Hasil Bagi', expr: '(x + 1) / (x - 1)', x0: '2' },
    { label: 'Aturan Rantai (Trig)', expr: 'sin(x^2)', x0: '1' },
    { label: 'Aturan Rantai (Pangkat)', expr: '(2*x + 1)^3', x0: '0' },
    { label: 'Logaritma ln(x)', expr: 'ln(x)', x0: '1' },
    { label: 'Eksponensial eˣ', expr: 'e^(2*x)', x0: '0' },
  ];

  const handleCalculate = (targetExpr = expr, targetX0 = x0) => {
    setError('');
    try {
      const res = calculateDerivative(targetExpr, targetX0);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menghitung turunan.');
      setResult(null);
    }
  };

  const handleSelectPreset = (preset) => {
    setExpr(preset.expr);
    setX0(preset.x0);
    handleCalculate(preset.expr, preset.x0);
  };

  const handleClear = () => {
    setExpr('');
    setX0('');
    setResult(null);
    setError('');
  };

  return (
    <div className="space-y-8">
      {/* Kartu Input & Konfigurasi */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="mb-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Modul Turunan (Diferensiasi)
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Hitung turunan pertama <span className="font-mono font-medium text-blue-600 dark:text-blue-400">f'(x)</span> secara simbolik lengkap dengan aturan yang digunakan, nilai turunan pada titik tertentu, serta persamaan dan visualisasi garis singgungnya.
          </p>
        </div>

        {/* Contoh Cepat / Presets */}
        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Contoh Cepat:
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {examplePresets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50/70 hover:text-blue-700 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-slate-700 dark:hover:text-blue-300"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Input */}
        <div className="space-y-5">
          <MathInput
            id="derivative-expr"
            label="Masukkan Fungsi f(x)"
            value={expr}
            onChange={setExpr}
            onEnter={() => handleCalculate()}
            placeholder="Contoh: x^3 - 4*x^2 + 5 atau x * sin(x)"
            helperText="Gunakan tombol pintasan di atas untuk memasukkan fungsi pangkat, trigonometri, ln, atau akar."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="x0-input" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Titik Evaluasi x₀ <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(Opsional)</span>
              </label>
              <input
                id="x0-input"
                type="text"
                value={x0}
                onChange={(e) => setX0(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                placeholder="Contoh: 2, -1, 0.5, pi"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-sm tracking-wide text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Diperlukan untuk menghitung garis singgung dan kemiringan m di titik x₀.
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-end space-x-3">
              <button
                type="button"
                onClick={() => handleCalculate()}
                className="flex-1 inline-flex items-center justify-center space-x-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Hitung Turunan</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Pesan Error */}
        {error && (
          <div className="mt-5 flex items-start space-x-3 rounded-2xl border border-red-200 bg-red-50/70 p-4 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            <svg className="h-5 w-5 shrink-0 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="text-sm font-bold">Terjadi Kesalahan</h4>
              <p className="mt-0.5 text-xs text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}
      </section>

      {/* Bagian Hasil & Grafik & Langkah */}
      {result && (
        <div className="space-y-8">
          {/* Ringkasan Hasil */}
          <section>
            <ResultBox result={result} />
          </section>

          {/* Grafik Fungsi dan Garis Singgung */}
          <section>
            <GraphView
              normalizedExpr={result.normalizedExpression}
              x0={result.hasX0 ? result.x0 : null}
              f_x0={result.hasX0 ? result.f_x0 : null}
              tangent={result.tangentLine}
            />
          </section>

          {/* Langkah-Langkah Perhitungan */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
                  Langkah-Langkah Perhitungan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Penjabaran sistematis aturan kalkulus yang diterapkan
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {result.steps.length} Langkah
              </span>
            </div>

            <div className="space-y-4">
              {result.steps.map((st) => (
                <StepCard
                  key={st.stepNumber}
                  stepNumber={st.stepNumber}
                  title={st.title}
                  rule={st.rule}
                  explanation={st.explanation}
                  latex={st.latex}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
