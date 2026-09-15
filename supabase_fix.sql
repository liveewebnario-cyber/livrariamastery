-- ============================================================
-- CORREÇÃO RLS - Permite que o dashboard admin grave dados
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Remover políticas antigas restritivas
DROP POLICY IF EXISTS "Public Read" ON ebooks;
DROP POLICY IF EXISTS "Public read ebooks" ON ebooks;
DROP POLICY IF EXISTS "Admin all ebooks" ON ebooks;

DROP POLICY IF EXISTS "Public Read" ON banners;
DROP POLICY IF EXISTS "Public read banners" ON banners;
DROP POLICY IF EXISTS "Admin all banners" ON banners;

DROP POLICY IF EXISTS "Public Read" ON categories;
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Admin all categories" ON categories;

DROP POLICY IF EXISTS "Public Read" ON site_config;
DROP POLICY IF EXISTS "Public read site_config" ON site_config;
DROP POLICY IF EXISTS "Admin all site_config" ON site_config;

-- ============================================================
-- NOVAS POLÍTICAS: leitura pública + escrita pela anon key
-- (necessário pois o dashboard roda com anon key no navegador)
-- ============================================================

-- EBOOKS
CREATE POLICY "Leitura publica ebooks"
  ON ebooks FOR SELECT TO anon USING (true);

CREATE POLICY "Escrita ebooks"
  ON ebooks FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Edicao ebooks"
  ON ebooks FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Exclusao ebooks"
  ON ebooks FOR DELETE TO anon USING (true);

-- BANNERS
CREATE POLICY "Leitura publica banners"
  ON banners FOR SELECT TO anon USING (true);

CREATE POLICY "Escrita banners"
  ON banners FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Edicao banners"
  ON banners FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Exclusao banners"
  ON banners FOR DELETE TO anon USING (true);

-- CATEGORIES
CREATE POLICY "Leitura publica categories"
  ON categories FOR SELECT TO anon USING (true);

CREATE POLICY "Escrita categories"
  ON categories FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Edicao categories"
  ON categories FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Exclusao categories"
  ON categories FOR DELETE TO anon USING (true);

-- SITE_CONFIG
CREATE POLICY "Leitura publica site_config"
  ON site_config FOR SELECT TO anon USING (true);

CREATE POLICY "Edicao site_config"
  ON site_config FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Verificar políticas ativas
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('ebooks','banners','categories','site_config')
ORDER BY tablename, cmd;
