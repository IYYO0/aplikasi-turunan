import { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import DerivativeModule from "./modules/DerivativeModule.jsx";
import PlaceholderModule from "./modules/PlaceholderModule.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("turunan");

  const tabs = [
    // { id: "limit", label: "Limit", icon: "lim" },
    { id: "turunan", label: "Turunan", icon: "f'" },
    // { id: "integral-substitusi", label: "Integral Substitusi", icon: "∫ du" },
    // { id: "integral-tentu", label: "Integral Tentu", icon: "∫ₐᵇ" },
    // { id: "aplikasi-turunan", label: "Aplikasi Turunan", icon: "Δy" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Navigation Tabs (Mobile-Friendly Horizontal Scroll) */}
        <div className="mb-8">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none sm:space-x-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isImplemented = tab.id === "turunan";

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex shrink-0 items-center space-x-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 dark:bg-blue-600 dark:text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100/80 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-700 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-700"
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {!isImplemented && (
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      Segera
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === "turunan" && <DerivativeModule />}

        {activeTab === "limit" && (
          <PlaceholderModule
            title="Modul Limit Fungsi"
            latex="\lim_{x \to c} f(x) = L"
            description="Modul Limit akan menghitung nilai limit fungsi aljabar dan trigonometri, evaluasi limit kiri & limit kanan, penanganan bentuk tak tentu 0/0 atau ∞/∞, serta penerapan aturan L'Hôpital."
            onSwitchToDerivative={() => setActiveTab("turunan")}
          />
        )}

        {activeTab === "integral-substitusi" && (
          <PlaceholderModule
            title="Modul Integral Substitusi"
            latex="\int f(g(x)) g'(x) \, dx = \int f(u) \, du"
            description="Modul Integral Substitusi akan menyelesaikan integral tak tentu dengan pemisalan variabel baru u = g(x) dan du = g'(x)dx langkah demi langkah."
            onSwitchToDerivative={() => setActiveTab("turunan")}
          />
        )}

        {activeTab === "integral-tentu" && (
          <PlaceholderModule
            title="Modul Integral Tentu"
            latex="\int_{a}^{b} f(x) \, dx = F(b) - F(a)"
            description="Modul Integral Tentu akan menghitung nilai pasti integral pada interval [a, b] sesuai Teorema Dasar Kalkulus disertai visualisasi luas daerah di bawah kurva."
            onSwitchToDerivative={() => setActiveTab("turunan")}
          />
        )}

        {activeTab === "aplikasi-turunan" && (
          <PlaceholderModule
            title="Modul Aplikasi Turunan"
            latex="f'(x) = 0 \implies \text{Titik Stasioner / Ekstrim}"
            description="Modul Aplikasi Turunan akan menganalisis titik stasioner, selang kemonotonan (naik/turun), nilai maksimum dan minimum lokal, kecekungan f''(x), dan titik belok kurva."
            onSwitchToDerivative={() => setActiveTab("turunan")}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="mx-auto max-w-6xl px-4">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            KalkuLab &bull; Kalkulator Kalkulus 1 Interaktif
          </p>
          <p className="mt-1 text-slate-400 dark:text-slate-500">
            Dibuat untuk mempermudah pemahaman konsep turunan, aturan
            diferensiasi, dan analisis kalkulus.
          </p>
        </div>
      </footer>
    </div>
  );
}
