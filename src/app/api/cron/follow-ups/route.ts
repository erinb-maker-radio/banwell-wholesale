import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';
import { sendReorderReminder } from '@/lib/notifications';

export async function GET() {
  try {
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const now = new Date().toISOString();

    // Find delivered orders where follow-up date has passed and not yet sent
    const orders = await pb.collection('orders').getFullList({
      filter: `status="delivered" && follow_up_date<="${now}" && follow_up_sent=false`,
      expand: 'customer',
    });

    let sent = 0;

    for (const order of orders) {
      const customer = order.expand?.customer;
      if (!customer) continue;

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

      try {
        await sendReorderReminder({
          customerEmail: customer.email,
          contactName: customer.contact_name,
          businessName: customer.business_name,
          lastOrderNumber: order.order_number,
          catalogUrl: `${baseUrl}/catalog`,
        });

        // Update order
        await pb.collection('orders').update(order.id, {
          follow_up_sent: true,
          status: 'follow_up',
        });

        // Log communication
        await pb.collection('communications').create({
          customer: order.customer,
          type: 'follow_up',
          subject: `Reorder reminder sent (${order.order_number})`,
          content: 'Automated 30-day reorder reminder sent.',
          date: now,
          logged_by: 'system',
        });

        sent++;
      } catch (err) {
        console.error(`Failed to send follow-up for order ${order.order_number}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${orders.length} orders, sent ${sent} reminders`,
    });
  } catch (err) {
    console.error('Follow-up cron error:', err);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
