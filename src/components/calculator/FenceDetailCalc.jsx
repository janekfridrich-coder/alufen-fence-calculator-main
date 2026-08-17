import React from 'react';
import { TableProperties, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FenceDetailCalc({ fences, fenceType }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <TableProperties className="w-5 h-5 text-emerald-500" />
          Podrobný výpočet (na každý díl plotu)
        </h3>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 print:hidden">
          <Printer className="w-4 h-4" />
          Tisknout
        </Button>
      </div>

      <div className="space-y-8">
        {fences.map((fence) => {
          const width = parseInt(fence.width);
          const height = parseInt(fence.height);
          const divisor = fenceType === '2D' ? 112 : 106;

          const lamellaCountZ = fence.selectedGap?.lamellas ?? 0;

          // 3D: mezera se počítá z výšky a počtu lamel
          // výška = Z * 106 + (Z-1) * mezera  =>  mezera = (výška - Z*106) / (Z-1)
          const height_cm = height / 10;
          const lamella_cm = 10.6;
          const mezera_cm = lamellaCountZ > 1
            ? (height_cm - lamellaCountZ * lamella_cm) / (lamellaCountZ - 1)
            : 0;
          const mezera_mm = mezera_cm * 10;

          // Pro 2D použij původní gap ze selectoru
          const mezera_cm_2D = fence.selectedGap?.gap ?? 0;
          const mezera_mm_2D = mezera_cm_2D * 10;

          const dimension = fenceType === '3D' ? height : width;
          const remainder = dimension - divisor * lamellaCountZ;

          // Konečný součet = lamela + mezera (v mm)
          const konecnySpacing = divisor + mezera_mm; // 106 + mezera

          // Poziční tabulka: první řádek = 10.6 cm, každý další += konečný součet
          // Poslední = přesně výška
          const positionRows = [];
          if (fenceType === '3D') {
            const konecnySpacing_cm = lamella_cm + mezera_cm;
            for (let n = 1; n <= lamellaCountZ; n++) {
              if (n === lamellaCountZ) {
                positionRows.push({ cm: height_cm });
              } else {
                const pos = n * lamella_cm + (n - 1) * mezera_cm;
                positionRows.push({ cm: Math.round(pos * 10) / 10 });
              }
            }
          }

          return (
            <div key={fence.id} className="border border-emerald-200 rounded-xl overflow-hidden shadow-sm">
              {/* Header - Šířka & Výška odděleny, barvy Alufen */}
              <div className="grid grid-cols-2 text-sm font-bold">
                <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between">
                  <span className="uppercase tracking-wide text-xs opacity-80">Výška</span>
                  <span className="text-lg">{height} mm</span>
                </div>
                <div className="bg-emerald-800 text-white px-4 py-3 flex items-center justify-between">
                  <span className="uppercase tracking-wide text-xs opacity-80">Šířka</span>
                  <span className="text-lg">{width} mm</span>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                <Row label="Počet lamel (Z)" value={`${lamellaCountZ} ks`} highlight="orange" />

                {fenceType === '3D' && (
                  <Row label="Zbytek" value={`${remainder.toFixed(0)} mm`} highlight="cyan" />
                )}

                <Row
                  label="Mezera"
                  value={
                    <span className="flex items-center gap-3">
                      <span className="text-slate-500">
                        {fenceType === '3D' ? mezera_mm.toFixed(1) : mezera_mm_2D.toFixed(1)} mm
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="bg-orange-200 px-2 py-0.5 rounded font-semibold">
                        {fenceType === '3D' ? mezera_cm.toFixed(1) : mezera_cm_2D.toFixed(1)} cm
                      </span>
                    </span>
                  }
                />

                {fenceType === '3D' && (
                  <Row label="Konečný součet" value={`${konecnySpacing.toFixed(1)} mm`} highlight="cyan" />
                )}



                {fenceType === '2D' && (() => {
                  const zkosena_cm = 2.8;
                  const celkovaMezera_cm = mezera_cm_2D + zkosena_cm;
                  return (
                    <Row
                      label="Celková mezera (mezera + zkosení)"
                      value={
                        <span className="flex items-center gap-3">
                          <span className="text-slate-500">{mezera_cm_2D.toFixed(1)} + {zkosena_cm} cm</span>
                          <span className="text-slate-400">→</span>
                          <span className="bg-yellow-200 px-2 py-0.5 rounded font-semibold">
                            {celkovaMezera_cm.toFixed(1)} cm
                          </span>
                        </span>
                      }
                    />
                  );
                })()}
              </div>

              {/* 3D position table */}
              {fenceType === '3D' && positionRows.length > 0 && (
                <div className="mt-0">
                  <div className="grid grid-cols-2 text-xs font-semibold bg-slate-100 px-4 py-2 text-slate-500 uppercase tracking-wide">
                    <span>#</span>
                    <span>Pozice (cm)</span>
                  </div>
                  <div>
                    {positionRows.map((row, i) => (
                      <div
                        key={i}
                        className={`grid grid-cols-2 text-sm px-4 py-1.5 border-t border-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                      >
                        <span className="text-slate-400">{i + 1}</span>
                        <span className="font-semibold text-slate-800">{row.cm.toFixed(1)} cm</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  const bgClass =
    highlight === 'orange' ? 'bg-emerald-50 border-l-4 border-emerald-400' :
    highlight === 'cyan' ? 'bg-emerald-50 border-l-4 border-emerald-600' :
    'bg-white';

  return (
    <div className={`grid grid-cols-2 text-sm px-4 py-2 ${bgClass}`}>
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="text-slate-800 font-semibold">{value}</span>
    </div>
  );
}