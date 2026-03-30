import { NextRequest, NextResponse } from 'next/server';
import { createServerPB, authenticateAdmin } from '@/lib/pocketbase';

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
      // Remove the Subject: line from body
      body = body.replace(/^Subject:\s*.+\n?/m, '').trim();
    }

    // Send via SendGrid
    const sgApiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'erin@banwelldesigns.com';

    if (!sgApiKey) {
      return NextResponse.json({ error: 'SendGrid API key not configured' }, { status: 500 });
    }

    // Convert plain text to minimal HTML — looks like a personal email but links work properly
    // Replace the raw URL with a call-to-action link
    const plainBody = body;
    const htmlBody = body
      .replace(/https:\/\/www\.banwelldesigns\.com/g, '<a href="https://www.banwelldesigns.com" style="color:#2563eb;">Explore our collection at banwelldesigns.com</a>')
      .split('\n\n')
      .map((para: string) => `<p style="margin:0 0 16px 0;line-height:1.5;">${para.replace(/\n/g, '<br>')}</p>`)
      .join('');

    // Also clean the plain text version — keep the URL but on its own line
    const cleanPlain = plainBody.replace(
      /https:\/\/www\.banwelldesigns\.com/g,
      'banwelldesigns.com'
    );

    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sgApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: lead.contact_email, name: lead.contact_name || lead.business_name }],
        }],
        from: { email: fromEmail, name: 'Erin Banwell' },
        reply_to: { email: 'erin@banwelldesigns.com', name: 'Erin Banwell' },
        subject,
        content: [
          { type: 'text/plain', value: cleanPlain },
          { type: 'text/html', value: `<div style="font-family:sans-serif;font-size:14px;color:#222;">${htmlBody}</div>` },
        ],
      }),
    });

    if (!sgResponse.ok) {
      const errText = await sgResponse.text();
      console.error('SendGrid error:', sgResponse.status, errText);
      return NextResponse.json({ error: `SendGrid error: ${sgResponse.status}` }, { status: 500 });
    }

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
