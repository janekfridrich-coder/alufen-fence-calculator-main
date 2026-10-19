-- Spusťte jednou v Neon Console -> SQL Editor (po importu dat ze Supabase).
-- Tabulka uživatelů pro přihlášení do aplikací Alufen.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Přidání uživatele (heslo se uloží zahashované):
-- INSERT INTO app_users (email, password_hash)
-- VALUES ('jmeno@alufen.cz', crypt('SemNapisteHeslo', gen_salt('bf')));

-- Změna hesla:
-- UPDATE app_users SET password_hash = crypt('NoveHeslo', gen_salt('bf')) WHERE email = 'jmeno@alufen.cz';
