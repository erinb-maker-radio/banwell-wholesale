import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

export async function GET(request: Request) {
  try {
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '50');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    let filter = '';
    if (category) filter = `category="${category}"`;
    if (search) {
      const searchFilter = `(title~"${search}" || sku~"${search}")`;
      filter = filter ? `${filter} && ${searchFilter}` : searchFilter;
    }

    const result = await pb.collection('products').getList(page, perPage, {
      filter,
      sort: 'sort_order',
      expand: 'category',
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}
