import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const EMAIL_FROM = Deno.env.get('EMAIL_FROM') ?? 'Livraria Mastery <contato@mail.typebotmastery.com.br>';
const SUPPORT_EMAIL = Deno.env.get('SUPPORT_EMAIL') ?? 'contato@mail.typebotmastery.com.br';
const SITE_NAME = Deno.env.get('SITE_NAME') ?? 'Livraria Mastery';
const SITE_URL = (Deno.env.get('SITE_URL') ?? '').replace(/\/+$/, '');

const BRAND = '#6c3483';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

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

async function log(row: Record<string, unknown>) {
  const { error } = await supabase.from('newsletter_emails').insert(row);
  if (error) console.error('falha ao registrar log newsletter_emails', error);
}

async function markWelcome(id: string) {
  await supabase.from('newsletters').update({ welcome_sent: true, welcome_sent_at: new Date().toISOString() }).eq('id', id);
}

async function welcomeFor(subscriber: { id: string; email: string }) {
  const to = subscriber.email;
  const subject = `Bem-vindo(a) à ${SITE_NAME} 💜`;
  const body = `
    <p>Olá!</p>
    <p>Que bom ter você com a gente. Seu cadastro foi confirmado com sucesso. 🎉</p>
    <p>A partir de agora você vai receber em primeira mão:</p>
    <ul>
      <li>Novidades e lançamentos</li>
      <li>Ofertas e promoções exclusivas</li>
      <li>Dicas de leitura</li>
    </ul>
    ${SITE_URL ? button('Explorar a loja', SITE_URL) : ''}
    <p style="color:#666;font-size:13px">Qualquer dúvida, basta responder este e-mail.</p>`;

  const res = await sendEmail(to, subject, layout(subject, body));
  await log({
    newsletter_id: subscriber.id,
    email: to,
    email_type: 'welcome',
    subject,
    status: res.ok ? 'sent' : 'error',
    error: res.error,
  });
  if (res.ok) await markWelcome(subscriber.id);
  return res;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  // Aceita o webhook do banco (record) ou uma chamada direta com id/email.
  const record = payload?.record ?? payload ?? {};
  const id: string | undefined = record.id;
  const email: string | undefined = record.email;

  try {
    let subscriber: { id: string; email: string; welcome_sent: boolean | null } | null = null;

    if (id) {
      const { data } = await supabase
        .from('newsletters')
        .select('id, email, welcome_sent')
        .eq('id', id)
        .maybeSingle();
      subscriber = data ?? null;
    } else if (email) {
      const { data } = await supabase
        .from('newsletters')
        .select('id, email, welcome_sent')
        .eq('email', email)
        .maybeSingle();
      subscriber = data ?? null;
    }

    if (!subscriber) return json({ ok: false, error: 'inscrito nao encontrado' }, 404);
    if (subscriber.welcome_sent) return json({ ok: true, skipped: true, reason: 'ja enviado' });

    if (String(subscriber.email).toLowerCase().endsWith('@example.com')) {
      await log({ newsletter_id: subscriber.id, email: subscriber.email, email_type: 'welcome', status: 'skipped', error: 'endereco de teste ignorado' });
      await markWelcome(subscriber.id);
      return json({ ok: true, skipped: true, reason: 'endereco de teste' });
    }

    const res = await welcomeFor(subscriber);
    if (!res.ok) return json({ ok: false, error: res.error }, 502);
    return json({ ok: true, sent: true });
  } catch (e) {
    console.error('newsletter-welcome error', e);
    return json({ ok: false, error: String((e as any)?.message ?? e) }, 500);
  }
});
