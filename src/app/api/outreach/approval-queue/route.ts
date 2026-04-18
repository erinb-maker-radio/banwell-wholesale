import { NextResponse } from 'next/server';

const BDA_PROXY_URL = process.env.BDA_PROXY_URL || 'https://pb.banwelldesigns.com/bda/run';
const BDA_PROXY_USER = process.env.BDA_PROXY_USER || 'erin';
const BDA_PROXY_PASSWORD = process.env.BDA_PROXY_PASSWORD || '';

// Derive the approvals base URL from BDA_PROXY_URL (strip "/bda/run" → "")
function approvalsUrl(path: string): string {
  const origin = BDA_PROXY_URL.replace(/\/bda\/run\/?$/, '');
  return `${origin}${path}`;
}

export async function GET() {
  if (!BDA_PROXY_PASSWORD) {
    return NextResponse.json(
      { success: false, error: 'BDA_PROXY_PASSWORD not configured' },
      { status: 500 }
    );
  }

  try {
    const basicAuth = Buffer.from(`${BDA_PROXY_USER}:${BDA_PROXY_PASSWORD}`).toString('base64');
    const res = await fetch(approvalsUrl('/approvals'), {
      method: 'GET',
      headers: { Authorization: `Basic ${basicAuth}` },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { success: false, error: `Upstream ${res.status}: ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const pending = Array.isArray(data?.pending) ? data.pending : [];
    const wholesaleOutreach = pending.filter((i: { type?: string }) => i.type === 'wholesale_outreach');
    return NextResponse.json({ success: true, items: wholesaleOutreach });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
