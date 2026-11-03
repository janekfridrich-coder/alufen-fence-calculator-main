import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Scissors, AlertTriangle, RotateCcw, FileText, Layers, Box, Save, Download, Receipt, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FenceDetailCalc from './FenceDetailCalc';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CuttingPlanResult({ result, fences, fenceType, customerName, nazevPlanu, onReset, onSave, navratUrl }) {
  const { lamellaPlan, profilePlan, summary } = result;
  const [saveName, setSaveName] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [pdfBezi, setPdfBezi] = useState(false);
  const [pdfChyba, setPdfChyba] = useState('');

  const handleSave = async () => {
    if (!saveName.trim()) return;
    setSaving(true);
    setSaveError('');
    try {
      await onSave(saveName.trim());
      setSaved(true);
    } catch (err) {
      console.error('Uložení výpočtu selhalo:', err);
      setSaveError(
        (err && (err.message || err.error_description || err.details)) ||
        'Uložení výpočtu se nezdařilo. Zkontrolujte připojení k internetu a zkuste to znovu.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleExportJson = () => {
    const data = {
      name: saveName || 'Řezací plán',
      fence_type: fenceType,
      fences: fences.map(f => JSON.stringify(f)),
      result
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rezaci-plan-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePdf = async () => {
    setPdfChyba('');
    setPdfBezi(true);
    try {
      const { stahniRezaciPlanPdf } = await import('@/pdf/stahniPdf');
      await stahniRezaciPlanPdf({ udaje: { zakaznik: customerName, nazev: saveName || nazevPlanu }, fences, fenceType, result });
    } catch (err) {
      console.error('PDF se nepodařilo vytvořit:', err);
      setPdfChyba(err.message || 'PDF se nepodařilo vytvořit.');
    } finally {
      setPdfBezi(false);
    }
  };

  return (
    <>
      {/* ===== SCREEN VIEW ===== */}
      <div className="max-w-5xl mx-auto no-print">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
            Řezací plán je připraven
          </h2>
          <p className="text-slate-500">
            Optimalizovaný řezací plán pro váš {fenceType} plot
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon={Package}
            label="Balení lamel"
            value={summary.totalLamellaPackages}
            color="emerald"
          />
          <SummaryCard
            icon={Box}
            label="Balení profilů"
            value={summary.totalProfilePackages}
            color="blue"
          />
          <SummaryCard
            icon={AlertTriangle}
            label="Odpad lamel"
            value={`${summary.totalLamellaWaste} mm`}
            color="amber"
          />
          <SummaryCard
            icon={AlertTriangle}
            label="Odpad profilů"
            value={`${summary.totalProfileWaste} mm`}
            color="amber"
          />
        </div>

        {/* Detailed Calculation */}
        <FenceDetailCalc fences={fences} fenceType={fenceType} />

        {/* Fence Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            Přehled plotu
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">#</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Výška</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Šířka</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Mezera</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Lamel</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Počet</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Celkem</th>
                </tr>
              </thead>
              <tbody>
                {fences.map((fence, index) => (
                  <tr key={fence.id} className="border-b border-slate-50">
                    <td className="py-3 px-2 font-medium">{index + 1}</td>
                    <td className="py-3 px-2">{fence.height} mm</td>
                    <td className="py-3 px-2">{fence.width} mm</td>
                    <td className="py-3 px-2">{fence.selectedGap.gap} cm</td>
                    <td className="py-3 px-2">{fence.selectedGap.lamellas}</td>
                    <td className="py-3 px-2">{fence.quantity}</td>
                    <td className="py-3 px-2 font-bold text-emerald-600">
                      {fence.selectedGap.lamellas * fence.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Required Cuts Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              Potřebné lamely
            </h3>
            <div className="space-y-2">
              {Object.entries(summary.cuts).map(([length, count]) => (
                <div key={length} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium">{length} mm</span>
                  <span className="text-emerald-600 font-bold">{count} ks</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Box className="w-5 h-5 text-blue-500" />
              Potřebné profily
            </h3>
            <div className="space-y-2">
              {Object.entries(summary.profiles).map(([length, count]) => (
                <div key={length} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium">{length} mm</span>
                  <span className="text-blue-600 font-bold">{count} ks</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cutting Plan Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-emerald-500" />
            Řezací plán lamel
          </h3>

          <div className="space-y-4">
            {lamellaPlan.packages.map((pkg, index) => (
              <CuttingPackage
                key={index}
                packageNumber={index + 1}
                label="Lamela"
                cuts={pkg.cuts}
                rawCuts={pkg.rawCuts}
                waste={pkg.waste}
                packageLength={pkg.pkgLength || 6500}
              />
            ))}
          </div>
        </div>

        {/* Profile Cutting Plan */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Box className="w-5 h-5 text-blue-500" />
            Řezací plán profilů
          </h3>

          <div className="space-y-4">
            {profilePlan.packages.map((pkg, index) => (
              <CuttingPackage
                key={index}
                packageNumber={index + 1}
                label="Profil"
                cuts={pkg.cuts}
                rawCuts={pkg.rawCuts}
                waste={pkg.waste}
                packageLength={pkg.pkgLength || 6500}
                color="blue"
              />
            ))}
          </div>
        </div>

        {/* Save Plan */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Save className="w-5 h-5 text-emerald-500" />
            Uložit výpočet
          </h3>
          {saved ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-emerald-600 font-medium">✓ Výpočet byl uložen!</p>
              {navratUrl && (
                <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                  <a href={navratUrl}>Zpět na nabídku</a>
                </Button>
              )}
            </div>
          ) : (
            <div>
              <div className="flex gap-3">
                <Input
                  placeholder="Název výpočtu (např. Plot – zahrada 2024)"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSave} disabled={!saveName.trim() || saving} className="bg-emerald-500 hover:bg-emerald-600">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Ukládám...' : 'Uložit'}
                </Button>
              </div>
              {saveError && (
                <p className="text-red-600 text-sm mt-3">
                  ⚠ {saveError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handlePdf}
            disabled={pdfBezi}
            className="h-12 px-8"
          >
            <FileDown className="w-4 h-4 mr-2" />
            {pdfBezi ? 'Připravuji PDF...' : 'Stáhnout PDF pro dílnu'}
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="h-12 px-8"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Nový výpočet
          </Button>
          <Button
            variant="outline"
            onClick={handleExportJson}
            className="h-12 px-8"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Link
            to={createPageUrl('Offer')}
            onClick={() => sessionStorage.setItem('offer_data', JSON.stringify({ result, fences }))}
          >
            <Button className="h-12 px-8 bg-emerald-500 hover:bg-emerald-600">
              <Receipt className="w-4 h-4 mr-2" />
              Vytvořit nabídku
            </Button>
          </Link>
        </div>
        {pdfChyba && <p className="mt-3 text-center text-sm text-red-600">{pdfChyba}</p>}
      </div>
    </>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-slate-100"
    >
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </motion.div>
  );
}

function CuttingPackage({ packageNumber, label = 'Tyč', cuts, waste, packageLength, rawCuts, color = 'emerald' }) {
  const colorClasses = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500'
  };
  const lightColorClasses = {
    emerald: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700'
  };

  // Use rawCuts for the visual bar (individual cut segments)
  const barSegments = rawCuts || cuts.map(c => c.length);

  return (
    <div className="border border-slate-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 ${colorClasses[color]} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
            {packageNumber}
          </div>
          <span className="font-semibold text-slate-700">{label} {packageNumber}</span>
        </div>
        <span className="text-sm text-slate-500">
          Odpad: <span className="font-semibold text-amber-600">{waste} mm</span>
        </span>
      </div>

      {/* Visual representation - each segment = one cut slot (yields 4 lamellas) */}
      <div className="h-10 bg-slate-100 rounded-lg overflow-hidden flex mb-3">
        {barSegments.map((segLen, idx) => {
          const widthPct = (segLen / packageLength) * 100;
          return (
            <div
              key={idx}
              className={`${colorClasses[color]} h-full flex items-center justify-center text-white text-xs font-medium border-r border-white/30`}
              style={{ width: `${widthPct}%` }}
            >
              {segLen}
            </div>
          );
        })}
        {waste > 0 && (
          <div
            className="bg-amber-200 h-full flex items-center justify-center text-amber-700 text-xs font-medium"
            style={{ width: `${(waste / packageLength) * 100}%` }}
          >
            {waste > 200 ? `${waste}mm` : ''}
          </div>
        )}
      </div>

      {/* Cut details - grouped summary */}
      <div className="flex flex-wrap gap-2">
        {cuts.map((cut, idx) => (
          <span key={idx} className={`text-xs px-3 py-1 rounded-full ${lightColorClasses[color]}`}>
            {cut.length} mm × {cut.count} ks
          </span>
        ))}
      </div>
    </div>
  );
}
