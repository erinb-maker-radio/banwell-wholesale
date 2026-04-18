import { NextResponse } from 'next/server';

const BDA_PROXY_URL = process.env.BDA_PROXY_URL || 'https://pb.banwelldesigns.com/bda/run';
const BDA_PROXY_USER = process.env.BDA_PROXY_USER || 'erin';
const BDA_PROXY_PASSWORD = process.env.BDA_PROXY_PASSWORD || '';

export async function POST() {
  if (!BDA_PROXY_PASSWORD) {
    return NextResponse.json(
      { success: false, error: 'BDA_PROXY_PASSWORD not configured' },
      { status: 500 }
    );
  }

  try {
    const basicAuth = Buffer.from(`${BDA_PROXY_USER}:${BDA_PROXY_PASSWORD}`).toString('base64');
    const res = await fetch(`${BDA_PROXY_URL}/followUpCheck`, {
      method: 'GET',
      headers: { Authorization: `Basic ${basicAuth}` },
      signal: AbortSignal.timeout(240000),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { success: false, error: `BDA returned ${res.status}: ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const overdue = data?.result?.overdue ?? 0;
    const drafted = data?.result?.drafted ?? 0;
    return NextResponse.json({ success: true, overdue, drafted });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
