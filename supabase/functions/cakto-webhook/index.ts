import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const CAKTO_SECRET = Deno.env.get('CAKTO_WEBHOOK_SECRET') ?? '';
const EMAIL_FROM = Deno.env.get('EMAIL_FROM') ?? 'Livraria Mastery <contato@mail.typebotmastery.com.br>';
const SUPPORT_EMAIL = Deno.env.get('SUPPORT_EMAIL') ?? 'contato@mail.typebotmastery.com.br';
const SITE_NAME = Deno.env.get('SITE_NAME') ?? 'Livraria Mastery';
const SITE_URL = (Deno.env.get('SITE_URL') ?? '').replace(/\/+$/, '');

const BRAND = '#6c3483';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const enc = new TextEncoder();

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function brl(v: unknown): string {
  const n = Number(v);
  if (!isFinite(n)) return '';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyRequest(rawBody: Uint8Array, req: Request, payload: any): Promise<boolean> {
  if (!CAKTO_SECRET) return true; // configuracao inicial: sem secret definido, aceita

  const ts = req.headers.get('X-Cakto-Timestamp');
  const sig = req.headers.get('X-Cakto-Signature');
  if (ts && sig) {
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - Number(ts)) > 300) return false;
    const prefix = enc.encode(ts + '.');
    const msg = new Uint8Array(prefix.length + rawBody.length);
    msg.set(prefix, 0);
    msg.set(rawBody, prefix.length);
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(CAKTO_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    );
    const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, msg));
    const hex = [...mac].map((b) => b.toString(16).padStart(2, '0')).join('');
    return safeEqual('v1=' + hex, sig);
  }

  return safeEqual(String(payload?.secret ?? ''), CAKTO_SECRET);
}

type Row = Record<string, unknown>;

function toRow(event: string, o: any): Row {
  const customer = o?.customer ?? {};
  const email = customer.email ?? o?.customerEmail ?? '';
  const dedup = event === 'checkout_abandonment'
    ? `checkout_abandonment:${String(email).toLowerCase()}:${o?.offer?.id ?? ''}:${o?.createdAt ?? ''}`
    : `${event}:${o?.id ?? ''}`;
  return {
    dedup_key: dedup,
    cakto_order_id: o?.id ?? null,
    event,
    status: o?.status ?? null,
    customer_name: customer.name ?? o?.customerName ?? null,
    customer_email: email || null,
    customer_phone: customer.phone ?? o?.customerCellphone ?? null,
    product_name: o?.product?.name ?? null,
    amount: o?.amount != null ? Number(o.amount) : null,
    payment_method: o?.paymentMethod ?? null,
    checkout_url: o?.checkoutUrl ?? null,
    raw: o,
  };
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY ausente' };
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, html }),
  });
  const data = await r.json().catch(() => ({}));
  return r.ok ? { ok: true, error: null } : { ok: false, error: (data as any)?.message ?? String(r.status) };
}

function layout(title: string, body: string): string {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#222">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="text-align:center;padding:8px 0 16px"><span style="font-size:20px;font-weight:bold;color:${BRAND}">${esc(SITE_NAME)}</span></div>
    <div style="background:#fff;border-radius:12px;padding:28px">
      <h1 style="margin:0 0 16px;font-size:20px;color:${BRAND}">${title}</h1>
      ${body}
    </div>
    <p style="text-align:center;color:#888;font-size:12px;margin-top:16px">${esc(SITE_NAME)} · ${esc(SUPPORT_EMAIL)}</p>
  </div></body></html>`;
}

function button(label: string, url: string): string {
  return `<p style="text-align:center;margin:24px 0"><a href="${esc(url)}" style="background:${BRAND};color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block">${esc(label)}</a></p>`;
}

function markEmail(ids: string[], sent: boolean, error: string | null) {
  if (!ids.length) return Promise.resolve();
  return supabase.from('cakto_orders').update({ email_sent: sent, email_error: error }).in('id', ids);
}

async function deliver(event: string, orders: any[], ids: string[]) {
  const first = orders[0] ?? {};
  const customer = first.customer ?? {};
  const to = customer.email ?? first.customerEmail;
  const name = customer.name ?? first.customerName ?? '';

  if (!to) return markEmail(ids, false, 'sem e-mail do cliente');
  if (String(to).toLowerCase().endsWith('@example.com')) return markEmail(ids, false, 'endereco de teste ignorado');

  const list = orders
    .map((o) => `<li>${esc(o?.product?.name ?? 'Produto')}${o?.amount != null ? ' — ' + brl(o.amount) : ''}</li>`)
    .join('');

  let subject = '';
  let body = '';
  const hello = `<p>Olá${name ? ', <strong>' + esc(name) + '</strong>' : ''}!</p>`;

  if (event === 'purchase_approved') {
    subject = `Compra aprovada — ${first?.product?.name ?? SITE_NAME}`;
    body = `${hello}
      <p>Recebemos o seu pagamento e o seu pedido foi aprovado. 🎉</p>
      ${orders.length > 1 ? `<ul>${list}</ul>` : `<p><strong>${esc(first?.product?.name ?? 'Seu produto')}</strong></p>`}
      ${first?.refId ? `<p style="color:#666;font-size:13px">Pedido: ${esc(first.refId)}</p>` : ''}
      ${SITE_URL ? button('Ver na loja', SITE_URL) : ''}
      <p style="color:#666;font-size:13px">Qualquer dúvida, basta responder este e-mail.</p>`;
  } else if (event === 'refund') {
    subject = `Reembolso confirmado — ${first?.product?.name ?? SITE_NAME}`;
    body = `${hello}
      <p>O reembolso do seu pedido foi confirmado.</p>
      ${orders.length > 1 ? `<ul>${list}</ul>` : `<p><strong>${esc(first?.product?.name ?? 'Seu produto')}</strong></p>`}
      ${first?.amount != null ? `<p style="color:#666;font-size:13px">Valor: ${brl(first.amount)}</p>` : ''}
      <p style="color:#666;font-size:13px">O prazo para o valor aparecer depende do seu banco ou operadora do cartão.</p>`;
  } else if (event === 'chargeback') {
    subject = `Contestação de pagamento — ${first?.product?.name ?? SITE_NAME}`;
    body = `${hello}
      <p>Registramos uma contestação (chargeback) referente ao seu pedido.</p>
      ${orders.length > 1 ? `<ul>${list}</ul>` : `<p><strong>${esc(first?.product?.name ?? 'Seu produto')}</strong></p>`}
      <p style="color:#666;font-size:13px">Se você não reconhece essa contestação, responda este e-mail.</p>`;
  } else if (event === 'checkout_abandonment') {
    const url = first?.checkoutUrl || SITE_URL;
    subject = `Você deixou algo no carrinho — ${first?.product?.name ?? SITE_NAME}`;
    body = `${hello}
      <p>Notamos que você começou a compra de <strong>${esc(first?.product?.name ?? 'um produto')}</strong> e não finalizou.</p>
      ${url ? button('Finalizar compra', url) : ''}
      <p style="color:#666;font-size:13px">Se precisar de ajuda, basta responder este e-mail.</p>`;
  } else {
    return markEmail(ids, false, 'evento sem template: ' + event);
  }

  const res = await sendEmail(String(to), subject, layout(subject, body));
  return markEmail(ids, res.ok, res.error);
}

async function insertAll(event: string, orders: any[]) {
  const inserted: { id: string; o: any }[] = [];
  for (const o of orders) {
    const { data, error } = await supabase.from('cakto_orders').insert(toRow(event, o)).select('id').single();
    if (error) {
      if ((error as any).code === '23505') continue;
      throw error;
    }
    inserted.push({ id: data.id, o });
  }
  return inserted;
}

async function processEvent(event: string, data: any) {
  if (!event) return { skipped: true, reason: 'sem event' };
  const orders = (Array.isArray(data) ? data : [data]).filter(Boolean);
  if (!orders.length) return { skipped: true, reason: 'sem data' };

  const inserted = await insertAll(event, orders);
  if (!inserted.length) return { duplicate: true };

  const handled = ['purchase_approved', 'refund', 'chargeback', 'checkout_abandonment'];
  if (handled.includes(event)) {
    await deliver(event, inserted.map((i) => i.o), inserted.map((i) => i.id));
    return { sent: true, count: inserted.length };
  }
  return { stored: true, count: inserted.length };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const raw = new Uint8Array(await req.arrayBuffer());
  let payload: any;
  try {
    payload = JSON.parse(new TextDecoder().decode(raw));
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  if (!(await verifyRequest(raw, req, payload))) return json({ error: 'unauthorized' }, 401);

  try {
    const result = await processEvent(String(payload?.event ?? ''), payload?.data);
    return json({ ok: true, ...result });
  } catch (e) {
    console.error('cakto-webhook error', e);
    return json({ ok: false, error: String((e as any)?.message ?? e) }, 500);
  }
});
