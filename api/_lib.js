// Sdílené pomocné funkce pro serverové funkce na Vercelu (Neon Postgres + přihlášení).
// Soubory začínající podtržítkem Vercel nebere jako samostatný endpoint.
import crypto from 'node:crypto';
import pg from 'pg';

const { Pool, types } = pg;

// Vracet hodnoty ve stejném tvaru, jaký posílal Supabase (aby frontend nic nepoznal).
types.setTypeParser(1082, (v) => v); // date -> 'YYYY-MM-DD'
types.setTypeParser(1114, (v) => v.replace(' ', 'T')); // timestamp
types.setTypeParser(1184, (v) => {
  // timestamptz -> '2026-10-19T10:00:00.123+00:00'
  const s = v.replace(' ', 'T');
  return /[+-]\d\d$/.test(s) ? `${s}:00` : s;
});
types.setTypeParser(20, (v) => Number(v)); // bigint
types.setTypeParser(1700, (v) => Number(v)); // numeric

let pool;
export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL není nastavená');
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  return pool;
}

export async function query(text, params = []) {
  const { rows } = await getPool().query(text, params);
  return rows;
}

// ---------- Session cookie (podepsaná HMAC, bez externí služby) ----------
const COOKIE = 'alufen_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dní

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error('AUTH_SECRET není nastavený (min. 32 znaků)');
  return s;
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createToken(user) {
  const payload = Buffer.from(
    JSON.stringify({ sub: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + MAX_AGE })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!data.exp || data.exp < Date.now() / 1000) return null;
    return { id: data.sub, email: data.email };
  } catch {
    return null;
  }
}

function readCookie(req, name) {
  const header = req.headers?.cookie || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

export function getSessionUser(req) {
  return verifyToken(readCookie(req, COOKIE));
}

export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`);
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

// ---------- Obecné CRUD nad povolenými tabulkami ----------
const IDENT = /^[a-z_][a-z0-9_]*$/i;
const OPS = { eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=', ilike: 'ILIKE', like: 'LIKE' };

function ident(name) {
  if (typeof name !== 'string' || !IDENT.test(name)) throw new HttpError(400, `Neplatný název: ${name}`);
  return `"${name}"`;
}

// Objekty a pole ukládáme jako JSON (sloupce jsonb), ostatní hodnoty beze změny.
function toDbValue(v) {
  if (v !== null && typeof v === 'object' && !(v instanceof Date)) return JSON.stringify(v);
  return v;
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function buildWhere(filters, params) {
  if (!filters?.length) return '';
  const parts = filters.map(([col, op, val]) => {
    const sqlOp = OPS[op];
    if (!sqlOp) throw new HttpError(400, `Neplatný operátor: ${op}`);
    if (val === null && op === 'eq') return `${ident(col)} IS NULL`;
    params.push(val);
    return `${ident(col)} ${sqlOp} $${params.length}`;
  });
  return ` WHERE ${parts.join(' AND ')}`;
}

function buildOrder(order) {
  if (!order?.length) return '';
  return ` ORDER BY ${order.map(([col, dir]) => `${ident(col)} ${dir === 'desc' ? 'DESC' : 'ASC'}`).join(', ')}`;
}

/**
 * Provede jednu operaci nad tabulkou.
 * body: { table, action: 'list'|'get'|'insert'|'update'|'delete'|'rpc', filters, order, data, id, fn, args }
 * allowed: { tables: string[], functions: string[] }
 */
export async function runDbAction(body, allowed) {
  const { action } = body || {};

  if (action === 'rpc') {
    if (!allowed.functions?.includes(body.fn)) throw new HttpError(403, `Funkce není povolená: ${body.fn}`);
    const params = [];
    const args = Object.entries(body.args || {}).map(([k, v]) => {
      params.push(toDbValue(v));
      return `${ident(k)} => $${params.length}`;
    });
    return query(`SELECT * FROM ${ident(body.fn)}(${args.join(', ')})`, params);
  }

  if (!allowed.tables.includes(body?.table)) throw new HttpError(403, `Tabulka není povolená: ${body?.table}`);
  const t = ident(body.table);
  const params = [];

  switch (action) {
    case 'list': {
      const where = buildWhere(body.filters, params);
      return query(`SELECT * FROM ${t}${where}${buildOrder(body.order)}`, params);
    }
    case 'get': {
      const rows = await query(`SELECT * FROM ${t} WHERE "id" = $1 LIMIT 1`, [body.id]);
      return rows[0] ?? null;
    }
    case 'insert': {
      const entries = Object.entries(body.data || {}).filter(([, v]) => v !== undefined);
      if (!entries.length) {
        const rows = await query(`INSERT INTO ${t} DEFAULT VALUES RETURNING *`);
        return rows[0];
      }
      const cols = entries.map(([k]) => ident(k));
      const vals = entries.map(([, v]) => {
        params.push(toDbValue(v));
        return `$${params.length}`;
      });
      const rows = await query(`INSERT INTO ${t} (${cols.join(', ')}) VALUES (${vals.join(', ')}) RETURNING *`, params);
      return rows[0];
    }
    case 'update': {
      const entries = Object.entries(body.data || {}).filter(([k, v]) => v !== undefined && k !== 'id');
      if (!entries.length) throw new HttpError(400, 'Není co uložit');
      const sets = entries.map(([k, v]) => {
        params.push(toDbValue(v));
        return `${ident(k)} = $${params.length}`;
      });
      params.push(body.id);
      const rows = await query(`UPDATE ${t} SET ${sets.join(', ')} WHERE "id" = $${params.length} RETURNING *`, params);
      if (!rows.length) throw new HttpError(404, 'Záznam nenalezen');
      return rows[0];
    }
    case 'delete': {
      await query(`DELETE FROM ${t} WHERE "id" = $1`, [body.id]);
      return true;
    }
    default:
      throw new HttpError(400, `Neznámá akce: ${action}`);
  }
}

export function sendError(res, err) {
  const status = err instanceof HttpError ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: err.message || 'Chyba serveru' });
}
