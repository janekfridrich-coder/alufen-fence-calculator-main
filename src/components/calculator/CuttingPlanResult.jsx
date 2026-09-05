import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Scissors, AlertTriangle, RotateCcw, FileText, Layers, Box, Save, Download, Receipt, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FenceDetailCalc from './FenceDetailCalc';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CuttingPlanResult({ result, fences, fenceType, customerName, onReset, onSave }) {
  const { lamellaPlan, profilePlan, summary } = result;
  const [saveName, setSaveName] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

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

  const handlePrint = () => {
    const printContent = document.getElementById('print-root').innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Řezací plán</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; margin: 0; padding: 15mm; }
          @page { size: A4; margin: 15mm; }
          .page-break { page-break-before: always; padding-top: 10mm; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 6mm; }
          th { text-align: left; padding: 2mm 3mm; font-size: 11px; color: #64748b; background: #f1f5f9; }
          td { padding: 2mm 3mm; border-bottom: 1px solid #e2e8f0; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #16a34a; padding-bottom: 6mm; margin-bottom: 6mm; }
          .badge { background: #16a34a; color: white; padding: 3mm 6mm; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .section-title { font-weight: bold; color: #475569; font-size: 13px; margin-bottom: 3mm; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 2mm; margin-top: 4mm; }
          .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
          .pkg { border: 1px solid #e2e8f0; border-radius: 5px; padding: 3mm; margin-bottom: 3mm; }
          .pkg-header { display: flex; justify-content: space-between; margin-bottom: 2mm; font-weight: bold; }
          .bar { height: 8mm; background: #e2e8f0; border-radius: 3px; overflow: hidden; display: flex; margin-bottom: 2mm; }
          .bar-seg-green { background: #16a34a; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 9px; border-right: 1px solid white; overflow: hidden; }
          .bar-seg-blue { background: #2563eb; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 9px; border-right: 1px solid white; overflow: hidden; }
          .bar-waste { background: #fde68a; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #92400e; }
          .tags { display: flex; flex-wrap: wrap; gap: 2mm; }
          .tag-green { background: #dcfce7; color: #166534; font-size: 10px; padding: 0.5mm 2.5mm; border-radius: 10px; }
          .tag-blue { background: #dbeafe; color: #1e40af; font-size: 10px; padding: 0.5mm 2.5mm; border-radius: 10px; }
          .row-item { display: flex; justify-content: space-between; padding: 1.5mm 3mm; border-radius: 3px; margin-bottom: 1mm; }
          .row-green { background: #f0fdf4; }
          .row-blue { background: #eff6ff; }
          .green { color: #16a34a; }
          .blue { color: #2563eb; }
          .amber { color: #d97706; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <>
      {/* ===== PRINT STYLES ===== */}

      {/* ===== PRINT AREA (hidden, used as template for print window) ===== */}
      <div id="print-root" style={{display:'none'}}>
        {/* Page 1: Základní informace */}
        <div style={{marginBottom:'8mm'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderBottom:'2px solid #16a34a', paddingBottom:'6mm', marginBottom:'6mm'}}>
            <div>
              <div style={{fontSize:'22px', fontWeight:'bold', color:'#1e293b'}}>Řezací plán</div>
              {customerName && <div style={{fontSize:'14px', color:'#64748b', marginTop:'2mm'}}>Zákazník: <strong>{customerName}</strong></div>}
              <div style={{fontSize:'11px', color:'#94a3b8', marginTop:'1mm'}}>Datum: {new Date().toLocaleDateString('cs-CZ')} &nbsp;|&nbsp; Typ plotu: {fenceType}</div>
            </div>
            <div style={{background:'#16a34a', color:'white', padding:'3mm 6mm', borderRadius:'4px', fontSize:'12px', fontWeight:'bold'}}>ALUFEN SYSTEM</div>
          </div>

          {/* Summary */}
          <div style={{fontWeight:'bold', color:'#475569', fontSize:'13px', marginBottom:'3mm', textTransform:'uppercase', letterSpacing:'0.05em'}}>Základní informace</div>
          <table style={{width:'100%', borderCollapse:'collapse', marginBottom:'6mm'}}>
            <thead>
              <tr style={{background:'#f1f5f9'}}>
                <th style={{textAlign:'left', padding:'2mm 3mm', fontSize:'11px', color:'#64748b'}}>#</th>
                <th style={{textAlign:'left', padding:'2mm 3mm', fontSize:'11px', color:'#64748b'}}>Výška</th>
                <th style={{textAlign:'left', padding:'2mm 3mm', fontSize:'11px', color:'#64748b'}}>Šířka</th>
                <th style={{textAlign:'left', padding:'2mm 3mm', fontSize:'11px', color:'#64748b'}}>Mezera</th>
                <th style={{textAlign:'left', padding:'2mm 3mm', fontSize:'11px', color:'#64748b'}}>Lamel/ks</th>
                <th style={{textAlign:'left', padding:'2mm 3mm', fontSize:'11px', color:'#64748b'}}>Počet</th>
                <th style={{textAlign:'left', padding:'2mm 3mm', fontSize:'11px', color:'#64748b'}}>Celkem lamel</th>
              </tr>
            </thead>
            <tbody>
              {fences.map((fence, i) => (
                <tr key={i} style={{borderBottom:'1px solid #e2e8f0', background: i%2===1 ? '#f8fafc' : 'white'}}>
                  <td style={{padding:'2mm 3mm'}}>{i+1}</td>
                  <td style={{padding:'2mm 3mm'}}>{fence.height} mm</td>
                  <td style={{padding:'2mm 3mm'}}>{fence.width} mm</td>
                  <td style={{padding:'2mm 3mm'}}>{fence.selectedGap.gap} cm</td>
                  <td style={{padding:'2mm 3mm'}}>{fence.selectedGap.lamellas}</td>
                  <td style={{padding:'2mm 3mm'}}>{fence.quantity}</td>
                  <td style={{padding:'2mm 3mm', fontWeight:'bold', color:'#16a34a'}}>{fence.selectedGap.lamellas * fence.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Podrobný výpočet (deduplikovaný dle rozměrů) */}
          {(() => {
            const seen = new Set();
            const unique = fences.filter(fence => {
              const key = `${fence.height}x${fence.width}x${fence.selectedGap?.lamellas}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            return unique.map((fence, fi) => {
              const key = `${fence.height}x${fence.width}x${fence.selectedGap?.lamellas}`;
              const count = fences.filter(f => `${f.height}x${f.width}x${f.selectedGap?.lamellas}` === key).reduce((s, f) => s + (f.quantity || 1), 0);

              const height = parseInt(fence.height);
              const width = parseInt(fence.width);
              const height_cm = height / 10;
              const lamella_cm = 10.6;
              const Z = fence.selectedGap?.lamellas ?? 0;
              const mezera_cm = Z > 1 ? (height_cm - Z * lamella_cm) / (Z - 1) : 0;
              const mezera_mm = mezera_cm * 10;
              const mezera_cm_2D = fence.selectedGap?.gap ?? 0;
              const mezera_mm_2D = mezera_cm_2D * 10;
              const konecnySpacing = 106 + mezera_mm;
              const remainder = height - 106 * Z;

              const posRows = [];
              if (fenceType === '3D') {
                for (let n = 1; n <= Z; n++) {
                  if (n === Z) posRows.push(height_cm);
                  else posRows.push(Math.round((n * lamella_cm + (n - 1) * mezera_cm) * 10) / 10);
                }
              }

              return (
                <div key={fi} style={{pageBreakBefore: fi===0 ? 'auto' : 'always'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'2px solid #16a34a', paddingBottom:'4mm', marginBottom:'5mm'}}>
                    <div>
                      <div style={{fontSize:'16px', fontWeight:'bold', color:'#1e293b'}}>Montážní list – Dílec {fi+1}</div>
                      {customerName && <div style={{fontSize:'11px', color:'#64748b', marginTop:'1mm'}}>Zákazník: <strong>{customerName}</strong></div>}
                      <div style={{fontSize:'10px', color:'#94a3b8', marginTop:'1mm'}}>Datum: {new Date().toLocaleDateString('cs-CZ')} | Typ plotu: {fenceType} | Počet kusů: {count}</div>
                    </div>
                    <div style={{background:'#16a34a', color:'white', padding:'2mm 5mm', borderRadius:'4px', fontSize:'11px', fontWeight:'bold'}}>ALUFEN SYSTEM</div>
                  </div>
                  <div style={{border:'1px solid #e2e8f0', borderRadius:'6px', overflow:'hidden'}}>
                    {/* Header */}
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
                      <div style={{background:'#16a34a', color:'white', padding:'3mm 4mm', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span style={{fontSize:'10px', textTransform:'uppercase', opacity:0.8}}>Výška</span>
                        <span style={{fontSize:'15px', fontWeight:'bold'}}>{height} mm</span>
                      </div>
                      <div style={{background:'#166534', color:'white', padding:'3mm 4mm', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span style={{fontSize:'10px', textTransform:'uppercase', opacity:0.8}}>Šířka</span>
                        <span style={{fontSize:'15px', fontWeight:'bold'}}>{width} mm</span>
                      </div>
                    </div>
                    {/* Rows */}
                    <div style={{background:'#f0fdf4', padding:'2mm 4mm', display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1px solid #e2e8f0'}}>
                      <span style={{color:'#475569'}}>Počet lamel (Z)</span><span style={{fontWeight:'bold'}}>{Z} ks</span>
                    </div>
                    {fenceType === '3D' && (
                      <div style={{background:'#f0fdf4', padding:'2mm 4mm', display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1px solid #e2e8f0'}}>
                        <span style={{color:'#475569'}}>Zbytek</span><span style={{fontWeight:'bold'}}>{remainder.toFixed(0)} mm</span>
                      </div>
                    )}
                    <div style={{background:'white', padding:'2mm 4mm', display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1px solid #e2e8f0'}}>
                      <span style={{color:'#475569'}}>Mezera</span>
                      <span>
                        <span style={{color:'#94a3b8'}}>{fenceType==='3D' ? mezera_mm.toFixed(1) : mezera_mm_2D.toFixed(1)} mm → </span>
                        <span style={{background:'#fed7aa', padding:'0.5mm 2mm', borderRadius:'3px', fontWeight:'bold'}}>{fenceType==='3D' ? mezera_cm.toFixed(1) : mezera_cm_2D.toFixed(1)} cm</span>
                      </span>
                    </div>
                    {fenceType === '3D' && (
                      <div style={{background:'#f0fdf4', padding:'2mm 4mm', display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1px solid #e2e8f0'}}>
                        <span style={{color:'#475569'}}>Konečný součet</span><span style={{fontWeight:'bold'}}>{konecnySpacing.toFixed(1)} mm</span>
                      </div>
                    )}
                    {/* Position table */}
                    {fenceType === '3D' && posRows.length > 0 && (
                      <>
                        <div style={{display:'grid', gridTemplateColumns:'80px 1fr', background:'#f1f5f9', padding:'1.5mm 4mm', fontSize:'10px', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                          <span>#</span><span>Pozice (cm)</span>
                        </div>
                        {posRows.map((pos, i) => (
                          <div key={i} style={{display:'grid', gridTemplateColumns:'80px 1fr', padding:'1.5mm 4mm', background: i%2===0 ? 'white' : '#f8fafc', borderTop:'1px solid #f1f5f9'}}>
                            <span style={{color:'#94a3b8'}}>{i+1}</span>
                            <span style={{fontWeight:'bold', color:'#1e293b'}}>{pos.toFixed(1)} cm</span>
                          </div>
                        ))}
                      </>
                    )}
                    {fenceType === '2D' && (() => {
                      const zkosena_cm = 2.8;
                      const celk = mezera_cm_2D + zkosena_cm;
                      return (
                        <div style={{background:'#f0fdf4', padding:'2mm 4mm', display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:'1px solid #e2e8f0'}}>
                          <span style={{color:'#475569'}}>Celková mezera (mezera + zkosení)</span>
                          <span><span style={{color:'#94a3b8'}}>{mezera_cm_2D.toFixed(1)} + {zkosena_cm} cm → </span><span style={{background:'#fef9c3', padding:'0.5mm 2mm', borderRadius:'3px', fontWeight:'bold'}}>{celk.toFixed(1)} cm</span></span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            });
          })()}

          {/* Potřebné materiály */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5mm'}}>
            <div>
              <div style={{fontWeight:'bold', color:'#475569', fontSize:'12px', marginBottom:'2mm', textTransform:'uppercase'}}>Potřebné lamely</div>
              {Object.entries(summary.cuts).map(([len, cnt]) => (
                <div key={len} style={{display:'flex', justifyContent:'space-between', padding:'1.5mm 3mm', background:'#f0fdf4', borderRadius:'3px', marginBottom:'1mm'}}>
                  <span>{len} mm</span><strong style={{color:'#16a34a'}}>{cnt} ks</strong>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontWeight:'bold', color:'#475569', fontSize:'12px', marginBottom:'2mm', textTransform:'uppercase'}}>Potřebné profily</div>
              {Object.entries(summary.profiles).map(([len, cnt]) => (
                <div key={len} style={{display:'flex', justifyContent:'space-between', padding:'1.5mm 3mm', background:'#eff6ff', borderRadius:'3px', marginBottom:'1mm'}}>
                  <span>{len} mm</span><strong style={{color:'#2563eb'}}>{cnt} ks</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page 2: Řezací plán lamel */}
        <div className="page-break" style={{paddingTop:'4mm'}}>
          <div style={{fontWeight:'bold', color:'#475569', fontSize:'13px', marginBottom:'3mm', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #e2e8f0', paddingBottom:'2mm'}}>Řezací plán – Lamely</div>
          {lamellaPlan.packages.map((pkg, i) => (
            <div key={i} style={{border:'1px solid #e2e8f0', borderRadius:'5px', padding:'3mm', marginBottom:'3mm'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'2mm'}}>
                <strong>Balení {i+1} ({pkg.pkgLength} mm)</strong>
                <span style={{color:'#d97706', fontSize:'11px'}}>Odpad: {pkg.waste} mm</span>
              </div>
              <div style={{height:'8mm', background:'#e2e8f0', borderRadius:'3px', overflow:'hidden', display:'flex', marginBottom:'2mm'}}>
                {pkg.rawCuts.map((seg, si) => (
                  <div key={si} style={{background:'#16a34a', height:'100%', width:`${(seg/pkg.pkgLength)*100}%`, borderRight:'1px solid white', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'9px', overflow:'hidden'}}>{seg}</div>
                ))}
                {pkg.waste > 0 && <div style={{background:'#fde68a', height:'100%', width:`${(pkg.waste/pkg.pkgLength)*100}%`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', color:'#92400e'}}></div>}
              </div>
              <div style={{display:'flex', flexWrap:'wrap', gap:'2mm'}}>
                {pkg.cuts.map((c, ci) => <span key={ci} style={{background:'#dcfce7', color:'#166534', fontSize:'10px', padding:'0.5mm 2.5mm', borderRadius:'10px'}}>{c.length} mm × {c.count} ks</span>)}
              </div>
            </div>
          ))}

          {/* Řezací plán profilů */}
          <div style={{fontWeight:'bold', color:'#475569', fontSize:'13px', margin:'4mm 0 3mm', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #e2e8f0', paddingBottom:'2mm'}}>Řezací plán – Profily</div>
          {profilePlan.packages.map((pkg, i) => (
            <div key={i} style={{border:'1px solid #e2e8f0', borderRadius:'5px', padding:'3mm', marginBottom:'3mm'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'2mm'}}>
                <strong>Balení {i+1} ({pkg.pkgLength} mm)</strong>
                <span style={{color:'#d97706', fontSize:'11px'}}>Odpad: {pkg.waste} mm</span>
              </div>
              <div style={{height:'8mm', background:'#e2e8f0', borderRadius:'3px', overflow:'hidden', display:'flex', marginBottom:'2mm'}}>
                {pkg.rawCuts.map((seg, si) => (
                  <div key={si} style={{background:'#2563eb', height:'100%', width:`${(seg/pkg.pkgLength)*100}%`, borderRight:'1px solid white', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'9px', overflow:'hidden'}}>{seg}</div>
                ))}
                {pkg.waste > 0 && <div style={{background:'#fde68a', height:'100%', width:`${(pkg.waste/pkg.pkgLength)*100}%`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', color:'#92400e'}}></div>}
              </div>
              <div style={{display:'flex', flexWrap:'wrap', gap:'2mm'}}>
                {pkg.cuts.map((c, ci) => <span key={ci} style={{background:'#dbeafe', color:'#1e40af', fontSize:'10px', padding:'0.5mm 2.5mm', borderRadius:'10px'}}>{c.length} mm × {c.count} ks</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

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
            <p className="text-emerald-600 font-medium">✓ Výpočet byl uložen!</p>
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
            onClick={handlePrint}
            className="h-12 px-8"
          >
            <Printer className="w-4 h-4 mr-2" />
            Tisknout plán
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
