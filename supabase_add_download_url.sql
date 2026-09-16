-- ============================================================
-- Adiciona a coluna download_url na tabela ebooks
-- Execute este script no SQL Editor do Supabase:
--   https://supabase.com/dashboard/project/cghrmeckjzjzgpgcgiot/sql/new
-- ============================================================

ALTER TABLE ebooks ADD COLUMN IF NOT EXISTS download_url TEXT DEFAULT '';

-- (Opcional) verificação:
SELECT column_name FROM information_schema.columns
WHERE table_name = 'ebooks' AND column_name = 'download_url';