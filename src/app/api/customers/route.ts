import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

export async function GET(request: Request) {
  try {
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    let filter = '';
    if (search) {
      filter = `(business_name~"${search}" || contact_name~"${search}" || email~"${search}")`;
    }
    if (status) {
      filter = filter ? `${filter} && status="${status}"` : `status="${status}"`;
    }

    const result = await pb.collection('customers').getList(page, perPage, {
      filter,
      sort: '-created',
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const body = await request.json();
    const customer = await pb.collection('customers').create(body);

    return NextResponse.json({ success: true, data: customer });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 400 });
  }
}
