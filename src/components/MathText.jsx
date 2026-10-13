import { InlineMath } from './MathView.jsx';
import { cleanLatex } from '../utils/latex.js';

/**
 * Komponen MathText: memecah teks pada pola $...$
 * lalu merender potongan di antaranya dengan InlineMath dan sisanya sebagai teks biasa.
 *
 * @param {object} props
 * @param {string} props.text - Teks penjelasan yang memuat notasi matematika $...$
 * @param {string} [props.className] - Kelas CSS tambahan
 */
export default function MathText({ text = '', className = '' }) {
  if (!text || typeof text !== 'string') {
    return text || null;
  }

  // Jika tidak memuat pola $, kembalikan sebagai teks biasa
  if (!text.includes('$')) {
    return <span className={className}>{text}</span>;
  }

  // Pecah teks pada tanda $...$
  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
          const rawMath = part.slice(1, -1);
          return (
            <InlineMath
              key={index}
              math={cleanLatex(rawMath)}
              className="mx-0.5"
            />
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
