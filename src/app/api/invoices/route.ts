import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

export async function GET(request: Request) {
  try {
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '50');
    const status = searchParams.get('status') || '';

    let filter = '';
    if (status) filter = `status="${status}"`;

    const result = await pb.collection('invoices').getList(page, perPage, {
      filter,
      sort: '-created',
      expand: 'order,customer',
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load invoices' }, { status: 500 });
  }
}
