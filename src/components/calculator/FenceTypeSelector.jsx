import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Box, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const DEFAULT_PACKAGE_LENGTH = 6500;

export default function FenceTypeSelector({ onSelect, packageLengths, onPackageLengthsChange }) {
  const [showLengths, setShowLengths] = useState(false);
  const [newLength, setNewLength] = useState('');

  const lengths = packageLengths || [DEFAULT_PACKAGE_LENGTH];

  const handleAddLength = () => {
    const val = parseInt(newLength);
    if (val > 0 && !lengths.includes(val)) {
      onPackageLengthsChange([...lengths, val].sort((a, b) => a - b));
    }
    setNewLength('');
  };

  const handleRemoveLength = (len) => {
    if (lengths.length === 1) return; // keep at least one
    onPackageLengthsChange(lengths.filter(l => l !== len));
  };

  const types = [
    {
      id: '2D',
      title: '2D Plot',
      description: 'Ploché hliníkové lamely pro klasický design plotu',
      icon: Layers,
      profiles: ['Přední Profil', 'Boční Profil']
    },
    {
      id: '3D',
      title: '3D Plot',
      description: 'Zkosené hliníkové lamely pro moderní design plotu',
      icon: Box,
      profiles: ['F Profil', 'U Profil']
    }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
          Vyberte typ plotu
        </h2>
        <p className="text-slate-500">
          Zvolte typ hliníkového plotu, který chcete vypočítat
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {types.map((type, index) => (
          <motion.button
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(type.id)}
            className="group relative bg-white rounded-2xl p-8 shadow-sm border-2 border-slate-100 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 text-left"
          >
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-500 flex items-center justify-center transition-all duration-300">
              <span className="text-slate-400 group-hover:text-white font-bold text-sm">
                {type.id}
              </span>
            </div>
            
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <type.icon className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {type.title}
            </h3>
            <p className="text-slate-500 mb-4">
              {type.description}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {type.profiles.map(profile => (
                <span 
                  key={profile}
                  className="text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-full"
                >
                  {profile}
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-10 p-6 bg-slate-50 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-700">Informace o balení</h4>
          <button
            onClick={() => setShowLengths(v => !v)}
            className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Délka lamel
            {showLengths ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Lamel v balení: <strong>4 ks</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Dostupné délky: <strong>{lengths.join(', ')} mm</strong></span>
          </div>
        </div>

        {showLengths && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {lengths.map(len => (
                <div key={len} className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700">
                  {len} mm
                  {lengths.length > 1 && (
                    <button onClick={() => handleRemoveLength(len)} className="ml-1 text-slate-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Nová délka (mm)"
                value={newLength}
                onChange={e => setNewLength(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddLength()}
                className="flex-1 h-9 text-sm"
              />
              <Button size="sm" onClick={handleAddLength} disabled={!newLength} className="bg-emerald-500 hover:bg-emerald-600 gap-1">
                <Plus className="w-3.5 h-3.5" />
                Přidat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}