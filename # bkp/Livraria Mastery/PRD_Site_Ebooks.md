# PRD — Site de Vendas de Ebooks
**Versão:** 1.0  
**Data:** Fevereiro 2026  
**Status:** Em aprovação

---

## 1. Visão Geral

Criar um site de vendas de ebooks com tema WordPress customizável, totalmente integrado ao Supabase como backend. Todas as informações institucionais, produtos e mídias são gerenciadas via banco de dados — qualquer alteração no Supabase reflete automaticamente no site.

---

## 2. Objetivos

- Permitir a venda de ebooks organizados por categorias temáticas (Saúde da Mulher, Saúde do Homem, Bem-Estar, Sexualidade, etc.)
- Centralizar o gerenciamento de conteúdo (logo, endereço, telefone, produtos, preços) no Supabase
- Oferecer uma experiência de compra fluida com checkout integrado
- Gerar um tema WordPress importável e editável

---

## 3. Escopo

### 3.1 Incluído
- Tema WordPress customizado (arquivos `.zip` importáveis)
- Integração com Supabase via REST API / JS SDK
- Menu de navegação dinâmico por categorias
- Banner rotativo global
- Página de categoria com grade de 4 colunas
- Card de ebook com preço, descrição dropdown e botão de checkout
- Painel de configurações via Supabase (logo, contato, categorias)

### 3.2 Excluído (fora do escopo desta versão)
- Plataforma de pagamento (integração será feita em fase futura — o botão aponta para URL externa de checkout)
- Área de membros / login do cliente
- Entrega automatizada de ebooks pós-compra
- Painel administrativo visual próprio (usa diretamente o Supabase Dashboard)

---

## 4. Banco de Dados — Supabase

**Project URL:** `https://mhajqbhykwejmkowhxdz.supabase.co`  
**Project ID:** `mhajqbhykwejmkowhxdz`  
**Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` *(usar variável de ambiente)*

### 4.1 Tabelas

#### `site_config`
Configurações globais do site.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | int (PK) | Sempre 1 (singleton) |
| logo_url | text | URL da imagem do logotipo |
| site_name | text | Nome do site |
| address | text | Endereço completo |
| phone | text | Telefone de contato |
| email | text | E-mail de contato |
| footer_text | text | Texto do rodapé |
| primary_color | text | Cor principal (#hex) |
| secondary_color | text | Cor secundária (#hex) |
| updated_at | timestamp | Última atualização |

---

#### `categories`
Categorias dos ebooks (itens do menu).

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid (PK) | Identificador único |
| slug | text | Slug da URL (ex: `saude-mulher`) |
| name | text | Nome exibido no menu |
| sort_order | int | Ordem de exibição no menu |
| active | boolean | Exibir no menu? |

---

#### `banners`
Slides do banner rotativo (aparece em todas as páginas).

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid (PK) | Identificador único |
| image_url | text | URL da imagem do banner |
| title | text | Título opcional sobreposto |
| subtitle | text | Subtítulo opcional |
| link_url | text | Link ao clicar no banner |
| sort_order | int | Ordem dos slides |
| active | boolean | Exibir este slide? |

---

#### `ebooks`
Catálogo de ebooks.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid (PK) | Identificador único |
| category_id | uuid (FK → categories) | Categoria do ebook |
| title | text | Título do ebook |
| cover_url | text | URL da imagem da capa |
| old_price | numeric(10,2) | Preço antigo (riscado) |
| new_price | numeric(10,2) | Preço atual |
| short_description | text | Mini descrição (exibida no hover) |
| checkout_url | text | URL do botão de compra/checkout |
| active | boolean | Exibir produto? |
| sort_order | int | Ordem na grade |
| created_at | timestamp | Data de criação |

---

#### `storage` (Supabase Storage Bucket)
- Bucket: `ebook-covers` — armazena as capas dos ebooks
- Bucket: `banners` — armazena as imagens dos banners
- Bucket: `logos` — armazena versões do logotipo
- Acesso público habilitado para leitura

---

## 5. Arquitetura do Tema WordPress

```
theme-ebooks/
├── style.css               # Header do tema WP
├── functions.php           # Enqueue scripts, supabase config
├── index.php               # Template principal
├── header.php              # Menu + Logo (carregados via Supabase)
├── footer.php              # Rodapé dinâmico
├── page-category.php       # Template de página de categoria
├── assets/
│   ├── css/
│   │   └── main.css        # Estilos globais
│   └── js/
│       ├── supabase.min.js # SDK Supabase
│       ├── app.js          # Lógica principal
│       ├── banner.js       # Slider do banner
│       └── config.js       # Chaves Supabase (variáveis)
└── screenshot.png          # Preview do tema no WP
```

---

## 6. Funcionalidades Detalhadas

### 6.1 Menu Superior
- Logo à esquerda carregada da `site_config.logo_url`
- Itens de menu gerados dinamicamente da tabela `categories` (filtro: `active = true`, ordenado por `sort_order`)
- Cada item leva à página `/categoria/[slug]`
- Menu responsivo (hamburguer em mobile)

### 6.2 Banner Rotativo
- Presente em **todas** as páginas, logo abaixo do menu
- Slides carregados da tabela `banners` (filtro: `active = true`)
- Auto-play com intervalo de 5 segundos
- Navegação por dots e setas
- Imagens com proporção 16:9 ou fullwidth
- Transição suave (fade ou slide)

### 6.3 Página de Categoria
- URL: `/categoria/[slug]`
- Grade de **4 colunas** (2 em tablet, 1 em mobile)
- Ebooks carregados por `category_id` correspondente ao slug
- Filtro: `active = true`, ordenado por `sort_order`

### 6.4 Card de Ebook
```
┌─────────────────────┐
│   [IMAGEM DA CAPA]  │
│                     │
│  Título do Ebook    │
│  ~~R$ 49,90~~       │  ← preço antigo riscado
│  R$ 29,90           │  ← preço novo em destaque
│                     │
│  [ℹ Saiba mais ▾]  │  ← dropdown ao hover
│  [  COMPRAR AGORA ] │  ← botão checkout
└─────────────────────┘
```

**Comportamento do dropdown:**
- Aparece ao passar o mouse sobre "Saiba mais" (hover)
- Exibe o campo `short_description` do ebook
- Animação suave (fade-in de 0,2s)
- Em mobile: toque abre/fecha o dropdown

**Botão de compra:**
- Redireciona para `ebooks.checkout_url`
- Abre em nova aba (`target="_blank"`)
- Cor configurável via `site_config.primary_color`

### 6.5 Rodapé
- Dados carregados de `site_config`: nome, endereço, telefone, e-mail, texto do rodapé
- Atualização automática ao mudar no Supabase

---

## 7. Fluxo de Dados

```
Supabase DB
    │
    ▼ (fetch na carga da página via JS SDK)
WordPress PHP (renderiza shell HTML)
    │
    ▼
JavaScript (preenche DOM com dados do Supabase)
    │
    ├── Menu → categories
    ├── Banner → banners
    ├── Cards → ebooks (filtrado por categoria)
    └── Header/Footer → site_config
```

**Estratégia de cache:** dados são buscados a cada carregamento de página. Para otimização futura, pode-se adicionar cache no localStorage com TTL de 5 minutos.

---

## 8. Segurança

- Anon Key do Supabase usada apenas para **leitura pública** (dados de produtos, config)
- Row Level Security (RLS) habilitado:
  - Tabelas: `SELECT` público permitido para `active = true`
  - `INSERT/UPDATE/DELETE` apenas via Service Role Key (nunca exposta no frontend)
- Buckets de Storage configurados como públicos apenas para leitura
- Chaves armazenadas como constantes no `config.js` (a serem movidas para variáveis de ambiente em produção)

---

## 9. Design e UX

### Paleta de Cores (padrão, editável via site_config)
| Variável | Valor padrão | Uso |
|---|---|---|
| `primary_color` | `#6C3483` | Botões, destaques |
| `secondary_color` | `#F1C40F` | Preço novo, badges |
| Fundo | `#FAFAFA` | Background geral |
| Texto | `#2C2C2C` | Corpo de texto |

### Tipografia
- Fonte principal: **Inter** ou **Poppins** (Google Fonts)
- Tamanhos responsivos via clamp()

### Responsividade
| Breakpoint | Colunas da grade |
|---|---|
| Desktop (>1024px) | 4 colunas |
| Tablet (768–1024px) | 2 colunas |
| Mobile (<768px) | 1 coluna |

---

## 10. Requisitos Técnicos

| Item | Especificação |
|---|---|
| WordPress | 6.0+ |
| PHP | 7.4+ |
| Supabase JS SDK | v2.x |
| Browsers suportados | Chrome, Firefox, Safari, Edge (últimas 2 versões) |
| Performance | LCP < 2,5s (imagens com lazy loading) |
| SEO | Meta tags dinâmicas por categoria |

---

## 11. Critérios de Aceite

- [ ] Logo carregada do Supabase aparece no menu em todas as páginas
- [ ] Ao alterar `logo_url` no Supabase, o logo muda no site sem deploys
- [ ] Banner rotativo aparece em todas as páginas com auto-play funcional
- [ ] Menu lista apenas categorias com `active = true`
- [ ] Grade de 4 colunas exibe apenas ebooks da categoria selecionada
- [ ] Card exibe preço antigo riscado e preço novo em destaque
- [ ] Dropdown de descrição abre ao hover (desktop) e toque (mobile)
- [ ] Botão "Comprar Agora" redireciona para `checkout_url` em nova aba
- [ ] Rodapé exibe dados atualizados do `site_config`
- [ ] Tema pode ser exportado como `.zip` e importado no WordPress
- [ ] Site responsivo nas 3 faixas de breakpoint

---

## 12. Entregáveis

1. **`theme-ebooks.zip`** — Tema WordPress pronto para importação
2. **Script SQL** — Criação das tabelas no Supabase com RLS configurado
3. **Documentação de uso** — Como adicionar ebooks, banners e categorias via Supabase Dashboard
4. **README.md** — Instruções de instalação do tema no WordPress

---

## 13. Fases de Entrega

| Fase | Entrega | Prazo sugerido |
|---|---|---|
| 1 | Estrutura do tema WP + conexão Supabase + menu dinâmico | Semana 1 |
| 2 | Banner rotativo + página de categoria + grade de cards | Semana 2 |
| 3 | Dropdown de descrição + checkout + responsividade | Semana 3 |
| 4 | Testes, ajustes, documentação final e exportação do tema | Semana 4 |

---

## 14. Dependências e Riscos

| Risco | Mitigação |
|---|---|
| Supabase fora do ar | Implementar fallback com dados em cache local (localStorage) |
| CORS no Supabase | Configurar domínio do WP nas allowed origins do Supabase |
| Imagens pesadas afetando performance | Lazy loading + recomendação de usar Supabase Storage com CDN |
| Checkout externo indisponível | Botão exibe mensagem de erro amigável |

---

*Documento preparado para desenvolvimento do site de vendas de ebooks com WordPress + Supabase.*
