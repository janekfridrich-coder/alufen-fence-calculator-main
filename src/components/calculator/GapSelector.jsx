import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function GapSelector({ height, fenceType, selectedGap, onSelect }) {
  const gaps = useMemo(() => {
    return calculateGaps(height, fenceType);
  }, [height, fenceType]);

  const gapOptions = [
    { key: 'smaller', data: gaps.smaller, color: 'blue' },
    { key: 'normal', data: gaps.normal, color: 'emerald' },
    { key: 'bigger', data: gaps.bigger, color: 'amber' }
  ].filter(opt => opt.data !== null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {gapOptions.map((option) => {
        const isSelected = selectedGap?.key === option.key;
        const colorClasses = {
          blue: 'border-blue-500 bg-blue-50 ring-blue-500',
          emerald: 'border-emerald-500 bg-emerald-50 ring-emerald-500',
          amber: 'border-amber-500 bg-amber-50 ring-amber-500'
        };
        const textClasses = {
          blue: 'text-blue-700',
          emerald: 'text-emerald-700',
          amber: 'text-amber-700'
        };
        
        return (
          <motion.button
            key={option.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect({ ...option.data, key: option.key })}
            className={`relative p-4 rounded-xl border-2 transition-all text-left ${
              isSelected 
                ? `${colorClasses[option.color]} ring-2` 
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            {isSelected && (
              <div className={`absolute top-2 right-2 w-5 h-5 rounded-full ${
                option.color === 'blue' ? 'bg-blue-500' :
                option.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
              } flex items-center justify-center`}>
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            
            <div className={`text-xs uppercase tracking-wide font-semibold mb-1 ${
              isSelected ? textClasses[option.color] : 'text-slate-400'
            }`}>
              {option.data.label}
            </div>
            
            <div className={`text-2xl font-bold mb-1 ${
              isSelected ? textClasses[option.color] : 'text-slate-800'
            }`}>
              {option.data.gap.toFixed(1)} cm
            </div>
            
            <div className="text-sm text-slate-500">
              {option.data.lamellas} lamel
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

function calculateGaps(height, fenceType) {
  const divisor = fenceType === '2D' ? 112 : 106;
  
  const normalLamellas = Math.floor(height / divisor);
  const smallerLamellas = normalLamellas + 1;
  const biggerLamellas = normalLamellas - 1;

  // Normal gap
  let normalGap = 0;
  if (normalLamellas > 1) {
    normalGap = ((height - (divisor * normalLamellas)) / (normalLamellas - 1)) / 10;
  }
  
  // Smaller gap (more lamellas, smaller gap between them)
  let smallerGap = 0;
  if (smallerLamellas > 1) {
    smallerGap = ((height - (divisor * smallerLamellas)) / (smallerLamellas - 1)) / 10;
  }
  
  // Bigger gap: remove 1 lamella, redistribute remaining space
  // biggerLamellas = normalLamellas - 1
  // gap = (height - divisor * biggerLamellas) / (biggerLamellas - 1)
  let biggerGap = null;
  if (biggerLamellas > 1) {
    biggerGap = ((height - (divisor * biggerLamellas)) / (biggerLamellas - 1)) / 10;
  }

  return {
    normal: normalLamellas > 1 ? { 
      gap: Math.round(normalGap * 10) / 10, 
      lamellas: normalLamellas,
      label: 'Normální'
    } : null,
    smaller: smallerLamellas > 1 ? { 
      gap: Math.round(smallerGap * 10) / 10, 
      lamellas: smallerLamellas,
      label: 'Menší mezera'
    } : null,
    bigger: biggerGap !== null && biggerLamellas > 1 && biggerGap > 0 ? { 
      gap: Math.round(biggerGap * 10) / 10, 
      lamellas: biggerLamellas,
      label: 'Větší mezera'
    } : null
  };
}