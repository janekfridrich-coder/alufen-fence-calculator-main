// Přihlášení: POST /api/auth?action=login | logout, GET /api/auth?action=me
import bcrypt from 'bcryptjs';
import { query, createToken, getSessionUser, setSessionCookie, clearSessionCookie, sendError } from './_lib.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const action = req.query?.action;
  try {
    if (action === 'me') {
      const user = getSessionUser(req);
      if (!user) return res.status(401).json({ user: null });
      return res.status(200).json({ user });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Metoda není povolená' });

    if (action === 'logout') {
      clearSessionCookie(res);
      return res.status(200).json({ ok: true });
    }

    if (action === 'login') {
      const email = String(req.body?.email || '').trim().toLowerCase();
      const password = String(req.body?.password || '');
      if (!email || !password) return res.status(400).json({ error: 'Vyplňte e-mail a heslo' });

      const rows = await query('SELECT id, email, password_hash FROM app_users WHERE lower(email) = $1 LIMIT 1', [email]);
      const row = rows[0];
      const ok = row?.password_hash ? await bcrypt.compare(password, row.password_hash) : false;
      if (!ok) {
        await new Promise((r) => setTimeout(r, 500));
        return res.status(401).json({ error: 'Nesprávný e-mail nebo heslo' });
      }
      const user = { id: row.id, email: row.email };
      setSessionCookie(res, createToken(user));
      return res.status(200).json({ user });
    }

    return res.status(400).json({ error: 'Neznámá akce' });
  } catch (err) {
    sendError(res, err);
  }
}
