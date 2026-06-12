'use client';

import { useEffect, useState } from 'react';

type Lead = {
  id: string;
  business_name: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  city?: string;
  state?: string;
  fit_score?: number;
  fit_reason?: string;
  product_fit?: string;
  status?: string;
  follow_up_count?: number;
  outreach_sent_at?: string;
  notes?: string;
  response_notes?: string;
};

type Outcome = 'interested' | 'not_interested' | 'voicemail' | 'bad_number';

function telHref(phone?: string) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits ? `tel:${digits}` : undefined;
}

function daysAgo(iso?: string) {
  if (!iso) return '';
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  return `${d}d ago`;
}

export default function CallListPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/outreach/call-list');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load');
      setLeads(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function logOutcome(lead: Lead, outcome: Outcome) {
    setBusy(lead.id);
    const today = new Date().toISOString().slice(0, 10);
    const stamp = (existing: string | undefined, line: string) =>
      `${existing ? existing + '\n' : ''}[${today}] ${line}`;

    let body: Record<string, unknown> = {};
    if (outcome === 'interested') {
      body = { status: 'replied', response_notes: stamp(lead.response_notes, 'Call: interested') };
    } else if (outcome === 'not_interested') {
      body = { status: 'declined', response_notes: stamp(lead.response_notes, 'Call: not interested') };
    } else if (outcome === 'voicemail') {
      const next = new Date(Date.now() + 3 * 86400000).toISOString();
      body = { notes: stamp(lead.notes, 'Call: no answer / left voicemail'), next_follow_up: next };
    } else if (outcome === 'bad_number') {
      body = { notes: stamp(lead.notes, 'Call: bad number — needs re-research'), contact_phone: '' };
    }

    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      // Voicemail keeps them in the queue (just snoozed); others leave the queue.
      if (outcome === 'voicemail') {
        await load();
      } else {
        setLeads((prev) => prev.filter((l) => l.id !== lead.id));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Call List</h1>
        <p className="text-gray-600 mt-1">
          Leads we emailed that haven&apos;t replied, with a phone number — sorted by fit.
          Call the best prospects, then log what happened.
        </p>
      </div>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-4">{error}</div>
      )}
      {!loading && !error && leads.length === 0 && (
        <p className="text-gray-500">No one to call right now — every emailed lead has replied or has no phone.</p>
      )}

      <div className="space-y-3">
        {leads.map((lead) => (
          <div key={lead.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-900">{lead.business_name}</h2>
                  {typeof lead.fit_score === 'number' && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      fit {lead.fit_score}
                    </span>
                  )}
                  {lead.product_fit && (
                    <span className="text-xs text-gray-500">{lead.product_fit}</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-0.5">
                  {[lead.contact_name, [lead.city, lead.state].filter(Boolean).join(', ')]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
                {lead.fit_reason && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{lead.fit_reason}</p>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  Emailed {daysAgo(lead.outreach_sent_at)}
                  {lead.follow_up_count ? ` · ${lead.follow_up_count} follow-up(s)` : ' · no follow-up yet'}
                  {lead.website ? (
                    <>
                      {' · '}
                      <a href={lead.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                        site ↗
                      </a>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="text-right">
                <a
                  href={telHref(lead.contact_phone)}
                  className="text-lg font-semibold text-indigo-700 hover:underline whitespace-nowrap"
                >
                  📞 {lead.contact_phone}
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              <button
                disabled={busy === lead.id}
                onClick={() => logOutcome(lead, 'interested')}
                className="text-sm px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                Interested
              </button>
              <button
                disabled={busy === lead.id}
                onClick={() => logOutcome(lead, 'voicemail')}
                className="text-sm px-3 py-1.5 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
              >
                No answer / VM
              </button>
              <button
                disabled={busy === lead.id}
                onClick={() => logOutcome(lead, 'not_interested')}
                className="text-sm px-3 py-1.5 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
              >
                Not interested
              </button>
              <button
                disabled={busy === lead.id}
                onClick={() => logOutcome(lead, 'bad_number')}
                className="text-sm px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
              >
                Bad number
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
