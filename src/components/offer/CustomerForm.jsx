import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CustomerForm({ customer, onChange }) {
  const set = (field, value) => onChange({ ...customer, [field]: value });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
      <h3 className="font-bold text-slate-800 mb-4 text-lg">Údaje o zákazníkovi</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Jméno / Firma</Label>
          <Input className="mt-1" value={customer.name || ''} onChange={e => set('name', e.target.value)} placeholder="Jan Novák" />
        </div>
        <div>
          <Label>Email</Label>
          <Input className="mt-1" value={customer.email || ''} onChange={e => set('email', e.target.value)} placeholder="jan@example.cz" />
        </div>
        <div>
          <Label>Telefon</Label>
          <Input className="mt-1" value={customer.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+420 123 456 789" />
        </div>
        <div>
          <Label>Adresa</Label>
          <Input className="mt-1" value={customer.address || ''} onChange={e => set('address', e.target.value)} placeholder="Ulice 1, Praha" />
        </div>
        <div className="md:col-span-2">
          <Label>Poznámka</Label>
          <Input className="mt-1" value={customer.note || ''} onChange={e => set('note', e.target.value)} placeholder="Volitelná poznámka..." />
        </div>
      </div>
    </div>
  );
}