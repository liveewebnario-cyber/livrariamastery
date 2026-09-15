-- PRD v1.0 Supabase Schema

-- 1. Site Config
CREATE TABLE site_config (
    id INT PRIMARY KEY DEFAULT 1,
    logo_url TEXT,
    site_name TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    footer_text TEXT,
    primary_color TEXT DEFAULT '#6C3483',
    secondary_color TEXT DEFAULT '#F1C40F',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT one_row CHECK (id = 1)
);

-- 2. Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

-- 3. Banners
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    link_url TEXT,
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

-- 4. Ebooks
CREATE TABLE ebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    cover_url TEXT,
    old_price NUMERIC(10,2),
    new_price NUMERIC(10,2),
    short_description TEXT,
    checkout_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Default Data Seed
INSERT INTO site_config (id, site_name, logo_url, address, phone, email, footer_text)
VALUES (1, 'Mastery Ebooks', '', 'Rua Exemplo, 123', '(11) 99999-9999', 'contato@mastery.com', '© 2026 Mastery Ebooks. Todos os direitos reservados.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (name, slug, sort_order) VALUES 
('Saúde da Mulher', 'saude-mulher', 1),
('Saúde do Homem', 'saude-homem', 2),
('Bem Estar', 'bem-estar', 3),
('Sexualidade', 'sexualidade', 4);

-- Configuration for RLS (Read Only Publicly)
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read" ON site_config FOR SELECT USING (true);
CREATE POLICY "Public Read" ON categories FOR SELECT USING (active = true);
CREATE POLICY "Public Read" ON banners FOR SELECT USING (active = true);
CREATE POLICY "Public Read" ON ebooks FOR SELECT USING (active = true);
