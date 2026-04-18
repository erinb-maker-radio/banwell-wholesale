import { NextRequest, NextResponse } from 'next/server';

const BDA_PROXY_URL = process.env.BDA_PROXY_URL || 'https://pb.banwelldesigns.com/bda/run';
const BDA_PROXY_USER = process.env.BDA_PROXY_USER || 'erin';
const BDA_PROXY_PASSWORD = process.env.BDA_PROXY_PASSWORD || '';

function approvalsUrl(path: string): string {
  const origin = BDA_PROXY_URL.replace(/\/bda\/run\/?$/, '');
  return `${origin}${path}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!BDA_PROXY_PASSWORD) {
    return NextResponse.json(
      { success: false, error: 'BDA_PROXY_PASSWORD not configured' },
      { status: 500 }
    );
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

  try {
    const body = await req.text();
    const basicAuth = Buffer.from(`${BDA_PROXY_USER}:${BDA_PROXY_PASSWORD}`).toString('base64');
    const res = await fetch(approvalsUrl(`/approve/${encodeURIComponent(id)}`), {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: body || '{}',
      signal: AbortSignal.timeout(15000),
    });

    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Upstream ${res.status}: ${text.slice(0, 200)}` },
        { status: res.status === 404 ? 404 : 502 }
      );
    }

    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return NextResponse.json({ success: true, result: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
