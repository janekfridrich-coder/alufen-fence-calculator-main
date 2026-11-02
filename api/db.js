// POST /api/db – přístup k tabulkám kalkulačky (jen pro přihlášené).
import { getSessionUser, runDbAction, sendError } from './_lib.js';

const TABLES = ['fence_cutting_plans', 'fence_price_configs'];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metoda není povolená' });
  if (!getSessionUser(req)) return res.status(401).json({ error: 'Nejste přihlášen' });
  try {
    const data = await runDbAction(req.body, { tables: TABLES, functions: [] });
    res.status(200).json({ data });
  } catch (err) {
    sendError(res, err);
  }
}
