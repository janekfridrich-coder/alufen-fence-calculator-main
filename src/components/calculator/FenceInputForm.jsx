import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calculator, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GapSelector from './GapSelector';

export default function FenceInputForm({ fenceType, onSubmit, initialFences, initialCustomerName }) {
  const [customerName, setCustomerName] = useState(initialCustomerName || '');
  const [fences, setFences] = useState(initialFences.length > 0 ? initialFences : [
    { id: 1, height: '', width: '', quantity: 1, selectedGap: null, profile: '' }
  ]);

  const profiles = fenceType === '2D' 
    ? [{ value: 'predni', label: 'Přední Profil' }, { value: 'bocni', label: 'Boční Profil' }]
    : [{ value: 'f', label: 'F Profil' }, { value: 'u', label: 'U Profil' }];

  const addFence = () => {
    const newId = Math.max(...fences.map(f => f.id), 0) + 1;
    setFences([...fences, { id: newId, height: '', width: '', quantity: 1, selectedGap: null, profile: '' }]);
  };

  const removeFence = (id) => {
    if (fences.length > 1) {
      setFences(fences.filter(f => f.id !== id));
    }
  };

  const updateFence = (id, field, value) => {
    setFences(fences.map(f => {
      if (f.id === id) {
        const updated = { ...f, [field]: value };
        // Reset selected gap when height changes
        if (field === 'height') {
          updated.selectedGap = null;
        }
        return updated;
      }
      return f;
    }));
  };

  const isValid = fences.every(f => 
    f.height && f.width && f.quantity > 0 && f.selectedGap && f.profile
  );

  const handleSubmit = () => {
    if (isValid) {
      onSubmit(fences, customerName);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
          Nastavte rozměry {fenceType} plotu
        </h2>
        <p className="text-slate-500">
          Zadejte rozměry každého dílu plotu a vyberte mezery mezi lamelami
        </p>
      </div>

      {/* Customer Name */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
        <Label className="text-slate-600 mb-2 block font-semibold">Zákazník (název / jméno)</Label>
        <Input
          placeholder="např. Jan Novák nebo Firma s.r.o."
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          className="h-11"
        />
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {fences.map((fence, index) => (
            <motion.div
              key={fence.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-slate-800">Díl plotu</h3>
                </div>
                {fences.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFence(fence.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label className="text-slate-600 mb-2 block">Výška (mm)</Label>
                  <Input
                   type="number"
                   placeholder="např. 1800"
                   value={fence.height}
                   onChange={(e) => updateFence(fence.id, 'height', e.target.value)}
                   className="h-12"
                  />
                  </div>
                  <div>
                  <Label className="text-slate-600 mb-2 block">Šířka (mm)</Label>
                  <Input
                   type="number"
                   placeholder="např. 2500"
                   value={fence.width}
                   onChange={(e) => updateFence(fence.id, 'width', e.target.value)}
                   className="h-12"
                  />
                  </div>
                  <div>
                  <Label className="text-slate-600 mb-2 block">Počet kusů</Label>
                  <Input
                    type="number"
                    min="1"
                    value={fence.quantity}
                    onChange={(e) => updateFence(fence.id, 'quantity', parseInt(e.target.value) || 1)}
                    className="h-12"
                  />
                </div>
              </div>

              {/* Gap Selection */}
              {fence.height && parseInt(fence.height) > 200 && (
                <div className="mb-6">
                  <Label className="text-slate-600 mb-3 block">Vyberte velikost mezery</Label>
                  <GapSelector
                    height={parseInt(fence.height)}
                    fenceType={fenceType}
                    selectedGap={fence.selectedGap}
                    onSelect={(gap) => updateFence(fence.id, 'selectedGap', gap)}
                  />
                </div>
              )}

              {/* Profile Selection */}
              <div>
                <Label className="text-slate-600 mb-2 block">Typ profilu</Label>
                <Select
                  value={fence.profile}
                  onValueChange={(value) => updateFence(fence.id, 'profile', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Vyberte typ profilu" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Summary for this fence */}
              {fence.selectedGap && (
                <div className="mt-6 p-4 bg-emerald-50 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Potřeba lamel:</span>
                    <span className="font-bold text-emerald-700">
                      {fence.selectedGap.lamellas} × {fence.quantity} = {fence.selectedGap.lamellas * fence.quantity} ks
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Fence Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={addFence}
          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Přidat další díl plotu
        </motion.button>

        {/* Summary */}
        {fences.some(f => f.selectedGap) && (
          <div className="bg-slate-50 rounded-2xl p-6">
            <h4 className="font-semibold text-slate-800 mb-4">Souhrn objednávky</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Celkem dílů plotu:</span>
                <span className="font-semibold">{fences.reduce((sum, f) => sum + (f.quantity || 0), 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Celkem potřeba lamel:</span>
                <span className="font-semibold">
                  {fences.reduce((sum, f) => sum + (f.selectedGap ? f.selectedGap.lamellas * f.quantity : 0), 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Calculate Button */}
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-lg font-semibold shadow-lg shadow-emerald-500/30"
        >
          <Calculator className="w-5 h-5 mr-2" />
          Vypočítat řezací plán
        </Button>
      </div>
    </div>
  );
}