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
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';

    let filter = '';
    if (search) {
      filter = `(email~"${search}" || name~"${search}" || discount_code~"${search}")`;
    }
    if (type) {
      filter = filter ? `${filter} && type="${type}"` : `type="${type}"`;
    }
    if (status) {
      filter = filter ? `${filter} && status="${status}"` : `status="${status}"`;
    }

    const result = await pb.collection('subscribers').getList(page, perPage, {
      ...(filter ? { filter } : {}),
      sort: '-created',
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('Admin subscribers error:', err);
    return NextResponse.json({ error: 'Failed to load subscribers' }, { status: 500 });
  }
}
