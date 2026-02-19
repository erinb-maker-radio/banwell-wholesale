import sgMail from '@sendgrid/mail';
import { execFile } from 'child_process';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const HOLLA_URL = process.env.HOLLA_URL || '';
const HOLLA_TOKEN = process.env.HOLLA_TOKEN || '';
const HOLLA_SCRIPT_PATH = process.env.HOLLA_SCRIPT_PATH || '';

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

  // Method 1: Local Python script (holla.py)
  if (HOLLA_SCRIPT_PATH) {
    try {
      const args = [HOLLA_SCRIPT_PATH, title, message, '--priority', priority, '--source', 'Banwell Wholesale'];
      if (url) { args.push('--url', url); }
      if (urlLabel) { args.push('--label', urlLabel); }
      return await new Promise((resolve) => {
        execFile('python3', args, (error) => {
          if (error) {
            console.error('Holla script failed:', error.message);
            resolve(false);
          } else {
            console.log('Holla alert sent via script:', title);
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.error('Holla script failed:', error);
      return false;
    }
  }

  // Method 2: HTTP relay endpoint
  if (HOLLA_URL && HOLLA_TOKEN) {
    try {
      console.log('Sending Holla alert:', title);
      const res = await fetch(HOLLA_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HOLLA_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          message,
          priority,
          source: 'Banwell Wholesale',
          action_url: url,
          action_label: urlLabel,
        }),
      });

      const data = await res.json();
      if (data.success) {
        console.log('Holla alert sent');
        return true;
      } else {
        console.error('Holla alert failed:', data.result);
        return false;
      }
    } catch (error) {
      console.error('Holla alert failed:', error);
      return false;
    }
  }

  console.log('Holla not configured, skipping push notification:', title);
  return false;
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

// ============================================
// SUBSCRIBER WELCOME EMAIL
// ============================================

export async function sendWelcomeEmail(params: {
  email: string;
  name?: string;
  discountCode: string;
}): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const greeting = params.name ? `Hi ${params.name},` : 'Hi there,';
  const unsubUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(params.email)}`;

  await sendEmail({
    to: params.email,
    subject: 'Your 25% Off Discount Code - Banwell Designs',
    text: `${greeting}\n\nThank you for subscribing! Here's your exclusive 25% discount code:\n\n${params.discountCode}\n\nHow to use it:\n- On our website: Enter the code at checkout\n- On Etsy: Add a note to seller with your code when placing an order\n\nHappy shopping!\nBanwell Designs\n\nUnsubscribe: ${unsubUrl}`,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #A22020; text-align: center;">Welcome to Banwell Designs!</h1>
  <p>${greeting}</p>
  <p>Thank you for subscribing! Here&rsquo;s your exclusive <strong>25% discount</strong> on your first order:</p>
  <div style="background: #fef2f2; border: 2px dashed #A22020; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
    <p style="margin: 0; color: #666; font-size: 14px;">Your Discount Code</p>
    <p style="font-size: 32px; font-weight: bold; color: #A22020; margin: 8px 0; letter-spacing: 2px;">${params.discountCode}</p>
  </div>
  <h3 style="color: #333;">How to use your code:</h3>
  <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p style="margin: 4px 0;"><strong>On our website:</strong> Enter the code at checkout</p>
    <p style="margin: 4px 0;"><strong>On Etsy:</strong> Add a note to seller with your code when placing an order</p>
  </div>
  <h3 style="color: #333; text-align: center; margin-top: 32px;">Shop Our Collections</h3>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
    <tr>
      <td width="33%" align="center" style="padding: 4px;">
        <a href="${baseUrl}/glass" style="text-decoration: none;">
          <img src="${baseUrl}/images/brand/glass/glass-hero.jpg" alt="Art Glass" width="170" style="width: 170px; height: 170px; object-fit: cover; border-radius: 8px; display: block;" />
          <p style="margin: 8px 0 0; font-size: 13px; font-weight: 600; color: #333;">Art Glass</p>
        </a>
      </td>
      <td width="33%" align="center" style="padding: 4px;">
        <a href="${baseUrl}/paper" style="text-decoration: none;">
          <img src="${baseUrl}/images/brand/paper/paper-art-hero.jpg" alt="Paper Art" width="170" style="width: 170px; height: 170px; object-fit: cover; border-radius: 8px; display: block;" />
          <p style="margin: 8px 0 0; font-size: 13px; font-weight: 600; color: #333;">Paper Art</p>
        </a>
      </td>
      <td width="33%" align="center" style="padding: 4px;">
        <a href="${baseUrl}/leather" style="text-decoration: none;">
          <img src="${baseUrl}/images/brand/leather/plague-doctor-hero.jpg" alt="Leather" width="170" style="width: 170px; height: 170px; object-fit: cover; border-radius: 8px; display: block;" />
          <p style="margin: 8px 0 0; font-size: 13px; font-weight: 600; color: #333;">Leather</p>
        </a>
      </td>
    </tr>
  </table>
  <p style="text-align: center;">Happy shopping!</p>
  <p style="text-align: center;"><strong>Banwell Designs</strong></p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
  <p style="color: #9ca3af; font-size: 11px; text-align: center;">
    You received this email because you subscribed to Banwell Designs.
    <a href="${unsubUrl}" style="color: #9ca3af;">Unsubscribe</a>
  </p>
</div>`,
  });
}

// ============================================
// NEW SUBSCRIBER PUSH NOTIFICATION
// ============================================

export async function notifyNewSubscriber(params: {
  email: string;
  type: string;
  source: string;
}): Promise<void> {
  await sendHollaAlert({
    title: 'New Subscriber!',
    message: `${params.email} (${params.type}, via ${params.source.replace(/_/g, ' ')})`,
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
