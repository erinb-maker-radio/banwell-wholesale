'use client';

import { useState, useEffect, useMemo } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface WholesaleLead {
  id: string;
  business_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_instagram: string;
  website: string;
  city: string;
  state: string;
  shop_type: string;
  product_fit: string[];
  fit_score: number;
  fit_reason: string;
  status: string;
  outreach_channel: string;
  outreach_draft: string;
  outreach_sent_at: string;
  last_follow_up: string;
  next_follow_up: string;
  follow_up_count: number;
  response_notes: string;
  source: string;
  notes: string;
  created: string;
  updated: string;
}

const STATUS_LABELS: Record<string, string> = {
  researched: 'Researched',
  verified: 'Verified',
  qualified: 'Qualified',
  outreach_drafted: 'Draft Ready',
  outreach_approved: 'Approved',
  contacted: 'Contacted',
  replied: 'Replied',
  application_required: 'Application Required',
  samples_requested: 'Samples Requested',
  samples_sent: 'Samples Sent',
  follow_up_1: 'Follow-up 1',
  follow_up_2: 'Follow-up 2',
  follow_up_3: 'Follow-up 3',
  converted: 'Converted',
  declined: 'Declined',
  dead: 'Dead',
};

const STATUS_COLORS: Record<string, string> = {
  researched: 'bg-gray-100 text-gray-700',
  verified: 'bg-blue-100 text-blue-700',
  qualified: 'bg-indigo-100 text-indigo-700',
  outreach_drafted: 'bg-yellow-100 text-yellow-700',
  outreach_approved: 'bg-orange-100 text-orange-700',
  contacted: 'bg-purple-100 text-purple-700',
  replied: 'bg-green-100 text-green-700',
  application_required: 'bg-blue-100 text-blue-700',
  samples_requested: 'bg-amber-100 text-amber-700',
  samples_sent: 'bg-teal-100 text-teal-700',
  follow_up_1: 'bg-purple-50 text-purple-600',
  follow_up_2: 'bg-purple-50 text-purple-600',
  follow_up_3: 'bg-purple-50 text-purple-600',
  converted: 'bg-green-200 text-green-800',
  declined: 'bg-red-100 text-red-700',
  dead: 'bg-gray-200 text-gray-500',
};

const PIPELINE_STAGES = ['researched', 'qualified', 'outreach_drafted', 'outreach_approved', 'contacted', 'replied', 'samples_requested', 'samples_sent', 'converted'];

export default function OutreachPage() {
  const [leads, setLeads] = useState<WholesaleLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [shopTypeFilter, setShopTypeFilter] = useState('all');
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Expanded row editing state
  const [editingDraft, setEditingDraft] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [editingResponseNotes, setEditingResponseNotes] = useState<string | null>(null);
  const [responseNotesValue, setResponseNotesValue] = useState('');
  const [actionFeedback, setActionFeedback] = useState<{ id: string; message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  // Clear action feedback after 4 seconds
  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  async function fetchLeads() {
    setLoading(true);
    const res = await fetch('/api/leads');
    const json = await res.json();
    if (json.success) setLeads(json.data);
    setLoading(false);
  }

  async function updateLead(id: string, updates: Partial<WholesaleLead>) {
    const res = await fetch('/api/leads/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (json.success) {
      // Update local state immediately for responsiveness
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    }
    return json;
  }

  async function handleApprove(lead: WholesaleLead) {
    if (!lead.contact_email) {
      setActionFeedback({ id: lead.id, message: 'No contact email set for this lead', type: 'error' });
      return;
    }
    await updateLead(lead.id, { status: 'outreach_approved' });
    setActionFeedback({ id: lead.id, message: `Approved — will send next business morning`, type: 'success' });
    fetchLeads();
  }

  async function handleApproveAll() {
    const draftedWithEmail = leads.filter(l => l.status === 'outreach_drafted' && l.contact_email && l.outreach_draft);
    if (draftedWithEmail.length === 0) return;
    if (!confirm(`Approve all ${draftedWithEmail.length} drafts? They'll be sent next business morning.`)) return;
    for (const lead of draftedWithEmail) {
      await updateLead(lead.id, { status: 'outreach_approved' });
    }
    setActionFeedback({ id: 'all', message: `${draftedWithEmail.length} drafts approved — will send next business morning`, type: 'success' });
    fetchLeads();
  }

  async function handleRejectDraft(lead: WholesaleLead) {
    if (!confirm(`Mark "${lead.business_name}" as dead?`)) return;
    await updateLead(lead.id, { status: 'dead' });
    setActionFeedback({ id: lead.id, message: 'Lead marked as dead', type: 'success' });
    fetchLeads();
  }

  async function handleRequestNewDraft(lead: WholesaleLead) {
    await updateLead(lead.id, { status: 'qualified', outreach_draft: '' });
    setActionFeedback({ id: lead.id, message: 'Sent back for re-drafting', type: 'success' });
    fetchLeads();
  }

  async function handleSaveDraft(lead: WholesaleLead) {
    await updateLead(lead.id, { outreach_draft: draftValue });
    setEditingDraft(null);
    setActionFeedback({ id: lead.id, message: 'Draft saved', type: 'success' });
  }

  async function handleSaveNotes(lead: WholesaleLead) {
    await updateLead(lead.id, { notes: notesValue });
    setEditingNotes(null);
    setActionFeedback({ id: lead.id, message: 'Notes saved', type: 'success' });
  }

  async function handleSaveResponseNotes(lead: WholesaleLead) {
    await updateLead(lead.id, { response_notes: responseNotesValue });
    setEditingResponseNotes(null);
    setActionFeedback({ id: lead.id, message: 'Response notes saved', type: 'success' });
  }

  async function handleMarkReplied(lead: WholesaleLead) {
    await updateLead(lead.id, { status: 'replied' });
    setActionFeedback({ id: lead.id, message: 'Marked as replied', type: 'success' });
    fetchLeads();
  }

  async function handleApplicationRequired(lead: WholesaleLead) {
    const notes = prompt('Paste the application/vendor form URL or details:');
    if (notes === null) return;
    const existingNotes = lead.response_notes ? lead.response_notes + '\n\n' : '';
    await updateLead(lead.id, {
      status: 'application_required',
      response_notes: existingNotes + `[Application required ${new Date().toLocaleDateString()}] ${notes}`,
    });
    setActionFeedback({ id: lead.id, message: 'Application required — complete their vendor form', type: 'success' });
    fetchLeads();
  }

  async function handleSamplesRequested(lead: WholesaleLead) {
    const notes = prompt('What did they request? (e.g. "science-themed pieces, smaller price points")');
    if (notes === null) return; // cancelled
    const existingNotes = lead.response_notes ? lead.response_notes + '\n\n' : '';
    await updateLead(lead.id, {
      status: 'samples_requested',
      response_notes: existingNotes + `[Samples requested ${new Date().toLocaleDateString()}] ${notes}`,
    });
    setActionFeedback({ id: lead.id, message: 'Samples requested — design + ship when ready', type: 'success' });
    fetchLeads();
  }

  async function handleSamplesSent(lead: WholesaleLead) {
    const nextFollowUp = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await updateLead(lead.id, { status: 'samples_sent', next_follow_up: nextFollowUp });
    setActionFeedback({ id: lead.id, message: `Samples sent — follow-up set for ${new Date(nextFollowUp).toLocaleDateString()}`, type: 'success' });
    fetchLeads();
  }

  async function handleMarkConverted(lead: WholesaleLead) {
    if (!confirm(`Mark "${lead.business_name}" as converted (wholesale customer)?`)) return;
    await updateLead(lead.id, { status: 'converted' });
    setActionFeedback({ id: lead.id, message: 'Converted to wholesale customer!', type: 'success' });
    fetchLeads();
  }

  async function handleMarkDeclined(lead: WholesaleLead) {
    if (!confirm(`Mark "${lead.business_name}" as declined?`)) return;
    await updateLead(lead.id, { status: 'declined' });
    setActionFeedback({ id: lead.id, message: 'Marked as declined', type: 'success' });
    fetchLeads();
  }

  async function handleSetFollowUp(lead: WholesaleLead, date: string) {
    await updateLead(lead.id, { next_follow_up: date });
    setActionFeedback({ id: lead.id, message: `Follow-up set for ${new Date(date).toLocaleDateString()}`, type: 'success' });
  }

  async function addLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      business_name: form.get('business_name'),
      contact_name: form.get('contact_name') || '',
      contact_email: form.get('contact_email') || '',
      contact_instagram: form.get('contact_instagram') || '',
      website: form.get('website') || '',
      city: form.get('city') || '',
      state: form.get('state') || '',
      shop_type: form.get('shop_type') || 'other',
      product_fit: form.getAll('product_fit'),
      fit_score: parseInt(form.get('fit_score') as string) || 5,
      fit_reason: form.get('fit_reason') || '',
      status: 'researched',
      source: 'manual',
    };
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setShowAddForm(false);
    fetchLeads();
  }

  // Pipeline summary counts
  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const lead of leads) {
      counts[lead.status] = (counts[lead.status] || 0) + 1;
    }
    return counts;
  }, [leads]);

  const allLeads = useMemo(() => {
    let filtered = leads;
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        l.business_name?.toLowerCase().includes(q) ||
        l.contact_name?.toLowerCase().includes(q) ||
        l.contact_email?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        l.state?.toLowerCase().includes(q)
      );
    } else {
      // Status filter (only when not searching)
      if (statusFilter === 'dead') filtered = filtered.filter(l => l.status === 'dead');
      else if (statusFilter === 'all') filtered = filtered.filter(l => l.status !== 'dead' && l.status !== 'declined');
      else if (statusFilter !== 'all') filtered = filtered.filter(l => l.status === statusFilter);
    }
    // Shop type filter
    if (shopTypeFilter !== 'all') filtered = filtered.filter(l => l.shop_type === shopTypeFilter);
    return filtered;
  }, [leads, statusFilter, shopTypeFilter, searchQuery]);

  // Overdue follow-ups
  const overdueCount = useMemo(() => {
    const now = new Date().toISOString().split('T')[0];
    return leads.filter(l => l.next_follow_up && l.next_follow_up.split('T')[0] <= now && !['converted', 'declined', 'dead'].includes(l.status)).length;
  }, [leads]);

  // Draft ready count for header
  const draftReadyCount = useMemo(() => {
    return leads.filter(l => l.status === 'outreach_drafted').length;
  }, [leads]);

  return (
    <div>
      <PageHeader
        title="Wholesale Outreach"
        description={
          `${leads.filter(l => l.status !== 'dead' && l.status !== 'declined').length} active leads` +
          (draftReadyCount > 0 ? ` \u2022 ${draftReadyCount} drafts to review` : '') +
          (overdueCount > 0 ? ` \u2022 ${overdueCount} overdue follow-ups` : '')
        }
        actions={
          <div className="flex gap-2">
            {draftReadyCount > 0 && (
              <Button variant="secondary" onClick={handleApproveAll}>
                Approve All ({draftReadyCount})
              </Button>
            )}
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              + Add Lead
            </Button>
          </div>
        }
      />

      {/* Pipeline Summary */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2 md:gap-3 mb-6">
        {PIPELINE_STAGES.map(stage => (
          <button
            key={stage}
            onClick={() => setStatusFilter(statusFilter === stage ? 'all' : stage)}
            className={`rounded-lg p-3 text-center transition-colors ${statusFilter === stage ? 'ring-2 ring-blue-500' : ''} ${STATUS_COLORS[stage] || 'bg-gray-100 text-gray-700'}`}
          >
            <div className="text-2xl font-bold">{pipelineCounts[stage] || 0}</div>
            <div className="text-xs font-medium">{STATUS_LABELS[stage]}</div>
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search leads..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white w-64 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={shopTypeFilter}
          onChange={e => setShopTypeFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white"
        >
          <option value="all">All Shop Types</option>
          <option value="gothic">Gothic</option>
          <option value="metaphysical">Metaphysical</option>
          <option value="museum">Museum</option>
          <option value="chain">Chain</option>
          <option value="boutique">Boutique</option>
          <option value="ren_faire">Ren Faire</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Add Lead Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Add New Lead</h3>
            <form onSubmit={addLead} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input name="business_name" placeholder="Business Name *" required className="px-3 py-2 border rounded text-sm text-gray-900 bg-white" />
              <input name="contact_name" placeholder="Contact Name" className="px-3 py-2 border rounded text-sm text-gray-900 bg-white" />
              <input name="contact_email" placeholder="Email" type="email" className="px-3 py-2 border rounded text-sm text-gray-900 bg-white" />
              <input name="contact_instagram" placeholder="Instagram @handle" className="px-3 py-2 border rounded text-sm text-gray-900 bg-white" />
              <input name="website" placeholder="Website URL" className="px-3 py-2 border rounded text-sm text-gray-900 bg-white" />
              <div className="flex gap-2">
                <input name="city" placeholder="City" className="px-3 py-2 border rounded text-sm text-gray-900 bg-white flex-1" />
                <input name="state" placeholder="State" className="px-3 py-2 border rounded text-sm text-gray-900 bg-white w-16" />
              </div>
              <select name="shop_type" className="px-3 py-2 border rounded text-sm text-gray-900 bg-white">
                <option value="gothic">Gothic</option>
                <option value="metaphysical">Metaphysical</option>
                <option value="museum">Museum</option>
                <option value="chain">Chain</option>
                <option value="boutique">Boutique</option>
                <option value="ren_faire">Ren Faire</option>
                <option value="other">Other</option>
              </select>
              <div className="flex gap-3 items-center text-sm">
                <label><input type="checkbox" name="product_fit" value="glass" className="mr-1" />Glass</label>
                <label><input type="checkbox" name="product_fit" value="leather" className="mr-1" />Leather</label>
                <label><input type="checkbox" name="product_fit" value="paper" className="mr-1" />Paper</label>
              </div>
              <div className="flex gap-2 items-center">
                <input name="fit_score" type="number" min="1" max="10" defaultValue="5" className="px-3 py-2 border rounded text-sm text-gray-900 bg-white w-20" />
                <span className="text-sm text-gray-500">Fit (1-10)</span>
              </div>
              <input name="fit_reason" placeholder="Why they're a good fit" className="px-3 py-2 border rounded text-sm text-gray-900 bg-white col-span-2" />
              <div className="flex gap-2">
                <Button type="submit" size="sm">Add Lead</Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Leads List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading leads...</div>
      ) : allLeads.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No leads found</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-[1fr_90px_100px_50px_120px_100px_80px] gap-0 bg-gray-50 border-b text-xs font-medium text-gray-500 px-4 py-3">
              <div>Business</div>
              <div>Type</div>
              <div>Products</div>
              <div>Fit</div>
              <div>Status</div>
              <div>Follow-up</div>
              <div className="text-right">Links</div>
            </div>

            {/* Lead rows */}
            <div className="divide-y">
              {allLeads.map(lead => {
                const isExpanded = expandedLead === lead.id;
                const isOverdue = lead.next_follow_up && lead.next_follow_up.split('T')[0] <= new Date().toISOString().split('T')[0] && !['converted', 'declined', 'dead'].includes(lead.status);
                const feedback = actionFeedback?.id === lead.id ? actionFeedback : null;

                return (
                  <div key={lead.id}>
                    {/* Main row */}
                    <div
                      className={`grid grid-cols-1 md:grid-cols-[1fr_90px_100px_50px_120px_100px_80px] gap-2 md:gap-0 items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors text-sm ${isExpanded ? 'bg-blue-50/50' : ''}`}
                      onClick={() => {
                        setExpandedLead(isExpanded ? null : lead.id);
                        setEditingDraft(null);
                        setEditingNotes(null);
                        setEditingResponseNotes(null);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xs transition-transform inline-block ${isExpanded ? 'rotate-90' : ''}`}>&#9654;</span>
                        <div>
                          <div className="font-medium text-gray-900">{lead.business_name}</div>
                          <div className="text-xs text-gray-400">
                            {lead.city}{lead.city && lead.state ? ', ' : ''}{lead.state}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{lead.shop_type}</span>
                      </div>
                      <div className="flex gap-1">
                        {(lead.product_fit || []).map(p => (
                          <span key={p} className={`text-xs px-1.5 py-0.5 rounded ${p === 'glass' ? 'bg-blue-50 text-blue-600' : p === 'leather' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-600'}`}>{p}</span>
                        ))}
                      </div>
                      <div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${lead.fit_score >= 8 ? 'bg-green-100 text-green-700' : lead.fit_score >= 6 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                          {lead.fit_score}
                        </div>
                      </div>
                      <div onClick={e => e.stopPropagation()}>
                        <select
                          value={lead.status}
                          onChange={e => updateLead(lead.id, { status: e.target.value })}
                          className={`text-xs px-2 py-1 rounded border-0 cursor-pointer ${STATUS_COLORS[lead.status] || 'bg-gray-100'}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        {lead.next_follow_up ? (
                          <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {isOverdue ? 'OVERDUE ' : ''}{new Date(lead.next_follow_up).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">-</span>
                        )}
                      </div>
                      <div className="text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1 justify-end">
                          {lead.website && (
                            <a href={lead.website} target="_blank" rel="noopener" className="text-xs text-blue-600 hover:underline">Web</a>
                          )}
                          {lead.contact_instagram && (
                            <a href={'https://instagram.com/' + lead.contact_instagram} target="_blank" rel="noopener" className="text-xs text-pink-600 hover:underline">IG</a>
                          )}
                          {lead.contact_email && (
                            <a href={'mailto:' + lead.contact_email} className="text-xs text-gray-600 hover:underline">Email</a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded detail panel */}
                    {isExpanded && (
                      <div className="border-t border-blue-100 bg-blue-50/30 px-6 py-5">
                        {/* Feedback banner */}
                        {feedback && (
                          <div className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {feedback.message}
                          </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Left column: Contact Info + Fit */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contact Info</h4>
                              <div className="space-y-1.5 text-sm">
                                {lead.contact_name && (
                                  <div><span className="text-gray-500">Name:</span> <span className="text-gray-900">{lead.contact_name}</span></div>
                                )}
                                {lead.contact_email && (
                                  <div><span className="text-gray-500">Email:</span> <a href={`mailto:${lead.contact_email}`} className="text-blue-600 hover:underline">{lead.contact_email}</a></div>
                                )}
                                {lead.contact_phone && (
                                  <div><span className="text-gray-500">Phone:</span> <a href={`tel:${lead.contact_phone}`} className="text-blue-600 hover:underline">{lead.contact_phone}</a></div>
                                )}
                                {lead.contact_instagram && (
                                  <div><span className="text-gray-500">Instagram:</span> <a href={`https://instagram.com/${lead.contact_instagram}`} target="_blank" rel="noopener" className="text-pink-600 hover:underline">@{lead.contact_instagram}</a></div>
                                )}
                                {lead.website && (
                                  <div><span className="text-gray-500">Website:</span> <a href={lead.website} target="_blank" rel="noopener" className="text-blue-600 hover:underline break-all">{lead.website.replace(/^https?:\/\//, '')}</a></div>
                                )}
                                {!lead.contact_name && !lead.contact_email && !lead.contact_phone && !lead.contact_instagram && !lead.website && (
                                  <div className="text-gray-400 italic">No contact info</div>
                                )}
                              </div>
                            </div>

                            {lead.fit_reason && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fit Reason</h4>
                                <p className="text-sm text-gray-700">{lead.fit_reason}</p>
                              </div>
                            )}

                            {/* Contacted info */}
                            {['contacted', 'replied', 'application_required', 'samples_requested', 'samples_sent', 'follow_up_1', 'follow_up_2', 'follow_up_3'].includes(lead.status) && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Outreach History</h4>
                                <div className="space-y-1.5 text-sm">
                                  {lead.outreach_sent_at && (
                                    <div><span className="text-gray-500">Sent:</span> <span className="text-gray-900">{new Date(lead.outreach_sent_at).toLocaleString()}</span></div>
                                  )}
                                  {lead.follow_up_count > 0 && (
                                    <div><span className="text-gray-500">Follow-ups:</span> <span className="text-gray-900">{lead.follow_up_count}</span></div>
                                  )}
                                  {lead.last_follow_up && (
                                    <div><span className="text-gray-500">Last follow-up:</span> <span className="text-gray-900">{new Date(lead.last_follow_up).toLocaleDateString()}</span></div>
                                  )}
                                </div>

                                <div className="mt-3 flex items-center gap-2">
                                  <label className="text-xs text-gray-500">Next follow-up:</label>
                                  <input
                                    type="date"
                                    value={lead.next_follow_up ? lead.next_follow_up.split('T')[0] : ''}
                                    onChange={e => handleSetFollowUp(lead, e.target.value)}
                                    className="text-xs px-2 py-1 border rounded text-gray-900 bg-white"
                                  />
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  {lead.status === 'contacted' && (
                                    <button onClick={() => handleMarkReplied(lead)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors">Mark Replied</button>
                                  )}
                                  {lead.status === 'replied' && (
                                    <>
                                      <button onClick={() => handleSamplesRequested(lead)} className="px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-700 transition-colors">Samples Requested</button>
                                      <button onClick={() => handleApplicationRequired(lead)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors">Application Required</button>
                                    </>
                                  )}
                                  {lead.status === 'application_required' && (
                                    <button onClick={() => handleSamplesRequested(lead)} className="px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-700 transition-colors">Samples Requested</button>
                                  )}
                                  {['samples_requested', 'application_required'].includes(lead.status) && (
                                    <button onClick={() => handleSamplesSent(lead)} className="px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded hover:bg-teal-700 transition-colors">Samples Sent</button>
                                  )}
                                  {['replied', 'application_required', 'samples_requested', 'samples_sent'].includes(lead.status) && (
                                    <button onClick={() => handleMarkConverted(lead)} className="px-3 py-1.5 bg-green-700 text-white text-xs font-medium rounded hover:bg-green-800 transition-colors">Converted</button>
                                  )}
                                  {['replied', 'application_required', 'samples_requested', 'samples_sent'].includes(lead.status) && (
                                    <button onClick={() => handleMarkDeclined(lead)} className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition-colors">Declined</button>
                                  )}
                                  {['follow_up_1', 'follow_up_2', 'follow_up_3'].includes(lead.status) && (
                                    <>
                                      <button onClick={() => handleMarkReplied(lead)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors">Mark Replied</button>
                                      <button onClick={() => handleRejectDraft(lead)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300 transition-colors">Mark Dead</button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right column: Draft + Notes */}
                          <div className="lg:col-span-2 space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Outreach Draft</h4>
                                {lead.outreach_draft && lead.status === 'outreach_drafted' && editingDraft !== lead.id && (
                                  <button
                                    onClick={() => { setEditingDraft(lead.id); setDraftValue(lead.outreach_draft); }}
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    Edit Draft
                                  </button>
                                )}
                              </div>

                              {editingDraft === lead.id ? (
                                <div>
                                  <textarea
                                    value={draftValue}
                                    onChange={e => setDraftValue(e.target.value)}
                                    rows={12}
                                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono text-gray-900 bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button onClick={() => handleSaveDraft(lead)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors">Save Draft</button>
                                    <button onClick={() => setEditingDraft(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300 transition-colors">Cancel</button>
                                  </div>
                                </div>
                              ) : lead.outreach_draft ? (
                                <div className="bg-white border rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                                  {lead.outreach_draft}
                                </div>
                              ) : (
                                <div className="bg-gray-50 border border-dashed rounded-lg p-4 text-sm text-gray-400 italic text-center">
                                  No draft yet {lead.status === 'qualified' ? '-- BDA will generate one' : ''}
                                </div>
                              )}

                              {lead.status === 'outreach_drafted' && editingDraft !== lead.id && lead.outreach_draft && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  <button
                                    onClick={() => handleApprove(lead)}
                                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => { setEditingDraft(lead.id); setDraftValue(lead.outreach_draft); }}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors"
                                  >
                                    Edit Draft
                                  </button>
                                  <button
                                    onClick={() => handleRequestNewDraft(lead)}
                                    className="px-4 py-2 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-lg hover:bg-yellow-200 transition-colors"
                                  >
                                    Request New Draft
                                  </button>
                                  <button
                                    onClick={() => handleRejectDraft(lead)}
                                    className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</h4>
                                  {editingNotes !== lead.id && (
                                    <button onClick={() => { setEditingNotes(lead.id); setNotesValue(lead.notes || ''); }} className="text-xs text-blue-600 hover:underline">
                                      {lead.notes ? 'Edit' : 'Add'}
                                    </button>
                                  )}
                                </div>
                                {editingNotes === lead.id ? (
                                  <div>
                                    <textarea value={notesValue} onChange={e => setNotesValue(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none" placeholder="Internal notes about this lead..." />
                                    <div className="flex gap-2 mt-1">
                                      <button onClick={() => handleSaveNotes(lead)} className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">Save</button>
                                      <button onClick={() => setEditingNotes(null)} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">Cancel</button>
                                    </div>
                                  </div>
                                ) : lead.notes ? (
                                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{lead.notes}</p>
                                ) : (
                                  <p className="text-sm text-gray-300 italic">No notes</p>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Response Notes</h4>
                                  {editingResponseNotes !== lead.id && (
                                    <button onClick={() => { setEditingResponseNotes(lead.id); setResponseNotesValue(lead.response_notes || ''); }} className="text-xs text-blue-600 hover:underline">
                                      {lead.response_notes ? 'Edit' : 'Add'}
                                    </button>
                                  )}
                                </div>
                                {editingResponseNotes === lead.id ? (
                                  <div>
                                    <textarea value={responseNotesValue} onChange={e => setResponseNotesValue(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none" placeholder="Notes about their response..." />
                                    <div className="flex gap-2 mt-1">
                                      <button onClick={() => handleSaveResponseNotes(lead)} className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">Save</button>
                                      <button onClick={() => setEditingResponseNotes(null)} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">Cancel</button>
                                    </div>
                                  </div>
                                ) : lead.response_notes ? (
                                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{lead.response_notes}</p>
                                ) : (
                                  <p className="text-sm text-gray-300 italic">No response notes</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
