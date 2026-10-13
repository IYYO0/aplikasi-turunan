import { useRef } from 'react';

/**
 * Komponen MathInput reusable: input teks dengan tombol pintasan simbol kalkulus
 */
export default function MathInput({
  id = 'math-input',
  label = 'Fungsi f(x)',
  value = '',
  onChange,
  onEnter,
  placeholder = 'Contoh: x^3 - 4*x^2 + 5 atau sin(x^2)',
  helperText = '',
  error = '',
  className = '',
}) {
  const inputRef = useRef(null);

  // Daftar tombol cepat
  const quickButtons = [
    { label: 'x²', insert: '^2', cursorOffset: 2 },
    { label: 'x³', insert: '^3', cursorOffset: 2 },
    { label: 'xⁿ', insert: '^', cursorOffset: 1 },
    { label: '√', insert: 'sqrt()', cursorOffset: 5 },
    { label: 'sin', insert: 'sin()', cursorOffset: 4 },
    { label: 'cos', insert: 'cos()', cursorOffset: 4 },
    { label: 'tan', insert: 'tan()', cursorOffset: 4 },
    { label: 'ln', insert: 'ln()', cursorOffset: 3 },
    { label: 'eˣ', insert: 'e^', cursorOffset: 2 },
    { label: 'π', insert: 'pi', cursorOffset: 2 },
    { label: '÷', insert: '/', cursorOffset: 1 },
    { label: '×', insert: '*', cursorOffset: 1 },
    { label: '(', insert: '(', cursorOffset: 1 },
    { label: ')', insert: ')', cursorOffset: 1 },
  ];

  const handleInsert = (snippet, cursorOffset) => {
    const input = inputRef.current;
    if (!input) {
      onChange(value + snippet);
      return;
    }

    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const before = value.substring(0, start);
    const after = value.substring(end);

    const newValue = before + snippet + after;
    onChange(newValue);

    // Kembalikan fokus dan tempatkan kursor pada posisi ideal
    setTimeout(() => {
      input.focus();
      const newPos = start + cursorOffset;
      input.setSelectionRange(newPos, newPos);
    }, 10);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onEnter) {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-xl border px-4 py-3 font-mono text-base tracking-wide transition-all focus:outline-none focus:ring-2 dark:bg-slate-800/80 dark:text-white ${
            error
              ? 'border-red-400 bg-red-50/50 text-red-900 focus:border-red-500 focus:ring-red-500/20 dark:border-red-600 dark:bg-red-950/20 dark:text-red-200'
              : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-700'
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            title="Hapus input"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Tombol pintasan simbol (Scrollable pada perangkat mobile) */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-0.5 text-xs">
        <span className="shrink-0 text-slate-400 dark:text-slate-500">Pintasan:</span>
        {quickButtons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={() => handleInsert(btn.insert, btn.cursorOffset)}
            className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-slate-700 dark:hover:text-blue-300"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Pesan bantuan atau error */}
      {error ? (
        <p className="flex items-center space-x-1 text-xs font-medium text-red-600 dark:text-red-400">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
