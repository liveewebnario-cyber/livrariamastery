# Prompt para criação do site/app "Livraria Mastery"

Copie e cole o texto abaixo em uma ferramenta de desenvolvimento (Claude Code, v0, Lovable, Bolt, Cursor, etc.) para gerar o projeto.

---

## PROMPT

Crie um site de vendas de ebooks chamado **"Livraria Mastery"**, com identidade visual moderna, elegante e responsiva (mobile-first). Use como referência de layout a estrutura de um catálogo de produtos com banner rotativo, categorias e cards de produto — mas com o nome, cores e logo da Livraria Mastery.

### 1. Identidade visual
- Nome: **Livraria Mastery**
- Logo: nome em destaque no cabeçalho, tipografia forte (bold), com um símbolo simples de livro/página ao lado (pode ser um ícone SVG minimalista). Paleta principal em tom de roxo/violeta (ex: `#7C3AED` a `#5B21B6`) com detalhes em dourado/amarelo para botões de destaque (ex: `#FACC15`), seguindo o mesmo espírito visual da referência enviada, mas com o novo nome e logo.
- Fonte: sans-serif moderna (ex: Inter, Poppins).
- Tema claro no conteúdo principal, rodapé em tom escuro (navy/preto azulado).

### 2. Estrutura do site (loja pública)
**Cabeçalho (header):**
- Logo "Livraria Mastery" à esquerda.
- Menu de navegação por categorias (ex: Saúde da Mulher, Saúde do Homem, Bem Estar, Desenvolvimento Pessoal, Negócios — categorias devem ser configuráveis no admin).

**Banner/Hero (carrossel):**
- Banner rotativo com imagem de fundo, título, subtítulo e botão "Ver mais".
- Indicadores de slide (bolinhas) e setas de navegação.
- Conteúdo do banner deve ser editável via painel admin (imagem, título, texto, link do botão).

**Seções de categoria:**
- Título da categoria + linha decorativa.
- Texto curto descritivo da categoria.
- Grid de cards de produto (responsivo: 4 colunas no desktop, 2 no tablet, 1 no mobile).

**Card de produto:**
- Imagem de capa do ebook (upload feito no admin).
- Título do ebook.
- Preço: preço original riscado + preço com desconto em destaque + badge de "-X%" quando houver promoção.
- Botão/link "Saiba mais" (ícone de relógio ou "i") que **abre um popup/modal** ao ser clicado na imagem ou no próprio link, mostrando:
  - Imagem maior do ebook.
  - Título completo.
  - Descrição detalhada (texto rico, pode conter parágrafos e bullet points).
  - Preço e desconto.
  - Botão "Comprar Agora" dentro do próprio popup.
- Botão "Comprar Agora" (com ícone de carrinho) — **redireciona para o link de pagamento do Mercado Pago** cadastrado para aquele produto no admin (abrir em nova aba).

**Rodapé (footer):**
- Fundo escuro.
- Coluna 1: nome da loja, descrição curta, endereço, telefone, e-mail.
- Coluna 2: links de categorias.
- Coluna 3: links institucionais (Sobre Nós, Política de Privacidade, Termos de Uso, Contato).
- Linha final com copyright e ano dinâmico.

### 3. Painel de Administração (área logada, `/admin`)
Precisa de autenticação simples (login/senha ou e-mail/senha) para acessar.

**Dashboard inicial:**
- Resumo: total de produtos, vendas do mês (se integrado), produtos mais vendidos (placeholder se não houver integração ainda).

**Gestão de Produtos:**
- Listagem de todos os ebooks (tabela com imagem miniatura, título, categoria, preço, status ativo/inativo).
- Botão "Novo Produto" com formulário contendo:
  - Upload de imagem de capa (com preview).
  - Título.
  - Categoria (select, vinculado às categorias cadastradas).
  - Descrição curta (para o card).
  - Descrição completa (para o popup, texto rico).
  - Preço original.
  - Preço com desconto (opcional) — calcular e exibir % automaticamente.
  - **Link de pagamento do Mercado Pago** (campo de URL) — para onde o botão "Comprar Agora" desse produto vai redirecionar.
  - Status (ativo/inativo, rascunho).
  - Botões Salvar/Cancelar/Excluir.

**Gestão de Categorias:**
- CRUD simples: nome, slug, ordem de exibição, descrição curta exibida na página da categoria.

**Gestão do Banner/Hero:**
- CRUD dos slides do carrossel (imagem, título, subtítulo, texto do botão, link do botão).

**Configurações de Pagamento / Webhook:**
- Campo para **Access Token do Mercado Pago** (armazenado com segurança, nunca exibido em texto puro após salvo).
- Campo mostrando a **URL de Webhook** que deve ser cadastrada no painel do Mercado Pago (gerada automaticamente pelo sistema, ex: `https://seudominio.com/api/webhooks/mercadopago`).
- Log/histórico de notificações recebidas do webhook (status: aprovado, pendente, recusado), com data, e-mail do comprador (se disponível) e produto associado — apenas para registro, pois a **entrega do download será feita em outro sistema** (não implementar entrega de arquivo aqui, apenas registrar a venda/pagamento).
- Botão para testar/validar a conexão com o Mercado Pago.

**Usuários administradores (opcional/futuro):**
- Tela simples para gerenciar quem tem acesso ao admin.

### 4. Requisitos técnicos
- Aplicação web responsiva, podendo ser construída como site (Next.js/React) ou app.
- Upload de imagens: armazenar em serviço de storage (ex: S3, Cloudinary, ou storage local dependendo da stack escolhida).
- Endpoint de webhook (`/api/webhooks/mercadopago`) que recebe as notificações do Mercado Pago (IPN/Webhooks v2), valida a assinatura e atualiza o status do pedido no banco de dados.
- Banco de dados com as tabelas: `produtos`, `categorias`, `banners`, `pedidos/pagamentos`, `configuracoes`.
- Não é necessário implementar o sistema de entrega/download do ebook nesta etapa — apenas deixar um campo preparado (ex: "link de entrega") para preenchimento futuro.

### 5. Tom e estilo do conteúdo
- Copy em português do Brasil, direto e persuasivo, adequado para venda de ebooks de saúde, bem-estar e desenvolvimento pessoal.
- Botões de call-to-action sempre em destaque (cor amarela/dourada sobre fundo roxo, ou roxo sobre fundo claro).

---

Se quiser, posso adaptar esse prompt para uma stack específica (Next.js + Supabase, WordPress/WooCommerce, ou outra) — é só me dizer qual tecnologia pretende usar.
