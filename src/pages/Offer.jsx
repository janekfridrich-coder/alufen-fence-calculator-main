import React, { useState, useEffect } from 'react';
import { PriceConfig } from '@/lib/localDb';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Settings, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LOGO_URL = '/alufen-logo.png';

const SUPPLIER = { name: 'ALUMINIUM FENCES s.r.o.', street: 'Hemy 830', city: 'Valašské Meziříčí 75701', country: 'Česko' };

const DEFAULT_PRICES = { lamella_price: 85, profile_price: 120, assembly_price: 350 };

function buildItemsFromResult(result, fences, prices) {
  if (!result || !fences) return [];
  const items = [];
  const totalLamellas = Object.values(result.summary?.cuts || {}).reduce((a, b) => a + b, 0);
  const totalProfiles = Object.values(result.summary?.profiles || {}).reduce((a, b) => a + b, 0);
  if (totalLamellas > 0) items.push({ label: 'Hliníkové lamely', qty: totalLamellas, unit: 'ks', unitPrice: prices.lamella_price });
  if (totalProfiles > 0) items.push({ label: 'Hliníkové profily', qty: totalProfiles, unit: 'ks', unitPrice: prices.profile_price });
  const totalM2 = fences.reduce((sum, f) => sum + (parseFloat(f.width) / 1000) * (parseFloat(f.height) / 1000) * (f.quantity || 1), 0);
  if (totalM2 > 0) items.push({ label: 'Montáž', qty: parseFloat(totalM2.toFixed(2)), unit: 'm²', unitPrice: prices.assembly_price });
  return items;
}

function fmt(n) { return parseFloat(n || 0).toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function OfferPage() {
  const [customer, setCustomer] = useState({});
  const [items, setItems] = useState([]);
  const [prices, setPrices] = useState(DEFAULT_PRICES);
  const [editPrices, setEditPrices] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [exporting, setExporting] = useState(false);

  const offerNumber = `OFF-${Date.now().toString().slice(-6)}`;
  const date = new Date().toLocaleDateString('cs-CZ');
  const validUntil = (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toLocaleDateString('cs-CZ'); })();

  const total = items.reduce((sum, it) => sum + (parseFloat(it.qty) || 0) * (parseFloat(it.unitPrice) || 0), 0);
  const vat = total * 0.21;
  const totalWithVat = total + vat;

  useEffect(() => {
    PriceConfig.list().then(configs => {
      let p = DEFAULT_PRICES;
      if (configs && configs.length > 0) {
        const cfg = configs[0];
        p = {
          lamella_price: cfg.lamella_price ?? DEFAULT_PRICES.lamella_price,
          profile_price: cfg.profile_price ?? DEFAULT_PRICES.profile_price,
          assembly_price: cfg.assembly_price ?? DEFAULT_PRICES.assembly_price,
        };
        setPrices(p);
      }
      const stored = sessionStorage.getItem('offer_data');
      if (stored) {
        const { result, fences } = JSON.parse(stored);
        setItems(buildItemsFromResult(result, fences, p));
      }
      setLoaded(true);
    });
  }, []);

  const savePriceConfig = async () => {
    const configs = await PriceConfig.list();
    if (configs && configs.length > 0) await PriceConfig.update(configs[0].id, prices);
    else await PriceConfig.create(prices);
    setEditPrices(false);
  };

  const setItem = (idx, field, value) => {
    setItems(items.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const addItem = () => setItems([...items, { label: '', qty: 1, unit: 'ks', unitPrice: 0 }]);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const el = document.getElementById('offer-preview');
      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgData = canvas.toDataURL('image/png');
      const imgRatio = canvas.height / canvas.width;
      const imgH = pdfW * imgRatio;

      if (imgH <= pdfH) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfW, imgH);
      } else {
        let srcY = 0;
        const srcPageH = Math.floor(canvas.width * (pdfH / pdfW));
        while (srcY < canvas.height) {
          const sliceH = Math.min(srcPageH, canvas.height - srcY);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceH;
          const ctx = sliceCanvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
          if (srcY > 0) pdf.addPage();
          pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 0, 0, pdfW, pdfW * (sliceH / canvas.width));
          srcY += srcPageH;
        }
      }

      pdf.save(`nabidka-${offerNumber}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  const setCustomerField = (field, value) => setCustomer(c => ({ ...c, [field]: value }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #offer-pdf-content { display: block !important; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl('Calculator')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Zpět
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditPrices(!editPrices)}>
              <Settings className="w-4 h-4 mr-1" /> Ceny
            </Button>
            <Button onClick={handleExportPdf} disabled={exporting} className="bg-[#00C981] hover:bg-[#00B873]">
              {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              {exporting ? 'Generuji...' : 'Export do PDF'}
            </Button>
          </div>
        </div>

        {/* Price config editor */}
        {editPrices && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-amber-800 mb-4">Nastavení přednastavených cen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[['lamella_price','Lamela (Kč/ks)'],['profile_price','Profil (Kč/ks)'],['assembly_price','Montáž (Kč/m²)']].map(([key,label]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-slate-700 block mb-1">{label}</label>
                  <input type="number" className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm"
                    value={prices[key]} onChange={e => setPrices({ ...prices, [key]: parseFloat(e.target.value) })} />
                </div>
              ))}
            </div>
            <Button size="sm" onClick={savePriceConfig} className="bg-amber-500 hover:bg-amber-600 text-white">Uložit ceny</Button>
          </div>
        )}

        {/* === EDITABLE CUSTOMER INPUTS (outside PDF area) === */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Zákazník</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[['name','Jméno / Firma','Jan Novák'],['address','Adresa','Ulice 1, Praha'],['email','Email','jan@example.cz'],['phone','Telefon','+420 ...']]
              .map(([field, label, placeholder]) => (
                <input key={field} type="text" placeholder={placeholder}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#00C981]"
                  value={customer[field] || ''} onChange={e => setCustomerField(field, e.target.value)} />
              ))}
          </div>
        </div>

        {/* === EDITABLE ITEMS (outside PDF area) === */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Položky</div>
          <div className="divide-y divide-slate-100">
            {loaded && items.map((item, idx) => {
              const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);
              return (
                <div key={idx} className="flex items-center gap-3 py-3">
                  <input type="text" placeholder="Popis položky"
                    className="flex-1 bg-transparent text-sm text-slate-700 border-0 focus:outline-none focus:bg-slate-50 rounded px-1"
                    value={item.label} onChange={e => setItem(idx, 'label', e.target.value)} />
                  <input type="number" className="w-16 text-sm text-right bg-transparent border border-slate-200 rounded px-2 py-1 focus:outline-none"
                    value={item.qty} onChange={e => setItem(idx, 'qty', e.target.value)} />
                  <input type="text" className="w-10 text-sm text-center bg-transparent border border-slate-200 rounded px-1 py-1 focus:outline-none"
                    value={item.unit} onChange={e => setItem(idx, 'unit', e.target.value)} />
                  <input type="number" className="w-24 text-sm text-right bg-transparent border border-slate-200 rounded px-2 py-1 focus:outline-none"
                    value={item.unitPrice} onChange={e => setItem(idx, 'unitPrice', e.target.value)} />
                  <div className="w-28 text-right font-bold text-[#00A66F] text-sm">{fmt(lineTotal)} Kč</div>
                  <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-400 text-lg leading-none">×</button>
                </div>
              );
            })}
          </div>
          <button onClick={addItem} className="mt-3 text-sm text-[#00A66F] hover:text-[#00B873] font-medium">+ Přidat položku</button>
        </div>

        {/* === PDF PREVIEW (read-only, captured by html2canvas) === */}
        <div id="offer-preview" style={{ background: 'white', fontFamily: 'Arial, Helvetica, sans-serif', color: '#1e293b', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>

          {/* Header */}
          <div style={{ padding: '32px 40px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b' }}>
                Cenová nabídka{customer.name ? ` – ${customer.name}` : ''}
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '20px' }}>
                <span>Platná do: <strong style={{ color: '#64748b' }}>{validUntil}</strong></span>
                <span>Datum: <strong style={{ color: '#64748b' }}>{date}</strong></span>
                <span>č. <strong style={{ color: '#64748b' }}>{offerNumber}</strong></span>
              </div>
            </div>
            <img src={LOGO_URL} alt="Alufen" style={{ height: '48px', objectFit: 'contain' }} crossOrigin="anonymous" />
          </div>

          {/* Supplier + Customer */}
          <div style={{ padding: '24px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ backgroundColor: '#00C981', borderRadius: '10px', padding: '18px 20px' }}>
              <div style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#e3fbf0', marginBottom: '6px' }}>Dodavatel</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', marginBottom: '6px' }}>{SUPPLIER.name}</div>
              <div style={{ fontSize: '12px', color: '#e3fbf0', lineHeight: '1.8' }}>
                {SUPPLIER.street}<br />{SUPPLIER.city}<br />{SUPPLIER.country}
              </div>
            </div>
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '18px 20px' }}>
              <div style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: '6px' }}>Zákazník</div>
              {customer.name ? (
                <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.8' }}>
                  <strong>{customer.name}</strong>
                  {customer.address && <><br />{customer.address}</>}
                  {customer.email && <><br />{customer.email}</>}
                  {customer.phone && <><br />{customer.phone}</>}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#cbd5e1', fontStyle: 'italic' }}>Nevyplněno</div>
              )}
            </div>
          </div>

          {/* Items */}
          <div style={{ padding: '24px 40px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: '12px' }}>Položky</div>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px', gap: '8px', padding: '6px 8px', backgroundColor: '#f1f5f9', borderRadius: '6px', marginBottom: '4px' }}>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#64748b' }}>Popis</div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>Množství</div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#64748b', textAlign: 'right' }}>Cena/j.</div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#64748b', textAlign: 'right' }}>Celkem</div>
            </div>
            {items.map((item, idx) => {
              const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);
              return (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px', gap: '8px', padding: '10px 8px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>{item.qty} {item.unit}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'right' }}>{fmt(item.unitPrice)} Kč</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#00C981', textAlign: 'right' }}>{fmt(lineTotal)} Kč</div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div style={{ backgroundColor: '#00C981', padding: '24px 40px', textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#e3fbf0', marginBottom: '4px' }}>Celková cena s DPH 21 %</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', lineHeight: '1.2' }}>{fmt(totalWithVat)} Kč</div>
            <div style={{ fontSize: '12px', color: '#e3fbf0', marginTop: '4px' }}>
              ( {fmt(total)} Kč bez DPH, DPH {fmt(vat)} Kč )
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '14px 40px', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
            Nabídka je platná 30 dní od data vystavení.
          </div>
        </div>
      </div>

    </div>
  );
}
