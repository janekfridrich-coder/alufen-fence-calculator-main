import React, { useState, useEffect } from 'react';
import { CuttingPlan } from '@/lib/localDb';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Calendar, Layers, ExternalLink } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function HistoryPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    CuttingPlan.list('-created_date')
      .then(data => {
        setPlans(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Načtení historie výpočtů selhalo:', err);
        setError(
          (err && (err.message || err.error_description || err.details)) ||
          'Historii výpočtů se nepodařilo načíst. Zkontrolujte připojení k internetu a zkuste to znovu.'
        );
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    try {
      await CuttingPlan.delete(id);
      setPlans(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Smazání výpočtu selhalo:', err);
      alert((err && err.message) || 'Smazání výpočtu se nezdařilo.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => window.location.href = createPageUrl('Calculator')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Zpět na kalkulačku
          </Button>
          <h1 className="text-2xl font-bold text-slate-800">Historie výpočtů</h1>
        </div>

        {loading ? (
          <p className="text-slate-400 text-center py-12">Načítání...</p>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 font-medium">⚠ {error}</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Zatím žádné uložené výpočty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-slate-800 text-lg">{plan.name || 'Bez názvu'}</div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Layers className="w-4 h-4" />
                      {plan.fence_type} plot
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(plan.created_date), 'dd. MM. yyyy HH:mm')}
                    </span>
                    <span>{plan.fences?.length ?? 0} dílů</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.location.href = createPageUrl(`Calculator?planId=${plan.id}`)} className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                    <ExternalLink className="w-4 h-4" />
                    Otevřít
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
