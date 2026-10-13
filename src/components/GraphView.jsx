import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
} from 'recharts';
import { generateGraphData } from '../utils/graph.js';
import { InlineMath } from './MathView.jsx';

/**
 * Custom Tooltip untuk Recharts
 */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-xs dark:border-slate-700 dark:bg-slate-900/95">
      <p className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
        x = {label}
      </p>
      {payload.map((item) => (
        <p key={item.name} className="mt-1 font-mono text-xs font-bold" style={{ color: item.color }}>
          {item.name}: {item.value !== null && item.value !== undefined ? item.value : 'Tidak terdefinisi'}
        </p>
      ))}
    </div>
  );
}

/**
 * Komponen Grafik Interaktif fungsi f(x) dan Garis Singgung
 */
export default function GraphView({
  normalizedExpr,
  x0 = null,
  f_x0 = null,
  tangent = null,
}) {
  // Domain x awal berpusat pada x0 jika ada, atau [-5, 5]
  const defaultRange = useMemo(() => {
    if (x0 !== null && Number.isFinite(x0)) {
      return {
        min: Math.round((x0 - 5) * 10) / 10,
        max: Math.round((x0 + 5) * 10) / 10,
      };
    }
    return { min: -5, max: 5 };
  }, [x0]);

  const [customRange, setCustomRange] = useState(null);

  const xMin = customRange ? customRange.min : defaultRange.min;
  const xMax = customRange ? customRange.max : defaultRange.max;

  const graphResult = useMemo(() => {
    if (!normalizedExpr) return { data: [], domainX: [-5, 5], domainY: [-10, 10] };
    return generateGraphData(normalizedExpr, {
      x0,
      tangent: tangent ? { m: tangent.slope, c: tangent.yIntercept } : null,
      xMin,
      xMax,
      pointsCount: 120,
    });
  }, [normalizedExpr, x0, tangent, xMin, xMax]);

  const handleZoom = (factor) => {
    const center = (xMin + xMax) / 2;
    const span = ((xMax - xMin) / 2) * factor;
    setCustomRange({
      min: Math.round((center - span) * 10) / 10,
      max: Math.round((center + span) * 10) / 10,
    });
  };

  const handleResetZoom = () => {
    setCustomRange(null);
  };

  if (!normalizedExpr || !graphResult.data.length) {
    return null;
  }

  const hasTangent = Boolean(tangent && Number.isFinite(tangent.slope));
  const hasPoint = x0 !== null && f_x0 !== null && Number.isFinite(x0) && Number.isFinite(f_x0);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      {/* Header Grafik & Kontrol Rentang */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 sm:text-base">
            Grafik Visualisasi f(x) {hasTangent && '& Garis Singgung'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rentang x: [{xMin}, {xMax}]
          </p>
        </div>

        {/* Tombol Kontrol Zoom */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            type="button"
            onClick={() => handleZoom(0.7)}
            title="Perbesar skala grafik"
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            + Zoom In
          </button>
          <button
            type="button"
            onClick={() => handleZoom(1.4)}
            title="Perkecil skala grafik"
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            - Zoom Out
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            title="Kembalikan rentang asal"
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Kontainer Recharts */}
      <div className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={graphResult.data}
            margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="x"
              type="number"
              domain={graphResult.domainX}
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => Math.round(v * 10) / 10}
            />
            <YAxis
              type="number"
              domain={graphResult.domainY}
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => Math.round(v * 10) / 10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />

            {/* Kurva f(x) */}
            <Line
              type="monotone"
              dataKey="f"
              name="f(x)"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />

            {/* Garis Singgung di x0 */}
            {hasTangent && (
              <Line
                type="linear"
                dataKey="tangent"
                name="Garis Singgung"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
                connectNulls={false}
              />
            )}

            {/* Titik Singgung (x0, f(x0)) */}
            {hasPoint && (
              <ReferenceDot
                x={x0}
                y={f_x0}
                r={5}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Keterangan Titik Singgung */}
      {hasPoint && (
        <div className="flex items-center justify-center space-x-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
          <span>Titik singgung:</span>
          <InlineMath math={`(${x0}, ${Math.round(f_x0 * 1000) / 1000})`} />
        </div>
      )}
    </div>
  );
}
