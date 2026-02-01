import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

export async function GET() {
  try {
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Get counts
    const allOrders = await pb.collection('orders').getList(1, 1, { filter: 'status != "pending_payment"' });
    const monthOrders = await pb.collection('orders').getList(1, 1, { filter: `status != "pending_payment" && created >= "${monthStart}"` });
    const activeCustomers = await pb.collection('customers').getList(1, 1, { filter: 'status = "active"' });

    // Calculate revenue from paid orders
    const paidOrders = await pb.collection('orders').getFullList({
      filter: 'status != "pending_payment"',
      fields: 'total,created',
    });

    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const monthlyRevenue = paidOrders
      .filter(o => o.created >= monthStart)
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // Recent orders
    const recentOrders = await pb.collection('orders').getList(1, 10, {
      sort: '-created',
      expand: 'customer',
    });

    // Orders by status
    const statusCounts: Record<string, number> = {};
    const allOrdersFull = await pb.collection('orders').getFullList({ fields: 'status' });
    for (const o of allOrdersFull) {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        monthlyRevenue,
        totalOrders: allOrders.totalItems,
        monthlyOrders: monthOrders.totalItems,
        activeCustomers: activeCustomers.totalItems,
        averageOrderValue: allOrders.totalItems > 0 ? Math.round(totalRevenue / allOrders.totalItems) : 0,
        recentOrders: recentOrders.items,
        ordersByStatus: statusCounts,
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
