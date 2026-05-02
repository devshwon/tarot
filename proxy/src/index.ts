/**
 * toss-tarot-gpt 프록시
 * - 클라이언트(Apps in Toss WebView)는 이 워커로만 요청을 보낸다.
 * - OpenAI API 키는 wrangler secret 에 보관되며, 응답에는 절대 포함되지 않는다.
 * - 단순 forward 외에 IP 분당 한도 + 일일 글로벌 한도로 도용 시 결제 폭탄을 막는다.
 */

export interface Env {
  OPENAI_API_KEY: string;
  ALLOWED_ORIGINS: string;
  DAILY_LIMIT: string;
  RATE_PER_MIN: string;
  RATE_LIMIT_KV: KVNamespace;
}

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get('Origin') ?? '';
    const corsOrigin = resolveAllowedOrigin(origin, env.ALLOWED_ORIGINS);

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(corsOrigin) });
    }

    if (req.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405, corsOrigin);
    }

    const url = new URL(req.url);
    if (url.pathname !== '/v1/chat/completions') {
      return json({ error: 'not_found' }, 404, corsOrigin);
    }

    const ip = req.headers.get('CF-Connecting-IP') ?? 'unknown';
    const ratePerMin = toInt(env.RATE_PER_MIN, 10);
    const dailyLimit = toInt(env.DAILY_LIMIT, 5000);

    const minuteKey = `rl:${ip}:${Math.floor(Date.now() / 60_000)}`;
    const minuteCount = toInt(await env.RATE_LIMIT_KV.get(minuteKey), 0);
    if (minuteCount >= ratePerMin) {
      return json({ error: 'rate_limited' }, 429, corsOrigin);
    }

    const dayKey = `day:${new Date().toISOString().slice(0, 10)}`;
    const dayCount = toInt(await env.RATE_LIMIT_KV.get(dayKey), 0);
    if (dayCount >= dailyLimit) {
      return json({ error: 'daily_limit' }, 429, corsOrigin);
    }

    await Promise.all([
      env.RATE_LIMIT_KV.put(minuteKey, String(minuteCount + 1), { expirationTtl: 90 }),
      env.RATE_LIMIT_KV.put(dayKey, String(dayCount + 1), { expirationTtl: 60 * 60 * 26 }),
    ]);

    const body = await req.text();

    const upstream = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body,
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json',
        ...corsHeaders(corsOrigin),
      },
    });
  },
};

function resolveAllowedOrigin(origin: string, allowed: string): string {
  if (!origin) return '';
  if (allowed.trim() === '*') return origin;
  const list = allowed.split(',').map((s) => s.trim()).filter(Boolean);
  return list.includes(origin) ? origin : '';
}

function corsHeaders(origin: string): Record<string, string> {
  if (!origin) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(payload: unknown, status: number, corsOrigin: string): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(corsOrigin),
    },
  });
}

function toInt(v: string | null | undefined, fallback: number): number {
  if (v == null) return fallback;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}
