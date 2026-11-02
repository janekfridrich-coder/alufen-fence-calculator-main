import { dbRequest } from '@/api/apiClient';

async function call(body) {
  const { data, error } = await dbRequest(body);
  if (error) throw new Error(error.message);
  return data;
}

function createEntityStore(table) {
  return {
    async list(sort) {
      let order = [['created_date', 'desc']];
      if (sort && typeof sort === 'string') {
        const desc = sort.startsWith('-');
        order = [[desc ? sort.slice(1) : sort, desc ? 'desc' : 'asc']];
      }
      return (await call({ action: 'list', table, order })) || [];
    },

    async get(id) {
      return (await call({ action: 'get', table, id })) || null;
    },

    async create(data) {
      const now = new Date().toISOString();
      return call({ action: 'insert', table, data: { created_date: now, updated_date: now, ...data } });
    },

    async update(id, data) {
      return call({ action: 'update', table, id, data: { ...data, updated_date: new Date().toISOString() } });
    },

    async delete(id) {
      await call({ action: 'delete', table, id });
      return true;
    },
  };
}

export const CuttingPlan = createEntityStore('fence_cutting_plans');
export const PriceConfig = createEntityStore('fence_price_configs');
