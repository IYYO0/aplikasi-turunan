import * as math from 'mathjs';

/**
 * Menghasilkan data titik-titik koordinat untuk Recharts
 * @param {string} normalizedExpr - Ekspresi fungsi yang sudah dinormalisasi
 * @param {object} options
 * @param {number} [options.xMin]
 * @param {number} [options.xMax]
 * @param {number} [options.pointsCount]
 * @param {object} [options.tangent] - { m, c }
 * @param {number} [options.x0]
 * @returns {{ data: Array<{ x: number, f: number|null, tangent: number|null }>, domainX: [number, number], domainY: [number, number] }}
 */
export function generateGraphData(normalizedExpr, options = {}) {
  const {
    x0 = null,
    tangent = null,
    pointsCount = 120,
  } = options;

  let xMin = options.xMin;
  let xMax = options.xMax;

  if (xMin === undefined || xMax === undefined) {
    if (x0 !== null && Number.isFinite(x0)) {
      xMin = Math.round((x0 - 5) * 10) / 10;
      xMax = Math.round((x0 + 5) * 10) / 10;
    } else {
      xMin = -5;
      xMax = 5;
    }
  }

  if (xMin >= xMax) {
    xMin = -5;
    xMax = 5;
  }

  let compiledF = null;
  try {
    compiledF = math.compile(normalizedExpr);
  } catch {
    return { data: [], domainX: [xMin, xMax], domainY: [-10, 10] };
  }

  const step = (xMax - xMin) / (pointsCount - 1);
  const data = [];
  let minY = Infinity;
  let maxY = -Infinity;

  const Y_CLAMP_LIMIT = 150;

  for (let i = 0; i < pointsCount; i++) {
    const xVal = Math.round((xMin + i * step) * 1000) / 1000;
    let fVal = null;
    let tangentVal = null;

    try {
      const evalRes = compiledF.evaluate({ x: xVal });
      if (typeof evalRes === 'number' && Number.isFinite(evalRes)) {
        if (Math.abs(evalRes) <= Y_CLAMP_LIMIT) {
          fVal = Math.round(evalRes * 1000) / 1000;
          if (fVal < minY) minY = fVal;
          if (fVal > maxY) maxY = fVal;
        }
      }
    } catch {
      fVal = null;
    }

    if (tangent && Number.isFinite(tangent.m) && Number.isFinite(tangent.c)) {
      const tRes = tangent.m * xVal + tangent.c;
      if (Number.isFinite(tRes) && Math.abs(tRes) <= Y_CLAMP_LIMIT) {
        tangentVal = Math.round(tRes * 1000) / 1000;
        if (tangentVal < minY) minY = tangentVal;
        if (tangentVal > maxY) maxY = tangentVal;
      }
    }

    data.push({
      x: xVal,
      f: fVal,
      tangent: tangentVal,
    });
  }

  // Jika nilai Y tidak valid atau terlalu sempit, berikan batas wajar
  if (!Number.isFinite(minY) || !Number.isFinite(maxY) || minY === maxY) {
    minY = -10;
    maxY = 10;
  } else {
    const padding = Math.max(1, (maxY - minY) * 0.1);
    minY = Math.floor(minY - padding);
    maxY = Math.ceil(maxY + padding);
  }

  return {
    data,
    domainX: [xMin, xMax],
    domainY: [minY, maxY],
  };
}
