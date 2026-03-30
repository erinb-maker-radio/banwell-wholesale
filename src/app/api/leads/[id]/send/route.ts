import { NextRequest, NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';
import nodemailer from 'nodemailer';

const GMAIL_USER = 'erin@banwelldesigns.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'pdyt bxvd zbxi xyof';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pb = createServerPB();
    await authenticateAdmin(pb);

    // Fetch the lead
    const lead = await pb.collection('wholesale_leads').getOne(id);

    if (!lead.outreach_draft) {
      return NextResponse.json({ error: 'No outreach draft to send' }, { status: 400 });
    }

    if (!lead.contact_email) {
      return NextResponse.json({ error: 'No contact email for this lead' }, { status: 400 });
    }

    // Parse subject from draft if present (first line starting with "Subject:")
    let subject = `Banwell Designs - Wholesale Partnership`;
    let body = lead.outreach_draft as string;

    const subjectMatch = body.match(/^Subject:\s*(.+)$/m);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      body = body.replace(/^Subject:\s*.+\n?/m, '').trim();
    }

    // Send via Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Erin Banwell" <${GMAIL_USER}>`,
      replyTo: GMAIL_USER,
      to: lead.contact_name
        ? `"${lead.contact_name}" <${lead.contact_email}>`
        : lead.contact_email,
      subject,
      text: body,
    });

    // Update lead status and sent timestamp
    const now = new Date().toISOString();
    await pb.collection('wholesale_leads').update(id, {
      status: 'contacted',
      outreach_sent_at: now,
    });

    return NextResponse.json({
      success: true,
      message: `Email sent to ${lead.contact_email}`,
      sent_at: now,
    });
  } catch (err) {
    console.error('Send outreach error:', err);
    return NextResponse.json({ error: 'Failed to send outreach email' }, { status: 500 });
  }
}
