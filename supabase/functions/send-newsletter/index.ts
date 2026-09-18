import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const EMAIL_FROM = Deno.env.get('EMAIL_FROM') ?? 'Livraria Mastery <contato@mail.typebotmastery.com.br>';
const SUPPORT_EMAIL = Deno.env.get('SUPPORT_EMAIL') ?? 'contato@mail.typebotmastery.com.br';
const SITE_NAME = Deno.env.get('SITE_NAME') ?? 'Livraria Mastery';
const SITE_URL = (Deno.env.get('SITE_URL') ?? '').replace(/\/+$/, '');
const ADMIN_TEST_EMAIL = (Deno.env.get('ADMIN_TEST_EMAIL') ?? '').toLowerCase();

const BRAND = '#6c3483';

// Limites do Resend (plano gratis ~100/dia). Deixe folga para os e-mails de compra/newsletter.
const BATCH_SIZE = 20;
const DAILY_LIMIT = 90;

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
      <h1 style="margin:0 0 16px;font-size:20px;color:${BRAND}">${esc(title)}</h1>
      ${body}
    </div>
    <p style="text-align:center;color:#888;font-size:12px;margin-top:16px">${esc(SITE_NAME)} · ${esc(SUPPORT_EMAIL)}</p>
  </div></body></html>`;
}

function render(body: string, email: string): string {
  return String(body ?? '').replace(/\{\{\s*email\s*\}\}/gi, esc(email));
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

async function sentToday(): Promise<number> {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const { count } = await supabase
    .from('newsletter_campaign_recipients')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent')
    .gte('sent_at', start.toISOString());
  return count ?? 0;
}

async function pendingCount(campaignId: string): Promise<number> {
  const { count } = await supabase
    .from('newsletter_campaign_recipients')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .eq('status', 'pending');
  return count ?? 0;
}

async function createRecipients(campaignId: string, mode: string, ids?: string[]): Promise<number> {
  const rows: { id: string; email: string }[] = [];

  if (mode === 'selected' && Array.isArray(ids) && ids.length) {
    const { data } = await supabase.from('newsletters').select('id,email').in('id', ids);
    rows.push(...(data ?? []));
  } else {
    const page = 1000;
    let from = 0;
    for (;;) {
      const { data } = await supabase.from('newsletters').select('id,email').range(from, from + page - 1);
      if (!data?.length) break;
      rows.push(...data);
      if (data.length < page) break;
      from += page;
    }
  }

  const seen = new Set<string>();
  const uniq = rows.filter((r) => {
    const e = String(r.email ?? '').toLowerCase();
    if (!e || seen.has(e)) return false;
    seen.add(e);
    return true;
  });

  const payload = uniq.map((r) => ({ campaign_id: campaignId, newsletter_id: r.id, email: r.email }));
  for (let i = 0; i < payload.length; i += 500) {
    const { error } = await supabase.from('newsletter_campaign_recipients').insert(payload.slice(i, i + 500));
    if (error) throw error;
  }
  return payload.length;
}

async function processCampaign(campaign: any) {
  const remainingToday = DAILY_LIMIT - (await sentToday());
  const pending = await pendingCount(campaign.id);

  if (!pending) {
    await supabase
      .from('newsletter_campaigns')
      .update({ status: 'sent', finished_at: campaign.finished_at ?? new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', campaign.id);
    return { campaign_id: campaign.id, sent: 0, failed: 0, remaining: 0, done: true };
  }

  if (remainingToday <= 0) {
    return { campaign_id: campaign.id, sent: 0, failed: 0, remaining: pending, throttled: true };
  }

  const { data: recips } = await supabase
    .from('newsletter_campaign_recipients')
    .select('id,email')
    .eq('campaign_id', campaign.id)
    .eq('status', 'pending')
    .limit(Math.min(BATCH_SIZE, remainingToday));

  if (!recips?.length) {
    return { campaign_id: campaign.id, sent: 0, failed: 0, remaining: pending, done: true };
  }

  const { data: tpl } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', campaign.template_id)
    .maybeSingle();

  if (!tpl) {
    await supabase.from('newsletter_campaigns').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', campaign.id);
    return { campaign_id: campaign.id, error: 'template nao encontrado' };
  }

  const subject = campaign.subject || tpl.subject;
  let sent = 0;
  let failed = 0;

  for (const r of recips) {
    if (String(r.email).toLowerCase().endsWith('@example.com')) {
      await supabase
        .from('newsletter_campaign_recipients')
        .update({ status: 'skipped', error: 'endereco de teste ignorado', sent_at: new Date().toISOString() })
        .eq('id', r.id);
      continue;
    }
    const res = await sendEmail(r.email, subject, layout(subject, render(tpl.body, r.email)));
    await supabase
      .from('newsletter_campaign_recipients')
      .update({ status: res.ok ? 'sent' : 'failed', error: res.error, sent_at: new Date().toISOString() })
      .eq('id', r.id);
    if (res.ok) sent++;
    else failed++;
  }

  const rem = await pendingCount(campaign.id);
  const { data: cur } = await supabase.from('newsletter_campaigns').select('sent,failed').eq('id', campaign.id).maybeSingle();

  await supabase
    .from('newsletter_campaigns')
    .update({
      sent: (cur?.sent ?? 0) + sent,
      failed: (cur?.failed ?? 0) + failed,
      updated_at: new Date().toISOString(),
      ...(rem ? {} : { status: 'sent', finished_at: new Date().toISOString() }),
    })
    .eq('id', campaign.id);

  return { campaign_id: campaign.id, sent, failed, remaining: rem, done: rem === 0 };
}

async function startCampaign(payload: any) {
  const { template_id, name, mode, ids, scheduled_for } = payload ?? {};
  const { data: tpl } = await supabase.from('email_templates').select('*').eq('id', template_id).maybeSingle();
  if (!tpl) return { error: 'template nao encontrado' };

  const when = scheduled_for ? new Date(scheduled_for) : null;
  const valid = when && !isNaN(when.getTime());
  const future = !!valid && when!.getTime() > Date.now() + 60000;

  const { data: camp, error } = await supabase
    .from('newsletter_campaigns')
    .insert({
      name: name || tpl.name,
      template_id,
      subject: tpl.subject,
      status: future ? 'scheduled' : 'sending',
      scheduled_for: valid ? when!.toISOString() : null,
      started_at: future ? null : new Date().toISOString(),
    })
    .select('id')
    .single();
  if (error) throw error;

  const total = await createRecipients(camp.id, mode || 'all', ids);
  await supabase.from('newsletter_campaigns').update({ total }).eq('id', camp.id);

  if (future) return { campaign_id: camp.id, scheduled: true, total, scheduled_for: when!.toISOString() };

  const { data: full } = await supabase.from('newsletter_campaigns').select('*').eq('id', camp.id).single();
  const progress = await processCampaign(full);
  return { campaign_id: camp.id, total, ...progress };
}

async function processDue(campaignId?: string) {
  if (campaignId) {
    const { data } = await supabase.from('newsletter_campaigns').select('*').eq('id', campaignId).maybeSingle();
    if (!data) return { error: 'campanha nao encontrada' };
    if (data.status === 'scheduled') {
      const nowIso = new Date().toISOString();
      if (data.scheduled_for && new Date(data.scheduled_for).getTime() <= Date.now()) {
        await supabase.from('newsletter_campaigns').update({ status: 'sending', started_at: nowIso }).eq('id', campaignId);
        data.status = 'sending';
      } else {
        return { campaign_id: campaignId, remaining: await pendingCount(campaignId), scheduled: true };
      }
    }
    return processCampaign(data);
  }

  const nowIso = new Date().toISOString();
  await supabase
    .from('newsletter_campaigns')
    .update({ status: 'sending', started_at: nowIso })
    .eq('status', 'scheduled')
    .lte('scheduled_for', nowIso);

  const { data: campaigns } = await supabase.from('newsletter_campaigns').select('*').eq('status', 'sending').limit(5);
  const results = [];
  for (const c of campaigns ?? []) results.push(await processCampaign(c));
  return { processed: results };
}

async function sendTest(template_id: string, to: string) {
  const email = String(to ?? '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'e-mail invalido' };

  const allowedDirect = ADMIN_TEST_EMAIL && email === ADMIN_TEST_EMAIL;
  if (!allowedDirect) {
    const { data } = await supabase.from('newsletters').select('id').eq('email', email).maybeSingle();
    if (!data) return { error: 'e-mail nao esta na lista de inscritos (use um endereco inscrito ou o e-mail de teste configurado)' };
  }

  const { data: tpl } = await supabase.from('email_templates').select('*').eq('id', template_id).maybeSingle();
  if (!tpl) return { error: 'template nao encontrado' };

  const subject = '[TESTE] ' + tpl.subject;
  const res = await sendEmail(email, subject, layout(tpl.subject, render(tpl.body, email)));
  await log({ email, email_type: 'campaign_test', subject, status: res.ok ? 'sent' : 'error', error: res.error });
  return res;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }

  const action = String(payload?.action ?? 'auto');

  try {
    if (action === 'test') {
      const res = await sendTest(payload?.template_id, payload?.to);
      return json({ ok: !(res as any)?.error, action, ...res }, (res as any)?.error ? 400 : 200);
    }
    if (action === 'start') {
      const res = await startCampaign(payload);
      return json({ ok: !(res as any)?.error, action, ...res }, (res as any)?.error ? 400 : 200);
    }
    if (action === 'process') {
      const res = await processDue(payload?.campaign_id);
      return json({ ok: true, action, ...res });
    }
    const res = await processDue();
    return json({ ok: true, action: 'auto', ...res });
  } catch (e) {
    console.error('send-newsletter error', e);
    return json({ ok: false, error: String((e as any)?.message ?? e) }, 500);
  }
});
