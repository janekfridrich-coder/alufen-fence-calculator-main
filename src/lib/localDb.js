import { supabase } from '@/api/supabaseClient';

function createEntityStore(tableName) {
  return {
    async list(sort) {
      let query = supabase.from(tableName).select('*');

    if (sort && typeof sort === 'string') {
      const desc = sort.startsWith('-');
      const field = desc ? sort.slice(1) : sort;
      query = query.order(field, { ascending: !desc });
    } else {
      query = query.order('created_date', { ascending: false });
    }

    const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async get(id) {
      const { data, error } = await supabase.from(tableName).select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data || null;
    },

    async create(data) {
      const now = new Date().toISOString();
      const record = { created_date: now, updated_date: now, ...data };
      const { data: created, error } = await supabase.from(tableName).insert(record).select().single();
      if (error) throw error;
      return created;
    },

    async update(id, data) {
      const record = { ...data, updated_date: new Date().toISOString() };
      const { data: updated, error } = await supabase.from(tableName).update(record).eq('id', id).select().single();
      if (error) throw error;
      return updated;
    },

    async delete(id) {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      return true;
    },
  };
}

export const CuttingPlan = createEntityStore('fence_cutting_plans');
export const PriceConfig = createEntityStore('fence_price_configs');
