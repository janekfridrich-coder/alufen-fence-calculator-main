# Databáze Neon

Aplikace už nepoužívá Supabase. Data jsou v Neon Postgres a prohlížeč s databází
nemluví přímo – vše jde přes serverové funkce ve složce `api/` (běží na Vercelu).

| Soubor | Co dělá |
| --- | --- |
| `api/_lib.js` | připojení k Neonu, přihlašovací cookie, bezpečné dotazy jen na povolené tabulky |
| `api/auth.js` | přihlášení / odhlášení / kdo je přihlášen |
| `api/db.js` | čtení a zápis dat (seznam povolených tabulek je v souboru) |
| `src/api/apiClient.js` | volání `/api/...` z prohlížeče |
| `neon-setup.sql` | tabulka uživatelů `app_users` + příklady přidání uživatele |

## Proměnné na Vercelu (Settings → Environment Variables)

- `DATABASE_URL` – připojovací řetězec z Neonu (Connect → *Pooled connection*)
- `AUTH_SECRET` – libovolný náhodný text, aspoň 32 znaků (podepisuje přihlášení)

Staré `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` lze smazat.

## Uživatelé

Uživatelé jsou v tabulce `app_users`. Nového přidáte v Neon Console → SQL Editor:

```sql
INSERT INTO app_users (email, password_hash)
VALUES ('jmeno@alufen.cz', crypt('Heslo', gen_salt('bf')));
```

## Lokální vývoj

`npm run dev` spustí jen frontend. Aby fungovalo i `/api`, použijte `npx vercel dev`
(s proměnnými v `.env.local`).
