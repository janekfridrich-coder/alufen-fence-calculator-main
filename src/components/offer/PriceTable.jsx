import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

export default function PriceTable({ items, onChange }) {
  const updateItem = (idx, field, value) => {
    const updated = items.map((it, i) => i === idx ? { ...it, [field]: value } : it);
    onChange(updated);
  };

  const addItem = () => {
    onChange([...items, { label: '', qty: 1, unit: 'ks', unitPrice: 0 }]);
  };

  const removeItem = (idx) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const total = items.reduce((sum, it) => sum + (parseFloat(it.qty) || 0) * (parseFloat(it.unitPrice) || 0), 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
      <h3 className="font-bold text-slate-800 mb-4 text-lg">Položky nabídky</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 px-2 text-slate-500 font-medium w-1/2">Popis</th>
              <th className="text-left py-2 px-2 text-slate-500 font-medium">Množství</th>
              <th className="text-left py-2 px-2 text-slate-500 font-medium">Jednotka</th>
              <th className="text-left py-2 px-2 text-slate-500 font-medium">Cena/j.</th>
              <th className="text-right py-2 px-2 text-slate-500 font-medium">Celkem</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-50">
                <td className="py-2 px-2">
                  <Input value={item.label} onChange={e => updateItem(idx, 'label', e.target.value)} placeholder="Popis položky" />
                </td>
                <td className="py-2 px-2">
                  <Input type="number" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} className="w-20" />
                </td>
                <td className="py-2 px-2">
                  <Input value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)} className="w-16" />
                </td>
                <td className="py-2 px-2">
                  <Input type="number" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} className="w-24" />
                </td>
                <td className="py-2 px-2 text-right font-semibold text-slate-700">
                  {((parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0)).toLocaleString('cs-CZ')} Kč
                </td>
                <td className="py-2 px-1">
                  <button onClick={() => removeItem(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="w-4 h-4 mr-1" />
          Přidat položku
        </Button>
        <div className="text-right">
          <div className="text-sm text-slate-500">Celkem bez DPH</div>
          <div className="text-2xl font-bold text-emerald-600">{total.toLocaleString('cs-CZ')} Kč</div>
          <div className="text-sm text-slate-500">DPH 21%: {(total * 0.21).toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč</div>
          <div className="text-lg font-bold text-slate-800">S DPH: {(total * 1.21).toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč</div>
        </div>
      </div>
    </div>
  );
}