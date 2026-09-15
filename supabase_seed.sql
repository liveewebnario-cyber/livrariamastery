-- ============================================================
-- SEED DE DADOS - compatível com schema PRD v1.0
-- Apenas insere dados nas tabelas já existentes
-- ============================================================

-- Limpar dados anteriores (evita duplicatas)
DELETE FROM ebooks;
DELETE FROM banners;
DELETE FROM categories;

-- Categorias (sem coluna icon - schema original)
INSERT INTO categories (name, slug, sort_order, active) VALUES
  ('Saúde da Mulher', 'saude-mulher',   1, true),
  ('Saúde do Homem',  'saude-homem',    2, true),
  ('Bem Estar',       'bem-estar',      3, true),
  ('Sexualidade',     'sexualidade',    4, true);

-- Banners (sem coluna button_text - schema original)
INSERT INTO banners (image_url, title, subtitle, link_url, sort_order, active) VALUES
  ('https://placehold.co/1400x400/6C3483/white?text=Cuide+da+Sua+Saude',   'Cuide da Sua Saúde',          'Os melhores ebooks para uma vida mais saudável', '#', 1, true),
  ('https://placehold.co/1400x400/E74C3C/white?text=Bem-Estar',             'Bem-Estar & Qualidade de Vida','Conteúdo especializado para transformar sua vida','#', 2, true),
  ('https://placehold.co/1400x400/D4A017/333?text=Promocao+Especial',       'Promoção Especial',            'Até 60% de desconto em ebooks selecionados',    '#', 3, true);

-- Ebooks
DO $$
DECLARE
  c1 UUID; c2 UUID; c3 UUID; c4 UUID;
BEGIN
  SELECT id INTO c1 FROM categories WHERE slug = 'saude-mulher';
  SELECT id INTO c2 FROM categories WHERE slug = 'saude-homem';
  SELECT id INTO c3 FROM categories WHERE slug = 'bem-estar';
  SELECT id INTO c4 FROM categories WHERE slug = 'sexualidade';

  INSERT INTO ebooks (category_id, title, cover_url, old_price, new_price, short_description, checkout_url, active, sort_order) VALUES
    -- Saúde da Mulher
    (c1,'Guia Completo da Saúde Feminina','https://placehold.co/300x400/6C3483/white?text=Saude+Feminina',79.90,39.90,'Tudo sobre saúde hormonal e bem-estar feminino em todas as fases da vida.','#',true,1),
    (c1,'Menopausa sem Medo',             'https://placehold.co/300x400/8E44AD/white?text=Menopausa',    59.90,29.90,'Guia prático para atravessar a menopausa com saúde e qualidade de vida.',  '#',true,2),
    (c1,'Endometriose: Viva Bem',         'https://placehold.co/300x400/9B59B6/white?text=Endometriose', 69.90,34.90,'Estratégias naturais e médicas para controlar a endometriose.',             '#',true,3),
    (c1,'Ciclo Menstrual Consciente',     'https://placehold.co/300x400/A569BD/white?text=Ciclo',        49.90,24.90,'Entenda as fases do seu ciclo e viva com mais energia e equilíbrio.',       '#',true,4),
    -- Saúde do Homem
    (c2,'Saúde Masculina 360°',  'https://placehold.co/300x400/1A5276/white?text=Saude+Masculina',79.90,39.90,'Guia completo sobre saúde física, hormonal e mental para homens.','#',true,1),
    (c2,'Próstata Saudável',     'https://placehold.co/300x400/2471A3/white?text=Prostata',       59.90,29.90,'Prevenção e tratamento de problemas de próstata com linguagem clara.','#',true,2),
    (c2,'Hormônios Masculinos',  'https://placehold.co/300x400/2980B9/white?text=Hormonios',      69.90,34.90,'Como a testosterona afeta sua energia, humor, libido e saúde geral.','#',true,3),
    (c2,'Fitness após os 40',    'https://placehold.co/300x400/5DADE2/333?text=Fitness+40',       49.90,24.90,'Treino e nutrição desenvolvidos especialmente para homens acima dos 40 anos.','#',true,4),
    -- Bem Estar
    (c3,'Meditação para Iniciantes','https://placehold.co/300x400/1E8449/white?text=Meditacao',49.90,19.90,'Guia passo a passo para criar uma prática de meditação consistente.','#',true,1),
    (c3,'Sono Reparador',           'https://placehold.co/300x400/27AE60/white?text=Sono',     59.90,27.90,'Técnicas comprovadas para melhorar a qualidade do sono.','#',true,2),
    (c3,'Ansiedade sob Controle',   'https://placehold.co/300x400/2ECC71/333?text=Ansiedade', 69.90,34.90,'Ferramentas práticas para gerenciar a ansiedade no dia a dia.','#',true,3),
    (c3,'Yoga em Casa',             'https://placehold.co/300x400/52BE80/333?text=Yoga',      44.90,22.90,'Sequências de yoga para todos os níveis: flexibilidade e paz interior.','#',true,4),
    -- Sexualidade
    (c4,'Intimidade Plena',           'https://placehold.co/300x400/C0392B/white?text=Intimidade',79.90,39.90,'Guia sobre saúde sexual e conexão íntima para casais e indivíduos.','#',true,1),
    (c4,'Educação Sexual Adulta',     'https://placehold.co/300x400/E74C3C/white?text=Ed+Sexual', 59.90,29.90,'Informações científicas sobre sexualidade humana para adultos.','#',true,2),
    (c4,'Reconectando com o Desejo',  'https://placehold.co/300x400/EC7063/white?text=Desejo',   69.90,34.90,'Como reacender a libido após estresse ou mudanças hormonais.','#',true,3),
    (c4,'Relacionamentos Saudáveis',  'https://placehold.co/300x400/F1948A/333?text=Relacoes',   49.90,24.90,'Fundamentos para construir relacionamentos baseados em respeito.','#',true,4);
END $$;

-- Atualizar site_config
UPDATE site_config SET
  site_name    = 'Mastery Ebooks',
  footer_text  = '© 2026 Mastery Ebooks. Todos os direitos reservados.'
WHERE id = 1;

-- Verificar resultado
SELECT 'categories' AS tabela, COUNT(*) AS registros FROM categories
UNION ALL SELECT 'banners',    COUNT(*) FROM banners
UNION ALL SELECT 'ebooks',     COUNT(*) FROM ebooks
UNION ALL SELECT 'site_config',COUNT(*) FROM site_config;
