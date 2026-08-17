/**
 * localDb.js
 *
 * Lightweight, dependency-free replacement for the Base44 `entities` API.
 * Data is persisted in the browser's localStorage instead of a remote
 * Base44-hosted database. The exposed methods intentionally mirror the
 * subset of the Base44 SDK entity API this app used (create/list/get/
 * update/delete), so the rest of the app didn't need to change.
 *
 * Note: since everything lives in localStorage, data is per-browser and
 * per-device. If you later want multi-device sync, swap the internals of
 * this file for calls to your own backend/database — the function
 * signatures used by the app can stay the same.
 */

const STORAGE_PREFIX = 'alufen_db_';

function readAll(entityName) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + entityName);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Failed to read "${entityName}" from localStorage`, e);
    return [];
  }
}

function writeAll(entityName, records) {
  localStorage.setItem(STORAGE_PREFIX + entityName, JSON.stringify(records));
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Creates a simple entity store, similar in shape to a Base44 entity.
 */
function createEntityStore(entityName) {
  return {
    async list(sort) {
      const records = readAll(entityName);

      if (sort && typeof sort === 'string') {
        const desc = sort.startsWith('-');
        const field = desc ? sort.slice(1) : sort;
        records.sort((a, b) => {
          if (a[field] < b[field]) return desc ? 1 : -1;
          if (a[field] > b[field]) return desc ? -1 : 1;
          return 0;
        });
      }

      return records;
    },

    async get(id) {
      const records = readAll(entityName);
      return records.find((r) => r.id === id) || null;
    },

    async create(data) {
      const records = readAll(entityName);
      const now = new Date().toISOString();
      const record = {
        id: generateId(),
        created_date: now,
        updated_date: now,
        ...data,
      };
      records.push(record);
      writeAll(entityName, records);
      return record;
    },

    async update(id, data) {
      const records = readAll(entityName);
      const idx = records.findIndex((r) => r.id === id);
      if (idx === -1) {
        throw new Error(`${entityName} with id "${id}" not found`);
      }
      records[idx] = {
        ...records[idx],
        ...data,
        updated_date: new Date().toISOString(),
      };
      writeAll(entityName, records);
      return records[idx];
    },

    async delete(id) {
      const records = readAll(entityName);
      const filtered = records.filter((r) => r.id !== id);
      writeAll(entityName, filtered);
      return true;
    },
  };
}

export const CuttingPlan = createEntityStore('cutting_plans');
export const PriceConfig = createEntityStore('price_configs');
