/**
 * Utilitas untuk manipulasi dan format ekspresi LaTeX KaTeX
 */

/**
 * Memformat angka desimal atau bulat agar rapi
 * @param {number} num 
 * @param {number} precision 
 * @returns {string}
 */
export function formatNumber(num, precision = 4) {
  if (num === null || num === undefined || Number.isNaN(num)) return '';
  if (Number.isInteger(num)) return num.toString();
  // Bulatkan jika sangat dekat dengan bilangan bulat
  if (Math.abs(num - Math.round(num)) < 1e-9) {
    return Math.round(num).toString();
  }
  const factor = Math.pow(10, precision);
  const rounded = Math.round(num * factor) / factor;
  return rounded.toString();
}

/**
 * Memecah string LaTeX penjumlahan/pengurangan di kedalaman tanda kurung 0
 * @param {string} str
 * @returns {Array<{ sign: string, text: string }>}
 */
function splitTopLevelTerms(str) {
  const terms = [];
  let depth = 0;
  let current = '';
  let sign = '+';

  const trimmed = str.trim();
  let startIdx = 0;
  if (trimmed.startsWith('-')) {
    sign = '-';
    startIdx = 1;
  } else if (trimmed.startsWith('+')) {
    sign = '+';
    startIdx = 1;
  }

  for (let i = startIdx; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === '{' || ch === '(' || ch === '[') {
      depth++;
      current += ch;
    } else if (ch === '}' || ch === ')' || ch === ']') {
      depth--;
      current += ch;
    } else if (depth === 0 && (ch === '+' || ch === '-')) {
      if (current.trim()) {
        terms.push({ sign, text: current.trim() });
      }
      sign = ch;
      current = '';
    } else {
      current += ch;
    }
  }

  if (current.trim()) {
    terms.push({ sign, text: current.trim() });
  }

  return terms;
}

/**
 * Menghitung derajat x untuk suku polinomial aljabar
 * @param {string} text
 * @returns {number}
 */
function getTermDegree(text) {
  // Jika memuat fungsi matematika non-aljabar sederhana, jangan diurutkan
  if (/\\(sin|cos|tan|ln|log|exp|sqrt|frac|csc|sec|cot)\b/.test(text)) {
    return -1;
  }

  // Cek x dengan pangkat: x^3, x^2, x^{3}, dll.
  const powMatch = text.match(/(?<![a-zA-Z])x(?:\^\{?(\d+)\}?)/);
  if (powMatch) {
    return parseInt(powMatch[1], 10);
  }

  // Cek x linear (pangkat 1) tanpa tanda pangkat
  if (/(?<![a-zA-Z])x(?![a-zA-Z0-9^])/.test(text)) {
    return 1;
  }

  // Cek konstanta murni (tidak memuat variabel x)
  if (!/(?<![a-zA-Z])x/.test(text)) {
    return 0;
  }

  return -1;
}

/**
 * Mengurutkan suku-suku polinomial pada ekspresi LaTeX berdasarkan derajat x secara menurun
 * Misal: "-8x + 3x^2 + 5" atau "5 - 8x + 3x^2" -> "3x^2 - 8x + 5"
 * @param {string} expr
 * @returns {string}
 */
export function sortPolynomialTerms(expr) {
  if (!expr || typeof expr !== 'string') return '';
  const terms = splitTopLevelTerms(expr);
  if (terms.length <= 1) return expr;

  // Analisis derajat masing-masing suku
  const analyzed = terms.map((t, idx) => ({
    ...t,
    degree: getTermDegree(t.text),
    originalIndex: idx,
  }));

  // Jika ada suku yang bukan suku polinomial sederhana, jangan ubah urutan
  if (analyzed.some((t) => t.degree === -1)) {
    return expr;
  }

  // Cek apakah urutan sudah menurun
  let isSorted = true;
  for (let i = 0; i < analyzed.length - 1; i++) {
    if (analyzed[i].degree < analyzed[i + 1].degree) {
      isSorted = false;
      break;
    }
  }
  if (isSorted) return expr;

  // Urutkan secara menurun berdasarkan derajat x
  analyzed.sort((a, b) => {
    if (b.degree !== a.degree) {
      return b.degree - a.degree;
    }
    return a.originalIndex - b.originalIndex;
  });

  // Gabungkan kembali suku-suku
  let result = '';
  analyzed.forEach((t, i) => {
    if (i === 0) {
      result += t.sign === '-' ? `-${t.text}` : t.text;
    } else {
      result += t.sign === '-' ? ` - ${t.text}` : ` + ${t.text}`;
    }
  });

  return result;
}

/**
 * Membersihkan ekspresi LaTeX dari mathjs agar tampilan KaTeX lebih ramah dan natural
 * @param {string} tex 
 * @returns {string}
 */
export function cleanLatex(tex) {
  if (!tex) return '';
  let res = tex;

  // 1. Ganti \log dengan \ln untuk logaritma natural
  res = res.replace(/\\log\\left/g, '\\ln\\left');
  res = res.replace(/\\log\b/g, '\\ln');

  // 2. Ganti perkalian \cdot antara angka dan variabel menjadi penulisan aljabar biasa
  // Contoh: 3\cdot x^2 -> 3x^2, 3\cdot{ x}^{2} -> 3x^2, 5\cdot x -> 5x, 4\cdotx^2 -> 4x^2
  res = res.replace(/(\d+(?:\.\d+)?)\s*\\cdot\s*(?:\{\s*([a-zA-Z])\s*\}|([a-zA-Z]))/g, (match, num, v1, v2) => {
    return `${num}${v1 || v2}`;
  });

  // 3. Pastikan \cdot yang diikuti kurung variabel { x } tidak menjadi \cdotx saat kurung dihilangkan
  res = res.replace(/\\cdot\s*\{\s*([a-zA-Z])\s*\}/g, '\\cdot $1');

  // 4. Rapikan kurung kurawal berlebih pada variabel tunggal: { x } -> x
  // Jangan hapus jika didahului perintah LaTeX seperti \sqrt, \frac, \left, dll.
  res = res.replace(/(?<!\\[a-zA-Z]+)\{\s*([a-zA-Z])\s*\}/g, '$1');

  // 5. Rapikan pangkat tunggal satu karakter: x^{2} -> x^2, x^{3} -> x^3
  res = res.replace(/\^\{\s*([0-9a-zA-Z])\s*\}/g, '^$1');

  // 6. Pastikan selalu ada spasi setelah perintah seperti \cdot, \sin, \cos, \ln jika diikuti karakter huruf/angka
  // Contoh: \cdotx -> \cdot x, \sinx -> \sin x, \cosx -> \cos x, \lnx -> \ln x
  res = res.replace(/\\(cdot|sin|cos|tan|ln|exp)(?=[a-zA-Z0-9])/g, '\\$1 ');

  // 7. Jika \cdot diikuti perintah LaTeX lain tanpa spasi (misal \cdot\sin), tambahkan spasi
  res = res.replace(/\\cdot(?=\\[a-zA-Z])/g, '\\cdot ');

  // 8. Urutkan suku-suku turunan polinomial agar tampil rapi (misal: 3x^2 - 8x + 5)
  res = sortPolynomialTerms(res);

  return res.trim();
}

/**
 * Format persamaan garis singgung dalam bentuk kemiringan-titik potong (y = mx + c)
 * dan titik-kemiringan (y - y0 = m(x - x0))
 */
export function formatTangentLineLatex(m, c, x0, y0) {
  const mRounded = Number.isInteger(m) ? m : Math.round(m * 10000) / 10000;
  const cRounded = Number.isInteger(c) ? c : Math.round(c * 10000) / 10000;
  const x0Rounded = Number.isInteger(x0) ? x0 : Math.round(x0 * 10000) / 10000;
  const y0Rounded = Number.isInteger(y0) ? y0 : Math.round(y0 * 10000) / 10000;

  // Bentuk y = mx + c
  let slopeIntercept = '';
  if (mRounded === 0) {
    slopeIntercept = `y = ${cRounded}`;
  } else {
    let mPart = '';
    if (mRounded === 1) mPart = 'x';
    else if (mRounded === -1) mPart = '-x';
    else mPart = `${mRounded}x`;

    if (cRounded === 0) {
      slopeIntercept = `y = ${mPart}`;
    } else if (cRounded > 0) {
      slopeIntercept = `y = ${mPart} + ${cRounded}`;
    } else {
      slopeIntercept = `y = ${mPart} - ${Math.abs(cRounded)}`;
    }
  }

  // Bentuk titik-kemiringan: y - y0 = m(x - x0)
  let yPart = 'y';
  if (y0Rounded > 0) yPart = `y - ${y0Rounded}`;
  else if (y0Rounded < 0) yPart = `y + ${Math.abs(y0Rounded)}`;

  let xPart = 'x';
  if (x0Rounded > 0) xPart = `(x - ${x0Rounded})`;
  else if (x0Rounded < 0) xPart = `(x + ${Math.abs(x0Rounded)})`;
  else xPart = 'x';

  let mFactor = '';
  if (mRounded === 1) mFactor = '';
  else if (mRounded === -1) mFactor = '-';
  else mFactor = `${mRounded}`;

  const pointSlope = `${yPart} = ${mFactor}${xPart}`;

  return {
    slopeIntercept,
    pointSlope,
  };
}
