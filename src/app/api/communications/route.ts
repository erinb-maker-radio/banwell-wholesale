import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

export async function GET(request: Request) {
  try {
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '50');

    let filter = '';
    if (customerId) filter = `customer="${customerId}"`;

    const result = await pb.collection('communications').getList(page, perPage, {
      filter,
      sort: '-date',
      expand: 'customer',
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load communications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const body = await request.json();
    if (!body.customer || !body.type) {
      return NextResponse.json({ error: 'customer and type required' }, { status: 400 });
    }

    body.date = body.date || new Date().toISOString();
    const comm = await pb.collection('communications').create(body);

    return NextResponse.json({ success: true, data: comm });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create communication' }, { status: 400 });
  }
}
