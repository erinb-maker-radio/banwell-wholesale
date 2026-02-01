import { NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';
import { notifyInvoiceSent } from '@/lib/notifications';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const invoice = await pb.collection('invoices').getOne(id, { expand: 'order,customer' });
    return NextResponse.json({ success: true, data: invoice });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    const body = await request.json();
    const invoice = await pb.collection('invoices').getOne(id, { expand: 'order,customer' });

    // If marking as sent, send notification
    if (body.status === 'sent' && invoice.status !== 'sent') {
      body.sent_date = new Date().toISOString();

      const customer = invoice.expand?.customer;
      const order = invoice.expand?.order;
      if (customer && order) {
        notifyInvoiceSent({
          customerEmail: customer.email,
          contactName: customer.contact_name,
          invoiceNumber: invoice.invoice_number,
          amount: invoice.amount,
          dueDate: invoice.due_date,
          orderNumber: order.order_number,
        }).catch(console.error);
      }
    }

    // If marking as paid
    if (body.status === 'paid' && invoice.status !== 'paid') {
      body.paid_date = new Date().toISOString();
      body.paid_amount = invoice.amount;

      // Also update order status
      if (invoice.order) {
        await pb.collection('orders').update(invoice.order, { status: 'payment_received' });
      }
    }

    const updated = await pb.collection('invoices').update(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 400 });
  }
}
