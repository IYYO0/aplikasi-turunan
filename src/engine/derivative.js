import * as math from 'mathjs';
import { cleanLatex, formatNumber, formatTangentLineLatex } from '../utils/latex.js';

/**
 * Normalisasi string input matematika sebelum diproses oleh mathjs
 * @param {string} expr 
 * @returns {string}
 */
export function normalizeInput(expr) {
  if (!expr || typeof expr !== 'string') return '';
  let s = expr.trim();
  // Simbol pangkat superskrip
  s = s.replace(/⁰/g, '^0');
  s = s.replace(/¹/g, '^1');
  s = s.replace(/²/g, '^2');
  s = s.replace(/³/g, '^3');
  s = s.replace(/⁴/g, '^4');
  s = s.replace(/⁵/g, '^5');
  s = s.replace(/⁶/g, '^6');
  s = s.replace(/⁷/g, '^7');
  s = s.replace(/⁸/g, '^8');
  s = s.replace(/⁹/g, '^9');
  // Operator kali dan bagi
  s = s.replace(/×/g, '*');
  s = s.replace(/·/g, '*');
  s = s.replace(/÷/g, '/');
  // Simbol akar
  s = s.replace(/√\s*\(([^)]+)\)/g, 'sqrt($1)');
  s = s.replace(/√\s*([a-zA-Z0-9]+)/g, 'sqrt($1)');
  // Logaritma natural ln -> log untuk mathjs
  s = s.replace(/\bln\b/g, 'log');
  return s;
}

/**
 * Membuka kurung pembungkus (ParenthesisNode)
 */
function unwrap(node) {
  let curr = node;
  while (curr && curr.isParenthesisNode) {
    curr = curr.content;
  }
  return curr;
}

/**
 * Cek apakah sebuah AST node bergantung pada simbol tertentu (default 'x')
 */
function dependsOn(node, symbol = 'x') {
  if (!node) return false;
  return node.filter((n) => n.isSymbolNode && n.name === symbol).length > 0;
}

/**
 * Konversi node ke string LaTeX yang rapi
 */
function toTex(node) {
  if (!node) return '';
  return cleanLatex(node.toTex());
}

/**
 * Pecah ekspresi penjumlahan/pengurangan ke daftar suku dengan tandanya
 */
function getTerms(node) {
  const unwrapped = unwrap(node);
  if (unwrapped.isOperatorNode && (unwrapped.op === '+' || unwrapped.op === '-')) {
    if (unwrapped.isUnary && unwrapped.isUnary()) {
      const childTerms = getTerms(unwrapped.args[0]);
      return childTerms.map((t) => ({
        ...t,
        sign: unwrapped.op === '-' ? (t.sign === '+' ? '-' : '+') : t.sign,
      }));
    }
    const leftTerms = getTerms(unwrapped.args[0]);
    const rightTerms = getTerms(unwrapped.args[1]);
    const adjustedRight = rightTerms.map((t) => ({
      ...t,
      sign: unwrapped.op === '-' ? (t.sign === '+' ? '-' : '+') : t.sign,
    }));
    return [...leftTerms, ...adjustedRight];
  }
  return [{ sign: '+', node: unwrapped }];
}

/**
 * Deteksi aturan dan buat deskripsi turunan untuk suku individual
 */
function analyzeSingleTerm(node) {
  const n = unwrap(node);

  // 1. Konstanta
  if (!dependsOn(n, 'x')) {
    return {
      rule: 'Aturan Konstanta',
      explanation: `Karena $${toTex(n)}$ adalah konstanta yang tidak memuat variabel $x$, maka turunannya adalah $0$.`,
      formula: '\\frac{d}{dx}[c] = 0',
      dNode: math.parse('0'),
    };
  }

  // 2. Variabel x linear
  if (n.isSymbolNode && n.name === 'x') {
    return {
      rule: 'Aturan Variabel Linear',
      explanation: 'Turunan dari $x$ terhadap $x$ adalah $1$.',
      formula: '\\frac{d}{dx}[x] = 1',
      dNode: math.parse('1'),
    };
  }

  // 3. Pangkat
  if (n.isOperatorNode && n.op === '^') {
    const base = unwrap(n.args[0]);
    const exp = unwrap(n.args[1]);

    if (!dependsOn(exp, 'x')) {
      if (base.isSymbolNode && base.name === 'x') {
        const d = math.derivative(n, 'x');
        return {
          rule: 'Aturan Pangkat (Power Rule)',
          explanation: `Terapkan aturan pangkat $\\frac{d}{dx}[x^n] = n \\cdot x^{n-1}$ dengan pangkat $n = ${toTex(exp)}$.`,
          formula: '\\frac{d}{dx}[x^n] = n \\cdot x^{n-1}',
          dNode: math.simplify(d),
        };
      }
      // Pangkat dengan fungsi dalam (Aturan Rantai)
      const uPrime = math.simplify(math.derivative(base, 'x'));
      const d = math.simplify(math.derivative(n, 'x'));
      return {
        rule: 'Aturan Rantai & Pangkat (Generalized Power Rule)',
        explanation: `Fungsi berpangkat $[u(x)]^n$ dengan fungsi dalam $u(x) = ${toTex(base)}$ dan turunan dalam $u'(x) = ${toTex(uPrime)}$. Kalikan eksponen $n = ${toTex(exp)}$ ke depan, kurangi pangkat sebesar $1$, lalu kalikan dengan $u'(x)$.`,
        formula: '\\frac{d}{dx}[(u(x))^n] = n(u(x))^{n-1} \\cdot u\'(x)',
        dNode: d,
      };
    }

    if (base.isSymbolNode && base.name === 'e') {
      if (exp.isSymbolNode && exp.name === 'x') {
        return {
          rule: 'Aturan Eksponensial Alami',
          explanation: 'Turunan dari fungsi eksponensial alami $e^x$ adalah dirinya sendiri $e^x$.',
          formula: '\\frac{d}{dx}[e^x] = e^x',
          dNode: n,
        };
      }
      const uPrime = math.simplify(math.derivative(exp, 'x'));
      const d = math.simplify(math.derivative(n, 'x'));
      return {
        rule: 'Aturan Rantai & Eksponensial',
        explanation: `Fungsi eksponensial dengan eksponen komposit $u(x) = ${toTex(exp)}$ yang memiliki turunan $u'(x) = ${toTex(uPrime)}$.`,
        formula: '\\frac{d}{dx}[e^{u(x)}] = e^{u(x)} \\cdot u\'(x)',
        dNode: d,
      };
    }
  }

  // 4. Perkalian
  if (n.isOperatorNode && n.op === '*') {
    const u = unwrap(n.args[0]);
    const v = unwrap(n.args[1]);

    if (!dependsOn(u, 'x')) {
      const vPrime = math.simplify(math.derivative(v, 'x'));
      const d = math.simplify(math.derivative(n, 'x'));
      return {
        rule: 'Aturan Kelipatan Konstanta',
        explanation: `Faktorkan konstanta $c = ${toTex(u)}$ keluar dari turunan: $\\frac{d}{dx}[c \\cdot v] = c \\cdot \\frac{d}{dx}[v]$. Turunan dari $${toTex(v)}$ adalah $${toTex(vPrime)}$.`,
        formula: '\\frac{d}{dx}[c \\cdot v(x)] = c \\cdot v\'(x)',
        dNode: d,
      };
    }
    if (!dependsOn(v, 'x')) {
      const uPrime = math.simplify(math.derivative(u, 'x'));
      const d = math.simplify(math.derivative(n, 'x'));
      return {
        rule: 'Aturan Kelipatan Konstanta',
        explanation: `Faktorkan konstanta $c = ${toTex(v)}$ keluar dari turunan: $\\frac{d}{dx}[u \\cdot c] = c \\cdot u'(x) = ${toTex(v)} \\cdot (${toTex(uPrime)})$.`,
        formula: '\\frac{d}{dx}[u(x) \\cdot c] = c \\cdot u\'(x)',
        dNode: d,
      };
    }

    const uPrime = math.simplify(math.derivative(u, 'x'));
    const vPrime = math.simplify(math.derivative(v, 'x'));
    const d = math.simplify(math.derivative(n, 'x'));
    return {
      rule: 'Aturan Hasil Kali (Product Rule)',
      explanation: `Perkalian dua fungsi: $u = ${toTex(u)} \\implies u' = ${toTex(uPrime)}$ dan $v = ${toTex(v)} \\implies v' = ${toTex(vPrime)}$. Masukkan ke rumus $u'v + uv'$.`,
      formula: '\\frac{d}{dx}[u \\cdot v] = u\'v + uv\'',
      dNode: d,
    };
  }

  // 5. Pembagian
  if (n.isOperatorNode && n.op === '/') {
    const u = unwrap(n.args[0]);
    const v = unwrap(n.args[1]);

    if (!dependsOn(v, 'x')) {
      const uPrime = math.simplify(math.derivative(u, 'x'));
      const d = math.simplify(math.derivative(n, 'x'));
      return {
        rule: 'Aturan Kelipatan Konstanta (Pecahan)',
        explanation: `Penyebut adalah konstanta $${toTex(v)}$. Turunkan pembilang $${toTex(u)}$ menjadi $${toTex(uPrime)}$.`,
        formula: '\\frac{d}{dx}\\left[\\frac{u}{c}\\right] = \\frac{1}{c} u\'',
        dNode: d,
      };
    }

    const uPrime = math.simplify(math.derivative(u, 'x'));
    const vPrime = math.simplify(math.derivative(v, 'x'));
    const d = math.simplify(math.derivative(n, 'x'));
    return {
      rule: 'Aturan Hasil Bagi (Quotient Rule)',
      explanation: `Pembagian dua fungsi: pembilang $u = ${toTex(u)} \\implies u' = ${toTex(uPrime)}$ dan penyebut $v = ${toTex(v)} \\implies v' = ${toTex(vPrime)}$. Masukkan ke rumus $\\frac{u'v - uv'}{v^2}$.`,
      formula: '\\frac{d}{dx}\\left[\\frac{u}{v}\\right] = \\frac{u\'v - uv\'}{v^2}',
      dNode: d,
    };
  }

  // 6. Fungsi trigonometri / exp / log / sqrt
  if (n.isFunctionNode) {
    const funcName = n.name;
    const arg = unwrap(n.args[0]);

    if (arg.isSymbolNode && arg.name === 'x') {
      const d = math.simplify(math.derivative(n, 'x'));
      let formula = '';
      let ruleName = `Aturan Fungsi ${funcName}`;
      if (funcName === 'sin') { formula = '\\frac{d}{dx}[\\sin(x)] = \\cos(x)'; ruleName = 'Aturan Trigonometri (sin)'; }
      else if (funcName === 'cos') { formula = '\\frac{d}{dx}[\\cos(x)] = -\\sin(x)'; ruleName = 'Aturan Trigonometri (cos)'; }
      else if (funcName === 'tan') { formula = '\\frac{d}{dx}[\\tan(x)] = \\sec^2(x)'; ruleName = 'Aturan Trigonometri (tan)'; }
      else if (funcName === 'log') { formula = '\\frac{d}{dx}[\\ln(x)] = \\frac{1}{x}'; ruleName = 'Aturan Logaritma Natural (ln)'; }
      else if (funcName === 'exp') { formula = '\\frac{d}{dx}[e^x] = e^x'; ruleName = 'Aturan Eksponensial (exp)'; }
      else if (funcName === 'sqrt') { formula = '\\frac{d}{dx}[\\sqrt{x}] = \\frac{1}{2\\sqrt{x}}'; ruleName = 'Aturan Bentuk Akar'; }

      return {
        rule: ruleName,
        explanation: `Gunakan turunan standar untuk fungsi $${toTex(n)}$.`,
        formula,
        dNode: d,
      };
    }

    // Komposisi fungsi (Aturan Rantai)
    const uPrime = math.simplify(math.derivative(arg, 'x'));
    const d = math.simplify(math.derivative(n, 'x'));
    return {
      rule: `Aturan Rantai (Chain Rule) - Fungsi ${funcName === 'log' ? 'ln' : funcName}`,
      explanation: `Fungsi komposisi dengan fungsi dalam $u(x) = ${toTex(arg)}$ dan turunan dalamnya $u'(x) = ${toTex(uPrime)}$. Kalikan turunan fungsi luar dengan turunan fungsi dalam.`,
      formula: '\\frac{d}{dx}[f(u(x))] = f\'(u) \\cdot u\'(x)',
      dNode: d,
    };
  }

  // Fallback standar mathjs
  const d = math.simplify(math.derivative(n, 'x'));
  return {
    rule: 'Aturan Turunan',
    explanation: `Turunkan ekspresi $${toTex(n)}$.`,
    formula: '\\frac{d}{dx}[f(x)]',
    dNode: d,
  };
}

/**
 * Menghasilkan langkah-langkah sistematis perhitungan turunan
 */
function generateSteps(parsedNode, simplifiedDerivative) {
  const node = unwrap(parsedNode);
  const steps = [];
  let stepCount = 1;

  // Kasus 1: Suku Penjumlahan & Pengurangan
  const terms = getTerms(node);
  if (terms.length > 1) {
    steps.push({
      stepNumber: stepCount++,
      title: 'Terapkan Aturan Penjumlahan & Pengurangan',
      rule: 'Aturan Penjumlahan & Pengurangan (Sum/Difference Rule)',
      explanation: 'Sesuai dengan sifat kelinieran turunan, kita dapat menurunkan masing-masing suku secara terpisah:',
      latex: '\\frac{d}{dx}\\left[ ' + toTex(node) + ' \\right] = ' +
        terms.map((t, idx) => {
          const signStr = idx === 0 ? (t.sign === '-' ? '-' : '') : ` ${t.sign} `;
          return `${signStr}\\frac{d}{dx}\\left[ ${toTex(t.node)} \\right]`;
        }).join(''),
    });

    const evaluatedTerms = [];
    terms.forEach((t, i) => {
      const termAnalysis = analyzeSingleTerm(t.node);
      const signPrefix = t.sign === '-' ? '-' : '+';
      evaluatedTerms.push({ sign: signPrefix, dNode: termAnalysis.dNode });

      steps.push({
        stepNumber: stepCount++,
        title: `Turunan Suku ke-${i + 1}: ${toTex(t.node)}`,
        rule: termAnalysis.rule,
        explanation: termAnalysis.explanation,
        latex: termAnalysis.formula
          ? `${termAnalysis.formula} \\implies \\frac{d}{dx}\\left[ ${toTex(t.node)} \\right] = ${toTex(termAnalysis.dNode)}`
          : `\\frac{d}{dx}\\left[ ${toTex(t.node)} \\right] = ${toTex(termAnalysis.dNode)}`,
      });
    });

    steps.push({
      stepNumber: stepCount++,
      title: 'Gabungkan dan Sederhanakan Hasil Turunan',
      rule: 'Penyederhanaan Aljabar',
      explanation: 'Gabungkan seluruh hasil turunan suku di atas lalu sederhanakan bentuk aljabar akhirnya:',
      latex: `f'(x) = ${toTex(simplifiedDerivative)}`,
    });

    return steps;
  }

  // Kasus 2: Bentuk Perkalian Dua Fungsi (Aturan Hasil Kali)
  if (node.isOperatorNode && node.op === '*') {
    const u = unwrap(node.args[0]);
    const v = unwrap(node.args[1]);

    if (dependsOn(u, 'x') && dependsOn(v, 'x')) {
      const uPrime = math.simplify(math.derivative(u, 'x'));
      const vPrime = math.simplify(math.derivative(v, 'x'));

      steps.push({
        stepNumber: stepCount++,
        title: 'Identifikasi Bentuk Aturan Hasil Kali',
        rule: 'Aturan Hasil Kali (Product Rule)',
        explanation: 'Fungsi merupakan perkalian antara dua fungsi variabel $u(x)$ dan $v(x)$. Gunakan rumus:',
        latex: '\\frac{d}{dx}[u \\cdot v] = u\'(x) \\cdot v(x) + u(x) \\cdot v\'(x)',
      });

      steps.push({
        stepNumber: stepCount++,
        title: 'Tentukan Fungsi Komponen u dan v Serta Turunannya',
        rule: 'Penentuan Komponen',
        explanation: 'Identifikasi masing-masing fungsi pengali dan turunkan secara terpisah:',
        latex: `\\begin{aligned} u(x) &= ${toTex(u)} \\implies u'(x) = ${toTex(uPrime)} \\\\[6pt] v(x) &= ${toTex(v)} \\implies v'(x) = ${toTex(vPrime)} \\end{aligned}`,
      });

      steps.push({
        stepNumber: stepCount++,
        title: 'Substitusi ke Rumus Aturan Hasil Kali',
        rule: 'Substitusi Rumus',
        explanation: 'Masukkan $u, u\', v, v\'$ ke dalam rumus aturan hasil kali:',
        latex: `f'(x) = \\left(${toTex(uPrime)}\\right)\\left(${toTex(v)}\\right) + \\left(${toTex(u)}\\right)\\left(${toTex(vPrime)}\\right)`,
      });

      steps.push({
        stepNumber: stepCount++,
        title: 'Sederhanakan Bentuk Aljabar Akhir',
        rule: 'Penyederhanaan Aljabar',
        explanation: 'Lakukan perkalian dan pengelompokan suku-suku sejenis hingga diperoleh bentuk paling sederhana:',
        latex: `f'(x) = ${toTex(simplifiedDerivative)}`,
      });

      return steps;
    }
  }

  // Kasus 3: Bentuk Pembagian Dua Fungsi (Aturan Hasil Bagi)
  if (node.isOperatorNode && node.op === '/') {
    const u = unwrap(node.args[0]);
    const v = unwrap(node.args[1]);

    if (dependsOn(v, 'x')) {
      const uPrime = math.simplify(math.derivative(u, 'x'));
      const vPrime = math.simplify(math.derivative(v, 'x'));

      steps.push({
        stepNumber: stepCount++,
        title: 'Identifikasi Bentuk Aturan Hasil Bagi',
        rule: 'Aturan Hasil Bagi (Quotient Rule)',
        explanation: 'Fungsi merupakan pembagian rasional dengan penyebut yang memuat variabel $x$. Gunakan rumus:',
        latex: '\\frac{d}{dx}\\left[\\frac{u}{v}\\right] = \\frac{u\'(x) \\cdot v(x) - u(x) \\cdot v\'(x)}{[v(x)]^2}',
      });

      steps.push({
        stepNumber: stepCount++,
        title: 'Tentukan Pembilang u dan Penyebut v Serta Turunannya',
        rule: 'Penentuan Komponen',
        explanation: 'Identifikasi pembilang dan penyebut, lalu cari turunannya masing-masing:',
        latex: `\\begin{aligned} \\text{Pembilang } u(x) &= ${toTex(u)} \\implies u'(x) = ${toTex(uPrime)} \\\\[6pt] \\text{Penyebut } v(x) &= ${toTex(v)} \\implies v'(x) = ${toTex(vPrime)} \\end{aligned}`,
      });

      steps.push({
        stepNumber: stepCount++,
        title: 'Substitusi ke Rumus Aturan Hasil Bagi',
        rule: 'Substitusi Rumus',
        explanation: 'Substitusikan pembilang, penyebut, dan masing-masing turunan ke rumus:',
        latex: `f'(x) = \\frac{\\left(${toTex(uPrime)}\\right)\\left(${toTex(v)}\\right) - \\left(${toTex(u)}\\right)\\left(${toTex(vPrime)}\\right)}{\\left(${toTex(v)}\\right)^2}`,
      });

      steps.push({
        stepNumber: stepCount++,
        title: 'Sederhanakan Pembilang dan Penyebut',
        rule: 'Penyederhanaan Aljabar',
        explanation: 'Sederhanakan bentuk pembilang dan susun hasil akhir secara rapi:',
        latex: `f'(x) = ${toTex(simplifiedDerivative)}`,
      });

      return steps;
    }
  }

  // Kasus 4: Aturan Rantai & Pangkat ([u(x)]^n)
  if (node.isOperatorNode && node.op === '^') {
    const base = unwrap(node.args[0]);
    const exp = unwrap(node.args[1]);

    if (!dependsOn(exp, 'x') && !base.isSymbolNode) {
      const uPrime = math.simplify(math.derivative(base, 'x'));

      steps.push({
        stepNumber: stepCount++,
        title: 'Identifikasi Aturan Rantai & Pangkat',
        rule: 'Aturan Rantai & Pangkat (Chain Rule)',
        explanation: 'Fungsi berbentuk perpangkatan fungsi dalam $[u(x)]^n$. Rumus aturan rantai yang digunakan:',
        latex: '\\frac{d}{dx}\\left[(u(x))^n\\right] = n \\cdot [u(x)]^{n-1} \\cdot u\'(x)',
      });

      steps.push({
        stepNumber: stepCount++,
        title: 'Tentukan Fungsi Dalam dan Turunannya',
        rule: 'Turunan Fungsi Dalam',
        explanation: 'Misalkan fungsi dalam sebagai $u(x)$, lalu cari $u\'(x)$:',
        latex: `u(x) = ${toTex(base)} \\implies u'(x) = ${toTex(uPrime)}`,
      });

      steps.push({
        stepNumber: stepCount++,
        title: 'Kalikan Turunan Luar dan Turunan Dalam',
        rule: 'Aturan Rantai',
        explanation: 'Kalikan pangkat ke depan, kurangi pangkat fungsi dalam sebesar 1, dan kalikan dengan $u\'(x)$:',
        latex: `f'(x) = ${toTex(exp)} \\cdot \\left(${toTex(base)}\\right)^{${toTex(exp)} - 1} \\cdot \\left(${toTex(uPrime)}\\right)`,
      });

      steps.push({
        stepNumber: stepCount++,
        title: 'Sederhanakan Bentuk Akhir',
        rule: 'Penyederhanaan Aljabar',
        explanation: 'Sederhanakan koefisien dan faktor perkalian aljabar:',
        latex: `f'(x) = ${toTex(simplifiedDerivative)}`,
      });

      return steps;
    }
  }

  // Kasus 5: Aturan Rantai pada Fungsi Khusus (sin(g(x)), cos(g(x)), ln(g(x)), exp(g(x)), dll.)
  if (node.isFunctionNode) {
    const funcName = node.name;
    const arg = unwrap(node.args[0]);

    if (dependsOn(arg, 'x') && (!arg.isSymbolNode || arg.name !== 'x')) {
      const uPrime = math.simplify(math.derivative(arg, 'x'));
      const displayFunc = funcName === 'log' ? '\\ln' : `\\${funcName}`;

      steps.push({
        stepNumber: stepCount++,
        title: `Identifikasi Aturan Rantai pada Fungsi ${funcName === 'log' ? 'ln' : funcName}`,
        rule: 'Aturan Rantai (Chain Rule)',
        explanation: 'Fungsi merupakan komposisi $f(x) = g(u(x))$. Rumus aturan rantai:',
        latex: `\\frac{d}{dx}[${displayFunc}(u(x))] = \\frac{d}{du}[${displayFunc}(u)] \\cdot \\frac{du}{dx}`,
      });

      steps.push({
        stepNumber: stepCount++,
        title: 'Tentukan Fungsi Dalam u(x) dan Turunan Dalamnya',
        rule: 'Turunan Fungsi Dalam',
        explanation: 'Tentukan fungsi bagian dalam $u(x)$ dan turunkan terhadap $x$:',
        latex: `u(x) = ${toTex(arg)} \\implies u'(x) = \\frac{du}{dx} = ${toTex(uPrime)}`,
      });

      steps.push({
        stepNumber: stepCount++,
        title: 'Kalikan Turunan Luar dengan Turunan Dalam',
        rule: 'Aplikasi Aturan Rantai',
        explanation: 'Substitusi kembali $u(x)$ ke dalam turunan fungsi luar dan kalikan dengan $u\'(x)$:',
        latex: `f'(x) = \\frac{d}{du}[${displayFunc}(u)] \\cdot u'(x) = ${toTex(math.derivative(node, 'x'))}`,
      });

      steps.push({
        stepNumber: stepCount++,
        title: 'Bentuk Sederhana Akhir',
        rule: 'Penyederhanaan Aljabar',
        explanation: 'Hasil turunan akhir setelah disederhanakan:',
        latex: `f'(x) = ${toTex(simplifiedDerivative)}`,
      });

      return steps;
    }
  }

  // Kasus 6: Suku tunggal dasar (Polinomial dasar, fungsi dasar tunggal, atau konstanta)
  const singleAnalysis = analyzeSingleTerm(node);
  steps.push({
    stepNumber: stepCount++,
    title: `Terapkan ${singleAnalysis.rule}`,
    rule: singleAnalysis.rule,
    explanation: singleAnalysis.explanation,
    latex: singleAnalysis.formula || `\\frac{d}{dx}[f(x)] = ${toTex(singleAnalysis.dNode)}`,
  });

  steps.push({
    stepNumber: stepCount++,
    title: 'Hasil Turunan Akhir',
    rule: 'Penyederhanaan',
    explanation: 'Didapatkan bentuk turunan pertama $f\'(x)$:',
    latex: `f'(x) = ${toTex(simplifiedDerivative)}`,
  });

  return steps;
}

/**
 * Fungsi utama untuk menghitung turunan simbolik, langkah-langkah, dan garis singgung
 * 
 * @param {string} rawExpression - Fungsi f(x)
 * @param {string|number|null} [x0Input=null] - Titik x0 (opsional)
 * @returns {object} Hasil perhitungan lengkap
 */
export function calculateDerivative(rawExpression, x0Input = null) {
  if (!rawExpression || typeof rawExpression !== 'string' || !rawExpression.trim()) {
    throw new Error('Harap masukkan fungsi f(x) terlebih dahulu.');
  }

  const normalizedExpr = normalizeInput(rawExpression);

  let parsedNode;
  try {
    parsedNode = math.parse(normalizedExpr);
  } catch (err) {
    let msg = 'Ekspresi matematika tidak valid.';
    if (err.message.includes('Parenthesis') || err.message.includes('Unclosed')) {
      msg = 'Tanda kurung belum lengkap atau tidak berpasangan dengan benar.';
    } else if (err.message.includes('Unexpected end of expression')) {
      msg = 'Ekspresi matematika belum lengkap (misalnya ada operator di akhir rumus).';
    } else if (err.message.includes('Value expected')) {
      msg = 'Terdapat operator yang kekurangan nilai atau simbol tidak dikenal.';
    }
    throw new Error(msg);
  }

  // Hitung turunan simbolik f'(x) menggunakan mathjs
  let derivativeNode;
  try {
    derivativeNode = math.derivative(parsedNode, 'x');
  } catch (err) {
    throw new Error(`Gagal menghitung turunan f(x): ${err.message}`);
  }

  const simplifiedDerivative = math.simplify(derivativeNode);
  const derivativeString = simplifiedDerivative.toString();
  const latexDerivative = toTex(simplifiedDerivative);
  const latexExpression = toTex(parsedNode);

  // Buat langkah-langkah terstruktur
  const steps = generateSteps(parsedNode, simplifiedDerivative);

  // Proses evaluasi di titik x0 (jika ada)
  let hasX0 = false;
  let x0 = null;
  let f_x0 = null;
  let latex_f_x0 = null;
  let f_prime_x0 = null;
  let latex_f_prime_x0 = null;
  let tangentLine = null;

  if (x0Input !== null && x0Input !== undefined && String(x0Input).trim() !== '') {
    const x0Str = String(x0Input).trim();
    let evaluatedX0;
    try {
      evaluatedX0 = Number(math.evaluate(normalizeInput(x0Str)));
    } catch {
      throw new Error(`Nilai x₀ "${x0Str}" tidak valid. Masukkan angka riil atau konstanta (misal: 2, -1, 0.5, pi).`);
    }

    if (!Number.isFinite(evaluatedX0)) {
      throw new Error(`Nilai x₀ "${x0Str}" harus berupa bilangan berhingga.`);
    }

    hasX0 = true;
    x0 = evaluatedX0;

    // Evaluasi f(x0)
    let fVal;
    try {
      fVal = parsedNode.compile().evaluate({ x: x0 });
    } catch (err) {
      throw new Error(`Gagal mengevaluasi f(${x0}): ${err.message}`);
    }

    if (fVal && fVal.isComplex) {
      throw new Error(`Nilai f(${x0}) menghasilkan bilangan kompleks (di luar bilangan riil Kalkulus 1).`);
    }
    if (typeof fVal !== 'number' || Number.isNaN(fVal) || !Number.isFinite(fVal)) {
      throw new Error(`Fungsi f(x) tidak terdefinisi pada x = ${x0} (misalnya terjadi pembagian dengan nol atau logaritma non-positif).`);
    }
    f_x0 = fVal;
    latex_f_x0 = formatNumber(f_x0);

    // Evaluasi f'(x0)
    let dVal;
    try {
      dVal = simplifiedDerivative.compile().evaluate({ x: x0 });
    } catch (err) {
      throw new Error(`Gagal mengevaluasi f'(${x0}): ${err.message}`);
    }

    if (dVal && dVal.isComplex) {
      throw new Error(`Turunan f'(${x0}) menghasilkan bilangan kompleks.`);
    }
    if (typeof dVal !== 'number' || Number.isNaN(dVal) || !Number.isFinite(dVal)) {
      throw new Error(`Turunan f'(x) tidak terdefinisi atau bernilai tak hingga pada x = ${x0}.`);
    }
    f_prime_x0 = dVal;
    latex_f_prime_x0 = formatNumber(f_prime_x0);

    // Hitung persamaan garis singgung: y - f(x0) = f'(x0)(x - x0) => y = mx + c
    const m = f_prime_x0;
    const c = f_x0 - m * x0;

    const formattedLines = formatTangentLineLatex(m, c, x0, f_x0);

    tangentLine = {
      slope: m,
      yIntercept: c,
      equation: formattedLines.slopeIntercept,
      latexEquation: formattedLines.slopeIntercept,
      pointSlopeForm: formattedLines.pointSlope,
    };
  }

  return {
    rawExpression,
    normalizedExpression: normalizedExpr,
    latexExpression,
    derivative: derivativeString,
    latexDerivative,
    steps,
    hasX0,
    x0,
    f_x0,
    latex_f_x0,
    f_prime_x0,
    latex_f_prime_x0,
    tangentLine,
  };
}
