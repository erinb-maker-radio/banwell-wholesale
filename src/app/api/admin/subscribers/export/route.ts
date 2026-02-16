import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

export async function GET() {
  try {
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const result = await pb.collection('subscribers').getFullList({
      sort: '-created',
    });

    // Build CSV
    const headers = ['Email', 'Name', 'Type', 'Source', 'Discount Code', 'Used', 'Status', 'Opted In', 'Created'];
    const rows = result.map((s) => [
      s.email,
      s.name || '',
      s.type,
      s.source,
      s.discount_code,
      s.discount_used ? 'Yes' : 'No',
      s.status,
      s.opted_in_at || '',
      s.created,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell: string) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Failed to export subscribers' }, { status: 500 });
  }
}
