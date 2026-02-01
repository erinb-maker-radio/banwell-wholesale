import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

export async function GET() {
  try {
    const pb = createServerPB();
    await authenticateAdmin(pb);

    // All completed orders (not pending_payment)
    const orders = await pb.collection('orders').getFullList({
      filter: 'status != "pending_payment"',
      expand: 'customer',
      sort: '-created',
    });

    // Revenue by month
    const revenueByMonth: Record<string, number> = {};
    for (const order of orders) {
      const month = order.created.slice(0, 7); // YYYY-MM
      revenueByMonth[month] = (revenueByMonth[month] || 0) + (order.total || 0);
    }

    // Top customers by spend
    const customerSpend: Record<string, { name: string; total: number; orders: number }> = {};
    for (const order of orders) {
      const cust = order.expand?.customer;
      const custId = order.customer;
      if (!customerSpend[custId]) {
        customerSpend[custId] = {
          name: cust?.business_name || 'Unknown',
          total: 0,
          orders: 0,
        };
      }
      customerSpend[custId].total += order.total || 0;
      customerSpend[custId].orders++;
    }

    const topCustomers = Object.entries(customerSpend)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Popular products
    const allItems = await pb.collection('order_items').getFullList({ expand: 'product' });
    const productSales: Record<string, { name: string; sku: string; quantity: number; revenue: number }> = {};
    for (const item of allItems) {
      const prod = item.expand?.product;
      const pid = item.product;
      if (!productSales[pid]) {
        productSales[pid] = {
          name: prod?.short_title || prod?.title || 'Unknown',
          sku: prod?.sku || '',
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[pid].quantity += item.quantity || 0;
      productSales[pid].revenue += item.line_total || 0;
    }

    const popularProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 20);

    // Discount tier distribution
    const tierCounts: Record<string, number> = {};
    for (const order of orders) {
      const key = order.discount_percent ? `${order.discount_percent}%` : 'None';
      tierCounts[key] = (tierCounts[key] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        revenueByMonth,
        topCustomers,
        popularProducts,
        tierDistribution: tierCounts,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((s, o) => s + (o.total || 0), 0),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 });
  }
}
