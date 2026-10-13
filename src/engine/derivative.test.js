import { describe, it, expect } from 'vitest';
import { calculateDerivative, normalizeInput } from './derivative.js';

describe('derivative.js engine tests', () => {
  // 1. Normalisasi input
  it('harus menormalisasi simbol khusus dan fungsi', () => {
    expect(normalizeInput('x² + √x × 2 ÷ 3')).toBe('x^2 + sqrt(x) * 2 / 3');
    expect(normalizeInput('ln(x) + e^x')).toBe('log(x) + e^x');
  });

  // 2. Polinomial
  it('harus menghitung turunan polinomial dan menyebutkan aturan terkait', () => {
    const res = calculateDerivative('x^3 - 4*x^2 + 5*x - 7');
    expect(res.derivative).toBeTruthy();
    expect(res.latexDerivative).toBe('3x^2 - 8x + 5');
    expect(res.steps.length).toBeGreaterThan(0);
    // Cek ada aturan penjumlahan/pengurangan atau pangkat
    const rules = res.steps.map((s) => s.rule);
    expect(rules.some((r) => r.includes('Penjumlahan') || r.includes('Pangkat'))).toBe(true);
  });

  // 3. Trigonometri
  it('harus menghitung turunan fungsi trigonometri', () => {
    const res = calculateDerivative('sin(x) + cos(x)');
    expect(res.derivative).toBeTruthy();
    const rules = res.steps.map((s) => s.rule);
    expect(rules.some((r) => r.includes('Trigonometri') || r.includes('Penjumlahan'))).toBe(true);
  });

  // 4. Logaritma natural ln(x)
  it('harus menghitung turunan fungsi logaritma natural ln(x)', () => {
    const res = calculateDerivative('ln(x)');
    expect(res.derivative).toContain('1 / x');
    const rules = res.steps.map((s) => s.rule);
    expect(rules.some((r) => r.includes('Logaritma') || r.includes('ln') || r.includes('log'))).toBe(true);
  });

  // 5. Eksponensial e^x atau exp(x)
  it('harus menghitung turunan fungsi eksponensial e^x', () => {
    const res = calculateDerivative('e^x');
    expect(res.derivative).toContain('e ^ x');
    const rules = res.steps.map((s) => s.rule);
    expect(rules.some((r) => r.includes('Eksponensial'))).toBe(true);
  });

  // 6. Aturan rantai (Chain Rule) - trigonometri komposit sin(x^2)
  it('harus mendeteksi aturan rantai pada sin(x^2)', () => {
    const res = calculateDerivative('sin(x^2)');
    expect(res.derivative).toContain('cos');
    const rules = res.steps.map((s) => s.rule);
    expect(rules.some((r) => r.includes('Rantai') || r.includes('Chain'))).toBe(true);
  });

  // 7. Aturan rantai (Chain Rule) - pangkat komposit (2*x + 1)^3
  it('harus mendeteksi aturan rantai pada pangkat aljabar (2*x + 1)^3', () => {
    const res = calculateDerivative('(2*x + 1)^3');
    expect(res.derivative).toContain('6');
    const rules = res.steps.map((s) => s.rule);
    expect(rules.some((r) => r.includes('Rantai') || r.includes('Chain'))).toBe(true);
  });

  // 8. Aturan hasil kali (Product Rule)
  it('harus mendeteksi aturan hasil kali pada x * sin(x)', () => {
    const res = calculateDerivative('x * sin(x)');
    expect(res.derivative).toContain('cos');
    expect(res.derivative).toContain('sin');
    const rules = res.steps.map((s) => s.rule);
    expect(rules.some((r) => r.includes('Hasil Kali') || r.includes('Product'))).toBe(true);
  });

  // 9. Aturan hasil bagi (Quotient Rule)
  it('harus mendeteksi aturan hasil bagi pada (x + 1) / (x - 1)', () => {
    const res = calculateDerivative('(x + 1) / (x - 1)');
    expect(res.derivative).toBeTruthy();
    const rules = res.steps.map((s) => s.rule);
    expect(rules.some((r) => r.includes('Hasil Bagi') || r.includes('Quotient'))).toBe(true);
  });

  // 10. Evaluasi di titik x0 dan garis singgung
  it('harus menghitung f(x0), f\'(x0), dan garis singgung di x0 dengan benar', () => {
    const res = calculateDerivative('x^2', 3);
    expect(res.hasX0).toBe(true);
    expect(res.x0).toBe(3);
    expect(res.f_x0).toBe(9);
    expect(res.f_prime_x0).toBe(6);
    expect(res.tangentLine).toBeDefined();
    expect(res.tangentLine.slope).toBe(6);
    expect(res.tangentLine.yIntercept).toBe(-9);
    expect(res.tangentLine.equation).toContain('6x - 9');
  });

  // 11. Validasi error
  it('harus melempar error yang ramah untuk input tidak valid', () => {
    // Input kosong
    expect(() => calculateDerivative('')).toThrowError(/terlebih dahulu/);
    // Tanda kurung tidak tutup
    expect(() => calculateDerivative('sin(x')).toThrowError(/kurung/);
    // Pembagian nol saat evaluasi x0
    expect(() => calculateDerivative('1 / x', 0)).toThrowError(/tidak terdefinisi/);
  });
});
