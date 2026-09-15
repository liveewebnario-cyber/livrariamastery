-- ============================================================
-- SETUP COMPLETO DO BANCO DE DADOS - SITE DE EBOOKS
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: site_config (configurações globais do site)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  logo_url TEXT DEFAULT '',
  site_name TEXT DEFAULT 'Minha Loja de Ebooks',
  tagline TEXT DEFAULT 'Os melhores ebooks para sua saúde e bem-estar',
  address TEXT DEFAULT 'Rua Exemplo, 123 - São Paulo, SP',
  phone TEXT DEFAULT '(11) 99999-9999',
  email TEXT DEFAULT 'contato@minhaloja.com',
  footer_text TEXT DEFAULT '© 2025 Minha Loja de Ebooks. Todos os direitos reservados.',
  primary_color TEXT DEFAULT '#6C3483',
  secondary_color TEXT DEFAULT '#F1C40F',
  accent_color TEXT DEFAULT '#E74C3C',
  whatsapp TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração padrão (singleton)
INSERT INTO site_config (id, site_name) VALUES (1, 'Minha Loja de Ebooks')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TABELA: categories (categorias / menu)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '📚',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Garantir coluna icon (caso tabela já existisse sem ela)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '📚';

-- Inserir categorias padrão
INSERT INTO categories (slug, name, icon, sort_order) VALUES
  ('saude-da-mulher', 'Saúde da Mulher', '👩‍⚕️', 1),
  ('saude-do-homem', 'Saúde do Homem', '👨‍⚕️', 2),
  ('bem-estar', 'Bem-Estar', '🌿', 3),
  ('sexualidade', 'Sexualidade', '💑', 4),
  ('nutricao', 'Nutrição', '🥗', 5),
  ('mente-e-emocoes', 'Mente & Emoções', '🧠', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- TABELA: banners (slider rotativo)
-- ============================================================
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  title TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  button_text TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir banners de exemplo (usando imagens placeholder)
INSERT INTO banners (image_url, title, subtitle, button_text, link_url, sort_order) VALUES
  ('https://placehold.co/1400x400/6C3483/white?text=Cuide+da+Sua+Saúde', 'Cuide da Sua Saúde', 'Os melhores ebooks para uma vida mais saudável', 'Ver Ebooks', '#categorias', 1),
  ('https://placehold.co/1400x400/E74C3C/white?text=Bem-Estar+%26+Qualidade+de+Vida', 'Bem-Estar & Qualidade de Vida', 'Conteúdo especializado para transformar sua vida', 'Explorar', '#categorias', 2),
  ('https://placehold.co/1400x400/F1C40F/333?text=Promoção+Especial', 'Promoção Especial', 'Até 60% de desconto em ebooks selecionados', 'Aproveitar', '#categorias', 3)
ON CONFLICT DO NOTHING;

-- ============================================================
-- TABELA: ebooks (produtos)
-- ============================================================
CREATE TABLE IF NOT EXISTS ebooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  cover_url TEXT DEFAULT '',
  old_price NUMERIC(10,2) DEFAULT NULL,
  new_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  short_description TEXT DEFAULT '',
  full_description TEXT DEFAULT '',
  author TEXT DEFAULT '',
  pages INTEGER DEFAULT NULL,
  checkout_url TEXT DEFAULT '#',
  badge TEXT DEFAULT '',
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir ebooks de exemplo
DO $$
DECLARE
  cat_mulher UUID;
  cat_homem UUID;
  cat_bemestar UUID;
  cat_sexualidade UUID;
  cat_nutricao UUID;
BEGIN
  SELECT id INTO cat_mulher FROM categories WHERE slug = 'saude-da-mulher';
  SELECT id INTO cat_homem FROM categories WHERE slug = 'saude-do-homem';
  SELECT id INTO cat_bemestar FROM categories WHERE slug = 'bem-estar';
  SELECT id INTO cat_sexualidade FROM categories WHERE slug = 'sexualidade';
  SELECT id INTO cat_nutricao FROM categories WHERE slug = 'nutricao';

  INSERT INTO ebooks (category_id, title, cover_url, old_price, new_price, short_description, checkout_url, badge, sort_order) VALUES
    -- Saúde da Mulher
    (cat_mulher, 'Guia Completo da Saúde Feminina', 'https://placehold.co/300x400/6C3483/white?text=Saúde+Feminina', 79.90, 39.90, 'Tudo que você precisa saber sobre saúde hormonal, ginecológica e bem-estar feminino em todas as fases da vida.', '#checkout', 'MAIS VENDIDO', 1),
    (cat_mulher, 'Menopausa sem Medo', 'https://placehold.co/300x400/8E44AD/white?text=Menopausa', 59.90, 29.90, 'Um guia prático e acolhedor para atravessar a menopausa com saúde, equilíbrio e qualidade de vida.', '#checkout', '', 2),
    (cat_mulher, 'Endometriose: Viva Bem', 'https://placehold.co/300x400/9B59B6/white?text=Endometriose', 69.90, 34.90, 'Estratégias naturais e médicas para controlar a endometriose e recuperar sua qualidade de vida.', '#checkout', 'NOVO', 3),
    (cat_mulher, 'Ciclo Menstrual Consciente', 'https://placehold.co/300x400/A569BD/white?text=Ciclo+Menstrual', 49.90, 24.90, 'Aprenda a entender e respeitar as fases do seu ciclo para viver com mais energia e equilíbrio.', '#checkout', '', 4),
    -- Saúde do Homem
    (cat_homem, 'Saúde Masculina 360°', 'https://placehold.co/300x400/1A5276/white?text=Saúde+Masculina', 79.90, 39.90, 'Guia completo sobre saúde física, hormonal e mental para homens de todas as idades.', '#checkout', 'DESTAQUE', 1),
    (cat_homem, 'Próstata Saudável', 'https://placehold.co/300x400/2471A3/white?text=Próstata', 59.90, 29.90, 'Prevenção, diagnóstico e tratamento de problemas de próstata com linguagem clara e acessível.', '#checkout', '', 2),
    (cat_homem, 'Hormônios Masculinos', 'https://placehold.co/300x400/2980B9/white?text=Hormônios', 69.90, 34.90, 'Como a testosterona e outros hormônios afetam sua energia, humor, libido e saúde geral.', '#checkout', 'NOVO', 3),
    (cat_homem, 'Fitness após os 40', 'https://placehold.co/300x400/5DADE2/white?text=Fitness+40+', 49.90, 24.90, 'Protocolos de treino e nutrição especialmente desenvolvidos para homens acima dos 40 anos.', '#checkout', '', 4),
    -- Bem-Estar
    (cat_bemestar, 'Meditação para Iniciantes', 'https://placehold.co/300x400/1E8449/white?text=Meditação', 49.90, 19.90, 'Um guia passo a passo para criar uma prática de meditação consistente e transformadora.', '#checkout', '', 1),
    (cat_bemestar, 'Sono Reparador', 'https://placehold.co/300x400/27AE60/white?text=Sono', 59.90, 27.90, 'Técnicas comprovadas para melhorar a qualidade do sono e acordar com mais energia todos os dias.', '#checkout', 'MAIS VENDIDO', 2),
    (cat_bemestar, 'Ansiedade sob Controle', 'https://placehold.co/300x400/2ECC71/white?text=Ansiedade', 69.90, 34.90, 'Ferramentas práticas baseadas em TCC e mindfulness para gerenciar a ansiedade no dia a dia.', '#checkout', '', 3),
    (cat_bemestar, 'Yoga em Casa', 'https://placehold.co/300x400/52BE80/white?text=Yoga', 44.90, 22.90, 'Sequências de yoga para todos os níveis, com foco em flexibilidade, força e paz interior.', '#checkout', 'NOVO', 4),
    -- Sexualidade
    (cat_sexualidade, 'Intimidade Plena', 'https://placehold.co/300x400/C0392B/white?text=Intimidade', 79.90, 39.90, 'Guia abrangente sobre saúde sexual, comunicação e conexão íntima para casais e indivíduos.', '#checkout', 'DESTAQUE', 1),
    (cat_sexualidade, 'Educação Sexual Adulta', 'https://placehold.co/300x400/E74C3C/white?text=Educação+Sexual', 59.90, 29.90, 'Informações cientificamente embasadas sobre sexualidade humana para adultos.', '#checkout', '', 2),
    (cat_sexualidade, 'Reconectando com o Desejo', 'https://placehold.co/300x400/EC7063/white?text=Desejo', 69.90, 34.90, 'Como reacender a libido e aprofundar a conexão íntima após períodos de estresse ou mudanças hormonais.', '#checkout', 'NOVO', 3),
    (cat_sexualidade, 'Relacionamentos Saudáveis', 'https://placehold.co/300x400/F1948A/white?text=Relacionamentos', 49.90, 24.90, 'Fundamentos para construir e manter relacionamentos amorosos saudáveis, baseados em respeito e comunicação.', '#checkout', '', 4),
    -- Nutrição
    (cat_nutricao, 'Alimentação Anti-inflamatória', 'https://placehold.co/300x400/D68910/white?text=Anti-inflamatória', 79.90, 39.90, 'Descubra como a alimentação pode reduzir inflamações crônicas e prevenir doenças.', '#checkout', 'MAIS VENDIDO', 1),
    (cat_nutricao, 'Guia do Intestino Saudável', 'https://placehold.co/300x400/E59866/white?text=Intestino', 59.90, 27.90, 'Microbioma, probióticos e alimentação para um intestino saudável e imunidade forte.', '#checkout', '', 2),
    (cat_nutricao, 'Detox sem Modismos', 'https://placehold.co/300x400/F0B27A/white?text=Detox', 49.90, 24.90, 'Uma abordagem científica e sustentável para desintoxicar o organismo sem dietas radicais.', '#checkout', 'NOVO', 3),
    (cat_nutricao, 'Nutrição Hormonal', 'https://placehold.co/300x400/F8C471/white?text=Nutrição+Hormonal', 69.90, 34.90, 'Como usar a alimentação para equilibrar os hormônios e melhorar energia, humor e metabolismo.', '#checkout', '', 4);
END $$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;

-- Políticas de LEITURA PÚBLICA (anon key pode ler)
CREATE POLICY "Public read site_config" ON site_config FOR SELECT TO anon USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT TO anon USING (active = true);
CREATE POLICY "Public read banners" ON banners FOR SELECT TO anon USING (active = true);
CREATE POLICY "Public read ebooks" ON ebooks FOR SELECT TO anon USING (active = true);

-- Políticas de ESCRITA apenas para service_role (admin)
CREATE POLICY "Service role all site_config" ON site_config FOR ALL TO service_role USING (true);
CREATE POLICY "Service role all categories" ON categories FOR ALL TO service_role USING (true);
CREATE POLICY "Service role all banners" ON banners FOR ALL TO service_role USING (true);
CREATE POLICY "Service role all ebooks" ON ebooks FOR ALL TO service_role USING (true);

-- ============================================================
-- STORAGE BUCKETS (execute separadamente se necessário)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('ebook-covers', 'ebook-covers', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
SELECT 'site_config' as tabela, COUNT(*) as registros FROM site_config
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'banners', COUNT(*) FROM banners
UNION ALL SELECT 'ebooks', COUNT(*) FROM ebooks;
