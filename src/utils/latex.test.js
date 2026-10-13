import { describe, it, expect } from 'vitest';
import { cleanLatex, sortPolynomialTerms } from './latex.js';

describe('latex.js util tests (cleanLatex)', () => {
  // 1. Kasus perkalian dengan kurung variabel dan pangkat (wajib dari user request)
  it('harus membersihkan "3\\cdot{ x}^{2}" menjadi "3x^2"', () => {
    expect(cleanLatex('3\\cdot{ x}^{2}')).toBe('3x^2');
  });

  // 2. Kasus perkalian angka dan variabel linear (wajib dari user request)
  it('harus membersihkan "5\\cdot x" menjadi "5x"', () => {
    expect(cleanLatex('5\\cdot x')).toBe('5x');
  });

  // 3. Kasus memastikan selalu ada spasi setelah perintah \cdot, \sin, \cos, \ln
  it('harus memastikan selalu ada spasi setelah perintah LaTeX seperti \\cdot, \\sin, \\cos, \\ln', () => {
    expect(cleanLatex('\\cdotx')).toBe('\\cdot x');
    expect(cleanLatex('\\sinx')).toBe('\\sin x');
    expect(cleanLatex('\\cosx')).toBe('\\cos x');
    expect(cleanLatex('\\lnx')).toBe('\\ln x');
    expect(cleanLatex('\\cdot x')).toBe('\\cdot x');
  });

  // 4. Kasus pengurutan hasil turunan polinomial agar tampil rapi (3x^2 - 8x + 5)
  it('harus mengurutkan hasil turunan polinomial secara menurun (3x^2 - 8x + 5)', () => {
    expect(cleanLatex('-8\\cdot x + 3\\cdot{ x}^{2} + 5')).toBe('3x^2 - 8x + 5');
    expect(cleanLatex('5 - 8\\cdot x + 3\\cdot{ x}^{2}')).toBe('3x^2 - 8x + 5');
    expect(cleanLatex('5 - 8x + 3x^2')).toBe('3x^2 - 8x + 5');
  });

  // 5. Kasus perbaikan bug "4\cdotx^{2}" pada judul langkah
  it('harus membersihkan "4\\cdotx^{2}" menjadi "4x^2"', () => {
    expect(cleanLatex('4\\cdotx^{2}')).toBe('4x^2');
  });

  // 6. Kasus penggantian \log menjadi \ln
  it('harus mengubah \\log menjadi \\ln untuk logaritma natural', () => {
    expect(cleanLatex('\\log\\left(x\\right)')).toBe('\\ln\\left(x\\right)');
    expect(cleanLatex('\\log(x)')).toBe('\\ln(x)');
  });

  // 7. Kasus input kosong atau null
  it('harus menangani input kosong dengan aman', () => {
    expect(cleanLatex('')).toBe('');
    expect(cleanLatex(null)).toBe('');
    expect(cleanLatex(undefined)).toBe('');
  });

  // 8. Kasus fungsi sortPolynomialTerms tidak mengubah fungsi non-polinomial
  it('harus mempertahankan urutan fungsi trigonometri dan bentuk non-polinomial', () => {
    expect(sortPolynomialTerms('\\sin(x) + \\cos(x)')).toBe('\\sin(x) + \\cos(x)');
  });
});
