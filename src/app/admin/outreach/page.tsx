'use client';

import { useState, useEffect, useMemo } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

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
  follow_up_1: 'bg-purple-50 text-purple-600',
  follow_up_2: 'bg-purple-50 text-purple-600',
  follow_up_3: 'bg-purple-50 text-purple-600',
  converted: 'bg-green-200 text-green-800',
  declined: 'bg-red-100 text-red-700',
  dead: 'bg-gray-200 text-gray-500',
};

const PIPELINE_STAGES = ['researched', 'verified', 'qualified', 'contacted', 'replied', 'converted'];

export default function OutreachPage() {
  const [leads, setLeads] = useState<WholesaleLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [shopTypeFilter, setShopTypeFilter] = useState('all');
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, shopTypeFilter]);

  async function fetchLeads() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (shopTypeFilter !== 'all') params.set('shop_type', shopTypeFilter);
    const res = await fetch('/api/leads?' + params.toString());
    const json = await res.json();
    if (json.success) setLeads(json.data);
    setLoading(false);
  }

  async function updateLead(id: string, updates: Partial<WholesaleLead>) {
    await fetch('/api/leads/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    fetchLeads();
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
    // When filters are set, leads is already filtered from API
    return leads;
  }, [leads]);

  // Overdue follow-ups
  const overdueCount = useMemo(() => {
    const now = new Date().toISOString().split('T')[0];
    return leads.filter(l => l.next_follow_up && l.next_follow_up.split('T')[0] <= now && !['converted', 'declined', 'dead'].includes(l.status)).length;
  }, [leads]);

  return (
    <div>
      <PageHeader
        title="Wholesale Outreach"
        description={`${leads.length} leads in pipeline` + (overdueCount > 0 ? ` \u2022 ${overdueCount} overdue follow-ups` : '')}
        actions={
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            + Add Lead
          </Button>
        }
      />

      {/* Pipeline Summary */}
      <div className="grid grid-cols-6 gap-3 mb-6">
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

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={shopTypeFilter}
          onChange={e => setShopTypeFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
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
            <form onSubmit={addLead} className="grid grid-cols-3 gap-4">
              <input name="business_name" placeholder="Business Name *" required className="px-3 py-2 border rounded text-sm" />
              <input name="contact_name" placeholder="Contact Name" className="px-3 py-2 border rounded text-sm" />
              <input name="contact_email" placeholder="Email" type="email" className="px-3 py-2 border rounded text-sm" />
              <input name="contact_instagram" placeholder="Instagram @handle" className="px-3 py-2 border rounded text-sm" />
              <input name="website" placeholder="Website URL" className="px-3 py-2 border rounded text-sm" />
              <div className="flex gap-2">
                <input name="city" placeholder="City" className="px-3 py-2 border rounded text-sm flex-1" />
                <input name="state" placeholder="State" className="px-3 py-2 border rounded text-sm w-16" />
              </div>
              <select name="shop_type" className="px-3 py-2 border rounded text-sm">
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
                <input name="fit_score" type="number" min="1" max="10" defaultValue="5" className="px-3 py-2 border rounded text-sm w-20" />
                <span className="text-sm text-gray-500">Fit (1-10)</span>
              </div>
              <input name="fit_reason" placeholder="Why they're a good fit" className="px-3 py-2 border rounded text-sm col-span-2" />
              <div className="flex gap-2">
                <Button type="submit" size="sm">Add Lead</Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Leads Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading leads...</div>
      ) : allLeads.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No leads found</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Business</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Products</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Fit</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Follow-up</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allLeads.map(lead => {
                  const isExpanded = expandedLead === lead.id;
                  const isOverdue = lead.next_follow_up && lead.next_follow_up.split('T')[0] <= new Date().toISOString().split('T')[0] && !['converted', 'declined', 'dead'].includes(lead.status);

                  return (
                    <tr key={lead.id} className="group">
                      <td className="px-4 py-3">
                        <button onClick={() => setExpandedLead(isExpanded ? null : lead.id)} className="text-left">
                          <div className="font-medium text-gray-900">{lead.business_name}</div>
                          <div className="text-xs text-gray-400">
                            {lead.city}{lead.city && lead.state ? ', ' : ''}{lead.state}
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{lead.shop_type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {(lead.product_fit || []).map(p => (
                            <span key={p} className={`text-xs px-1.5 py-0.5 rounded ${p === 'glass' ? 'bg-blue-50 text-blue-600' : p === 'leather' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-600'}`}>{p}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${lead.fit_score >= 8 ? 'bg-green-100 text-green-700' : lead.fit_score >= 6 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                            {lead.fit_score}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          onChange={e => updateLead(lead.id, { status: e.target.value })}
                          className={`text-xs px-2 py-1 rounded border-0 cursor-pointer ${STATUS_COLORS[lead.status] || 'bg-gray-100'}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {lead.next_follow_up ? (
                          <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {isOverdue ? 'OVERDUE ' : ''}{new Date(lead.next_follow_up).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
