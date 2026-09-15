# 📚 Ebooks Store — Instalação

## Opção 1: Site Standalone (mais simples)
Abra o arquivo `index.html` diretamente no navegador ou hospede em qualquer servidor web.

## Opção 2: Tema WordPress
1. Compacte a pasta `theme-ebooks/` em `.zip`
2. No WordPress: Aparência → Temas → Adicionar Novo → Enviar Tema
3. Ative o tema

---

## 🗄️ Configurar o Banco de Dados (OBRIGATÓRIO)

1. Acesse: https://supabase.com/dashboard/project/mhajqbhykwejmkowhxdz
2. Vá em **SQL Editor** (menu lateral)
3. Clique em **New Query**
4. Cole o conteúdo do arquivo `supabase_setup.sql`
5. Clique em **Run** (▶)
6. Aguarde a mensagem de sucesso

### Resultado esperado:
```
tabela       | registros
-------------|----------
site_config  | 1
categories   | 6
banners      | 3
ebooks       | 20
```

---

## ⚙️ Personalizar

### Alterar Logo, Nome, Contato:
1. Supabase Dashboard → Table Editor → `site_config`
2. Edite a linha 1
3. Salve — o site atualiza automaticamente

### Adicionar Ebook:
1. Table Editor → `ebooks`
2. Clique em **Insert Row**
3. Preencha: title, cover_url, new_price, old_price, short_description, checkout_url
4. Selecione a category_id correspondente

### Adicionar Categoria:
1. Table Editor → `categories`
2. Insert Row com: slug, name, sort_order

### Trocar Banners:
1. Table Editor → `banners`
2. Edite image_url, title, subtitle, button_text, link_url

### Fazer upload de imagens:
1. Supabase Dashboard → Storage
2. Criar buckets: `ebook-covers`, `banners`, `logos`
3. Faça upload das imagens
4. Copie a URL pública e cole nos campos `cover_url`, `image_url`, `logo_url`

---

## 🛒 Configurar Checkout

No campo `checkout_url` de cada ebook, coloque a URL da sua plataforma de pagamento:
- **Hotmart:** `https://pay.hotmart.com/seu-produto`
- **Eduzz:** `https://eduzz.com/checkout/...`
- **Kiwify:** `https://kiwify.app/checkout/...`
- **Stripe:** `https://buy.stripe.com/...`

---

## 🎨 Personalizar Cores

Na tabela `site_config`, edite:
- `primary_color`: cor principal (menu, botões) — padrão: `#6C3483`
- `secondary_color`: cor de destaque — padrão: `#F1C40F`
- `accent_color`: cor de urgência (preço, badge) — padrão: `#E74C3C`

---

## 📞 Suporte
Qualquer dúvida, acesse o Supabase Dashboard e verifique os dados nas tabelas.
