import { NextResponse } from 'next/server';
import { createServerPB } from '@/lib/pocketbase';

export async function GET(request: Request) {
  try {
    const pb = createServerPB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '48');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    let filter = 'is_active=true';
    if (category) filter += ` && category="${category}"`;
    if (search) filter += ` && (title~"${search}" || sku~"${search}")`;

    const result = await pb.collection('products').getList(page, perPage, {
      filter,
      sort: 'sort_order',
      expand: 'category',
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load catalog' }, { status: 500 });
  }
}
