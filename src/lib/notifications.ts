import { exec } from 'child_process';
import { promisify } from 'util';
import sgMail from '@sendgrid/mail';

const execAsync = promisify(exec);

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const HOLLA_SCRIPT_PATH = process.env.HOLLA_SCRIPT_PATH || '/mnt/c/Users/erin/My Notification Android app/holla.py';

// ============================================
// HOLLA PUSH NOTIFICATIONS
// ============================================

interface HollaParams {
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  url?: string;
  urlLabel?: string;
}

export async function sendHollaAlert(params: HollaParams): Promise<boolean> {
  const { title, message, priority = 'normal', url, urlLabel = 'View' } = params;

  try {
    const escapedTitle = title.replace(/"/g, '\\"');
    const escapedDesc = message.replace(/"/g, '\\"').replace(/\n/g, '\\n');

    const scriptPrefix = HOLLA_SCRIPT_PATH.endsWith('.py') ? 'python3 ' : '';
    let command = `${scriptPrefix}"${HOLLA_SCRIPT_PATH}" "${escapedTitle}" "${escapedDesc}" --priority ${priority} --source "Banwell Wholesale"`;

    if (url) {
      command += ` --url "${url}" --label "${urlLabel}"`;
    }

    console.log('Sending Holla alert:', title);
    await execAsync(command);
    console.log('Holla alert sent');
    return true;
  } catch (error) {
    console.error('Holla alert failed:', error);
    return false;
  }
}

// ============================================
// EMAIL HELPERS
// ============================================

async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.log('SendGrid not configured, email not sent:', params.subject);
    return false;
  }

  try {
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'wholesale@banwelldesigns.com';
    await sgMail.send({
      to: params.to,
      from: { email: fromEmail, name: 'Banwell Designs' },
      subject: params.subject,
      text: params.text,
      html: params.html,
      ...(params.replyTo ? { replyTo: params.replyTo } : {}),
    });
    console.log('Email sent:', params.subject, '→', params.to);
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
}

// ============================================
// NEW CUSTOMER REGISTRATION
// ============================================

export async function notifyNewCustomer(customer: {
  business_name: string;
  contact_name: string;
  email: string;
}): Promise<void> {
  const adminEmail = process.env.ORDER_NOTIFICATION_EMAIL || 'maxey.tg@gmail.com';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Email to admin
  await sendEmail({
    to: adminEmail,
    subject: `New Wholesale Customer: ${customer.business_name}`,
    text: `New wholesale customer registered!\n\nBusiness: ${customer.business_name}\nContact: ${customer.contact_name}\nEmail: ${customer.email}\n\nLog in to the admin dashboard: ${baseUrl}`,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1e40af;">New Wholesale Customer</h2>
  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">${customer.business_name}</h3>
    <p><strong>Contact:</strong> ${customer.contact_name}</p>
    <p><strong>Email:</strong> <a href="mailto:${customer.email}">${customer.email}</a></p>
  </div>
  <p><a href="${baseUrl}" style="color: #1e40af;">View in Admin Dashboard</a></p>
  <p style="color: #9ca3af; font-size: 12px;">Banwell Designs Wholesale System</p>
</div>`,
  });

  // Holla push
  await sendHollaAlert({
    title: `New Customer: ${customer.business_name}`,
    message: `${customer.contact_name} (${customer.email}) just registered.`,
    priority: 'high',
    url: baseUrl,
    urlLabel: 'View Dashboard',
  });
}

// ============================================
// ORDER NOTIFICATIONS
// ============================================

export async function notifyOrderPlaced(order: {
  orderNumber: string;
  businessName: string;
  contactName: string;
  customerEmail: string;
  total: number; // cents
  itemCount: number;
  paymentMethod: string;
}): Promise<void> {
  const adminEmail = process.env.ORDER_NOTIFICATION_EMAIL || 'maxey.tg@gmail.com';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const totalFormatted = (order.total / 100).toFixed(2);

  // Email to admin
  await sendEmail({
    to: adminEmail,
    subject: `New Order ${order.orderNumber} from ${order.businessName}`,
    text: `New wholesale order!\n\nOrder: ${order.orderNumber}\nCustomer: ${order.businessName}\nItems: ${order.itemCount}\nTotal: $${totalFormatted}\nPayment: ${order.paymentMethod}\n\nView: ${baseUrl}`,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1e40af;">New Wholesale Order</h2>
  <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
    <p style="font-size: 24px; font-weight: bold; margin: 0;">${order.orderNumber}</p>
    <p style="color: #1e40af; margin: 5px 0;">$${totalFormatted}</p>
  </div>
  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
    <p><strong>Customer:</strong> ${order.businessName}</p>
    <p><strong>Contact:</strong> ${order.contactName}</p>
    <p><strong>Items:</strong> ${order.itemCount}</p>
    <p><strong>Payment:</strong> ${order.paymentMethod === 'square' ? 'Square (Pay Now)' : 'Invoice'}</p>
  </div>
  <p style="margin-top: 20px;"><a href="${baseUrl}" style="color: #1e40af;">View in Admin Dashboard</a></p>
  <p style="color: #9ca3af; font-size: 12px;">Banwell Designs Wholesale System</p>
</div>`,
  });

  // Email to customer
  await sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmation - ${order.orderNumber}`,
    text: `Hi ${order.contactName},\n\nThank you for your order! Your order ${order.orderNumber} has been received.\n\nItems: ${order.itemCount}\nTotal: $${totalFormatted}\n\nWe'll send you updates as your order is processed.\n\nThank you,\nBanwell Designs`,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1e40af;">Order Confirmed!</h1>
  <p>Hi ${order.contactName},</p>
  <p>Thank you for your order! We've received your wholesale order.</p>
  <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
    <p style="margin: 0; color: #666;">Order Number</p>
    <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${order.orderNumber}</p>
    <p style="font-size: 20px; color: #1e40af; margin: 5px 0;">$${totalFormatted}</p>
  </div>
  <p>We'll send you updates as your order moves through fulfillment.</p>
  <p>Thank you for choosing Banwell Designs!</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
  <p style="color: #9ca3af; font-size: 12px;">Banwell Designs</p>
</div>`,
  });

  // Holla push
  await sendHollaAlert({
    title: `Order ${order.orderNumber}`,
    message: `${order.businessName} - ${order.itemCount} items - $${totalFormatted}`,
    priority: 'high',
    url: baseUrl,
    urlLabel: 'View Order',
  });
}

// ============================================
// PAYMENT RECEIVED
// ============================================

export async function notifyPaymentReceived(params: {
  orderNumber: string;
  customerEmail: string;
  contactName: string;
  total: number; // cents
}): Promise<void> {
  const totalFormatted = (params.total / 100).toFixed(2);

  await sendEmail({
    to: params.customerEmail,
    subject: `Payment Received - Order ${params.orderNumber}`,
    text: `Hi ${params.contactName},\n\nWe've received your payment of $${totalFormatted} for order ${params.orderNumber}.\n\nWe're now preparing your order for shipment. You'll receive tracking information once it ships.\n\nThank you,\nBanwell Designs`,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1e40af;">Payment Received</h1>
  <p>Hi ${params.contactName},</p>
  <p>We've received your payment for order <strong>${params.orderNumber}</strong>.</p>
  <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
    <p style="font-size: 20px; margin: 0;">$${totalFormatted} received</p>
  </div>
  <p>We're now preparing your order for shipment. You'll receive tracking information once it ships.</p>
  <p>Thank you,<br><strong>Banwell Designs</strong></p>
</div>`,
  });
}

// ============================================
// ORDER SHIPPED
// ============================================

export async function notifyOrderShipped(params: {
  orderNumber: string;
  customerEmail: string;
  contactName: string;
  trackingNumber?: string;
}): Promise<void> {
  const trackingInfo = params.trackingNumber
    ? `Tracking Number: ${params.trackingNumber}`
    : 'Tracking information will be provided separately.';

  await sendEmail({
    to: params.customerEmail,
    subject: `Your Order Has Shipped - ${params.orderNumber}`,
    text: `Hi ${params.contactName},\n\nYour order ${params.orderNumber} has shipped!\n\n${trackingInfo}\n\nThank you,\nBanwell Designs`,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1e40af;">Your Order Has Shipped!</h1>
  <p>Hi ${params.contactName},</p>
  <p>Your order <strong>${params.orderNumber}</strong> is on its way!</p>
  ${params.trackingNumber ? `
  <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
    <p style="margin: 0; color: #666;">Tracking Number</p>
    <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">${params.trackingNumber}</p>
  </div>` : ''}
  <p>Thank you for choosing Banwell Designs!</p>
</div>`,
  });
}

// ============================================
// REORDER REMINDER (Follow-up)
// ============================================

export async function sendReorderReminder(params: {
  customerEmail: string;
  contactName: string;
  businessName: string;
  lastOrderNumber: string;
  catalogUrl: string;
}): Promise<void> {
  await sendEmail({
    to: params.customerEmail,
    subject: `Time to restock? - Banwell Designs`,
    text: `Hi ${params.contactName},\n\nIt's been about a month since your last order (${params.lastOrderNumber}). Ready to restock?\n\nBrowse our catalog: ${params.catalogUrl}\n\nThank you,\nBanwell Designs`,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1e40af;">Time to Restock?</h1>
  <p>Hi ${params.contactName},</p>
  <p>It's been about a month since your last order (<strong>${params.lastOrderNumber}</strong>). We wanted to check in and see if ${params.businessName} is ready to restock!</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${params.catalogUrl}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Browse Our Catalog</a>
  </div>
  <p>Thank you for being a valued wholesale partner!</p>
  <p><strong>Banwell Designs</strong></p>
</div>`,
  });

  await sendHollaAlert({
    title: `Reorder Reminder Sent`,
    message: `Sent to ${params.businessName} (${params.contactName})`,
    priority: 'normal',
  });
}

// ============================================
// INVOICE SENT
// ============================================

export async function notifyInvoiceSent(params: {
  customerEmail: string;
  contactName: string;
  invoiceNumber: string;
  amount: number; // cents
  dueDate: string;
  orderNumber: string;
}): Promise<void> {
  const amountFormatted = (params.amount / 100).toFixed(2);

  await sendEmail({
    to: params.customerEmail,
    subject: `Invoice ${params.invoiceNumber} - Banwell Designs`,
    text: `Hi ${params.contactName},\n\nInvoice ${params.invoiceNumber} for order ${params.orderNumber}\nAmount: $${amountFormatted}\nDue: ${params.dueDate}\n\nThank you,\nBanwell Designs`,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1e40af;">Invoice ${params.invoiceNumber}</h1>
  <p>Hi ${params.contactName},</p>
  <p>Here's your invoice for order <strong>${params.orderNumber}</strong>.</p>
  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <p><strong>Invoice:</strong> ${params.invoiceNumber}</p>
    <p><strong>Amount:</strong> $${amountFormatted}</p>
    <p><strong>Due Date:</strong> ${params.dueDate}</p>
  </div>
  <p>Please remit payment at your earliest convenience.</p>
  <p>Thank you,<br><strong>Banwell Designs</strong></p>
</div>`,
  });
}
