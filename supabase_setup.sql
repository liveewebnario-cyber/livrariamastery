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
  download_url TEXT DEFAULT '',
  rating NUMERIC(2,1) DEFAULT NULL,
  rating_count INTEGER DEFAULT 0,
  video_url TEXT DEFAULT '',
  audio_url TEXT DEFAULT '',
  featured BOOLEAN DEFAULT FALSE,
  badge TEXT DEFAULT '',
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cadastro de newsletter
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  welcome_sent BOOLEAN DEFAULT FALSE,
  welcome_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABELA: newsletter_emails (log de e-mails enviados a inscritos)
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  email_type TEXT NOT NULL DEFAULT 'welcome',
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS newsletter_emails_created_idx ON newsletter_emails (created_at DESC);
CREATE INDEX IF NOT EXISTS newsletter_emails_email_idx ON newsletter_emails (email);

-- ============================================================
-- E-mail de boas-vindas automatico ao se inscrever na newsletter
-- Dispara a Edge Function "newsletter-welcome" via pg_net
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION notify_newsletter_welcome()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://cghrmeckjzjzgpgcgiot.supabase.co/functions/v1/newsletter-welcome',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'newsletters',
      'record', jsonb_build_object('id', NEW.id, 'email', NEW.email)
    ),
    timeout_milliseconds := 5000
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_newsletter_welcome ON newsletters;
CREATE TRIGGER trg_newsletter_welcome
AFTER INSERT ON newsletters
FOR EACH ROW EXECUTE FUNCTION notify_newsletter_welcome();

-- ============================================================
-- TABELAS: templates e campanhas de e-mail
-- ============================================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  total INTEGER NOT NULL DEFAULT 0,
  sent INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ncr_campaign_idx ON newsletter_campaign_recipients (campaign_id, status);
CREATE INDEX IF NOT EXISTS ncr_sent_idx ON newsletter_campaign_recipients (sent_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS ncr_campaign_email_idx ON newsletter_campaign_recipients (campaign_id, email);
CREATE INDEX IF NOT EXISTS campaigns_status_idx ON newsletter_campaigns (status, scheduled_for);

-- ============================================================
-- CRON: processa campanhas agendadas/em andamento a cada 2 minutos
-- Dispara a Edge Function "send-newsletter" (action=auto) via pg_net
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  PERFORM cron.unschedule('send-newsletter-auto');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'send-newsletter-auto',
  '*/2 * * * *',
  $job$
  select net.http_post(
    url := 'https://cghrmeckjzjzgpgcgiot.supabase.co/functions/v1/send-newsletter',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('action', 'auto'),
    timeout_milliseconds := 15000
  );
  $job$
);

-- ============================================================
-- TABELA: cakto_orders (eventos de webhook da Cakto)
-- ============================================================
CREATE TABLE IF NOT EXISTS cakto_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dedup_key TEXT NOT NULL,
  cakto_order_id TEXT,
  event TEXT NOT NULL,
  status TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  product_name TEXT,
  amount NUMERIC,
  payment_method TEXT,
  checkout_url TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  email_error TEXT,
  raw JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS cakto_orders_dedup_idx ON cakto_orders (dedup_key);
CREATE INDEX IF NOT EXISTS cakto_orders_email_idx ON cakto_orders (customer_email);
CREATE INDEX IF NOT EXISTS cakto_orders_created_idx ON cakto_orders (created_at DESC);

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
