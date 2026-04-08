import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

export async function GET(request: Request) {
  try {
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '48');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    let filter = 'is_active=true';
    if (category) {
      // Support both category ID and slug
      if (category.match(/^[a-z0-9]{15}$/)) {
        filter += ` && category="${category}"`;
      } else {
        // Look up by slug
        try {
          const cat = await pb.collection('product_categories').getFirstListItem(`slug="${category}"`);
          filter += ` && category="${cat.id}"`;
        } catch {
          // slug not found, return empty
          return NextResponse.json({ success: true, items: [], totalPages: 0, totalItems: 0 });
        }
      }
    }
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
