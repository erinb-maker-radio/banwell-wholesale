'use client';

import { useState, useEffect, useMemo } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface PendingApproval {
  id: string;
  title: string;
  content: string;
  metadata: {
    leadId?: string;
    followUpNumber?: number;
    channel?: string;
    contact_email?: string;
    contact_instagram?: string;
    business_name?: string;
  };
  created: string;
  status: string;
}

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
  application_required: 'Apply to Be Vendor',
  application_submitted: 'Filled Out Vendor Form',
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
  application_submitted: 'bg-cyan-100 text-cyan-700',
  samples_requested: 'bg-amber-100 text-amber-700',
  samples_sent: 'bg-teal-100 text-teal-700',
  follow_up_1: 'bg-purple-50 text-purple-600',
  follow_up_2: 'bg-purple-50 text-purple-600',
  follow_up_3: 'bg-purple-50 text-purple-600',
  converted: 'bg-green-200 text-green-800',
  declined: 'bg-red-100 text-red-700',
  dead: 'bg-gray-200 text-gray-500',
};

const PIPELINE_FUNNEL = ['researched', 'qualified', 'outreach_drafted', 'outreach_approved', 'contacted'];
const PIPELINE_DIRECT = ['replied', 'samples_requested', 'samples_sent'];
const PIPELINE_VENDOR = ['application_required', 'application_submitted'];
const PIPELINE_OUTCOMES = ['converted', 'declined'];

export default function OutreachPage() {
  const [leads, setLeads] = useState<WholesaleLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [shopTypeFilter, setShopTypeFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [pendingApprovalsOnly, setPendingApprovalsOnly] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [editingFollowUp, setEditingFollowUp] = useState<string | null>(null);
  const [followUpEditValue, setFollowUpEditValue] = useState('');
  const [selectedFollowUps, setSelectedFollowUps] = useState<Set<string>>(new Set());
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);
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
  const [runningPrep, setRunningPrep] = useState(false);
  const [prepResult, setPrepResult] = useState<string | null>(null);
  const [runningFollowUp, setRunningFollowUp] = useState(false);
  const [followUpResult, setFollowUpResult] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
    fetchPendingApprovals();
  }, []);

  async function fetchPendingApprovals() {
    try {
      const res = await fetch('/api/outreach/approval-queue');
      const json = await res.json();
      if (json.success) setPendingApprovals(json.items || []);
    } catch {
      // silent — approvals are supplementary
    }
  }

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

  async function updateLead(id: string, updates: Partial<WholesaleLead>, opts?: { force?: boolean }) {
    const url = '/api/leads/' + id + (opts?.force ? '?force=true' : '');
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (json.success) {
      // Update local state immediately for responsiveness
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    } else if (json.error) {
      setActionFeedback({ id, message: json.error, type: 'error' });
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
    await updateLead(lead.id, { status: 'qualified', outreach_draft: '' }, { force: true });
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

  async function handleApplicationSubmitted(lead: WholesaleLead) {
    const nextFollowUp = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const existingNotes = lead.response_notes ? lead.response_notes + '\n\n' : '';
    await updateLead(lead.id, {
      status: 'application_submitted',
      next_follow_up: nextFollowUp,
      response_notes: existingNotes + `[Application submitted ${new Date().toLocaleDateString()}] Waiting for response.`,
    });
    setActionFeedback({ id: lead.id, message: `Application submitted — follow-up set for ${new Date(nextFollowUp).toLocaleDateString()}`, type: 'success' });
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

  async function handleRunPrep() {
    if (runningPrep) return;
    setRunningPrep(true);
    setPrepResult(null);
    try {
      const res = await fetch('/api/outreach/run-prep', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setPrepResult(`Drafted ${json.drafted}/${json.total} leads`);
        await fetchLeads();
      } else {
        setPrepResult(`Error: ${json.error || 'unknown'}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setPrepResult(`Error: ${message}`);
    } finally {
      setRunningPrep(false);
      setTimeout(() => setPrepResult(null), 8000);
    }
  }

  async function handleApproveFollowUp(approval: PendingApproval, leadId: string) {
    try {
      const res = await fetch(`/api/outreach/approve/${approval.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const json = await res.json();
      if (json.success) {
        setPendingApprovals(prev => prev.filter(a => a.id !== approval.id));
        setActionFeedback({ id: leadId, message: 'Follow-up approved — will send next 10am PDT batch', type: 'success' });
      } else {
        setActionFeedback({ id: leadId, message: `Error: ${json.error}`, type: 'error' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setActionFeedback({ id: leadId, message: `Error: ${message}`, type: 'error' });
    }
  }

  async function handleRejectFollowUp(approval: PendingApproval, leadId: string) {
    const reason = prompt('Reason for rejecting this follow-up? (optional)');
    if (reason === null) return;
    try {
      const res = await fetch(`/api/outreach/approve/${approval.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason }),
      });
      const json = await res.json();
      if (json.success) {
        setPendingApprovals(prev => prev.filter(a => a.id !== approval.id));
        setActionFeedback({ id: leadId, message: 'Follow-up rejected', type: 'success' });
      } else {
        setActionFeedback({ id: leadId, message: `Error: ${json.error}`, type: 'error' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setActionFeedback({ id: leadId, message: `Error: ${message}`, type: 'error' });
    }
  }

  async function handleSaveFollowUpEdit(approval: PendingApproval, leadId: string) {
    try {
      const res = await fetch(`/api/outreach/approve/${approval.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editedContent: followUpEditValue }),
      });
      const json = await res.json();
      if (json.success) {
        setPendingApprovals(prev => prev.filter(a => a.id !== approval.id));
        setEditingFollowUp(null);
        setActionFeedback({ id: leadId, message: 'Edited & approved — will send next 10am PDT batch', type: 'success' });
      } else {
        setActionFeedback({ id: leadId, message: `Error: ${json.error}`, type: 'error' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setActionFeedback({ id: leadId, message: `Error: ${message}`, type: 'error' });
    }
  }

  function toggleFollowUpSelection(approvalId: string) {
    setSelectedFollowUps(prev => {
      const next = new Set(prev);
      if (next.has(approvalId)) next.delete(approvalId);
      else next.add(approvalId);
      return next;
    });
  }

  function selectAllVisiblePending() {
    const visibleApprovalIds = allLeads
      .map(l => approvalByLeadId.get(l.id)?.id)
      .filter((id): id is string => !!id);
    const allSelected = visibleApprovalIds.every(id => selectedFollowUps.has(id));
    if (allSelected) {
      setSelectedFollowUps(new Set());
    } else {
      setSelectedFollowUps(new Set(visibleApprovalIds));
    }
  }

  async function handleBulkApprove() {
    const ids = Array.from(selectedFollowUps);
    if (ids.length === 0) return;
    if (!confirm(`Approve ${ids.length} follow-up${ids.length === 1 ? '' : 's'}? They'll queue for the next 10am PDT batch send.`)) return;
    setBulkRunning(true);
    let ok = 0, fail = 0;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      setBulkProgress(`Approving ${i + 1}/${ids.length}…`);
      try {
        const res = await fetch(`/api/outreach/approve/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
        const json = await res.json();
        if (json.success) {
          ok++;
          setPendingApprovals(prev => prev.filter(a => a.id !== id));
        } else {
          fail++;
        }
      } catch {
        fail++;
      }
      await new Promise(r => setTimeout(r, 100));
    }
    setSelectedFollowUps(new Set());
    setBulkRunning(false);
    setBulkProgress(`Done: ${ok} approved${fail > 0 ? `, ${fail} failed` : ''}`);
    setTimeout(() => setBulkProgress(null), 8000);
  }

  async function handleBulkReject() {
    const ids = Array.from(selectedFollowUps);
    if (ids.length === 0) return;
    const reason = prompt(`Reject ${ids.length} follow-up${ids.length === 1 ? '' : 's'}? (optional reason, applied to all)`);
    if (reason === null) return;
    setBulkRunning(true);
    let ok = 0, fail = 0;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      setBulkProgress(`Rejecting ${i + 1}/${ids.length}…`);
      try {
        const res = await fetch(`/api/outreach/approve/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reject', reason }),
        });
        const json = await res.json();
        if (json.success) {
          ok++;
          setPendingApprovals(prev => prev.filter(a => a.id !== id));
        } else {
          fail++;
        }
      } catch {
        fail++;
      }
      await new Promise(r => setTimeout(r, 100));
    }
    setSelectedFollowUps(new Set());
    setBulkRunning(false);
    setBulkProgress(`Done: ${ok} rejected${fail > 0 ? `, ${fail} failed` : ''}`);
    setTimeout(() => setBulkProgress(null), 8000);
  }

  async function handleRunFollowUp() {
    if (runningFollowUp) return;
    setRunningFollowUp(true);
    setFollowUpResult(null);
    try {
      const res = await fetch('/api/outreach/run-followup', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setFollowUpResult(`Drafted ${json.drafted}/${json.overdue} follow-ups`);
        await fetchPendingApprovals();
      } else {
        setFollowUpResult(`Error: ${json.error || 'unknown'}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setFollowUpResult(`Error: ${message}`);
    } finally {
      setRunningFollowUp(false);
      setTimeout(() => setFollowUpResult(null), 10000);
    }
  }

  async function handleSetFollowUp(lead: WholesaleLead, date: string) {
    await updateLead(lead.id, { next_follow_up: date });
    setActionFeedback({ id: lead.id, message: `Follow-up set for ${new Date(date).toLocaleDateString()}`, type: 'success' });
  }

  async function handleMarkFormSubmitted(lead: WholesaleLead) {
    const nextFollowUp = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const existingNotes = lead.response_notes ? lead.response_notes + '\n\n' : '';
    await updateLead(lead.id, {
      status: 'contacted',
      outreach_sent_at: new Date().toISOString(),
      next_follow_up: nextFollowUp,
      response_notes: existingNotes + `[Form submitted ${new Date().toLocaleDateString()}]`,
    });
    setActionFeedback({ id: lead.id, message: `Form submitted — follow-up set for ${new Date(nextFollowUp).toLocaleDateString()}`, type: 'success' });
    fetchLeads();
  }

  async function handleMarkDMSent(lead: WholesaleLead) {
    const nextFollowUp = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await updateLead(lead.id, {
      status: 'contacted',
      outreach_sent_at: new Date().toISOString(),
      next_follow_up: nextFollowUp,
    });
    setActionFeedback({ id: lead.id, message: `DM marked sent — follow-up set for ${new Date(nextFollowUp).toLocaleDateString()}`, type: 'success' });
    fetchLeads();
  }

  function extractFormUrl(notes: string): string | null {
    if (!notes) return null;
    const match = notes.match(/https?:\/\/\S+/);
    return match ? match[0].replace(/[.,)]+$/, '') : null;
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

  // leadId → pending follow-up approval (first match wins)
  const approvalByLeadId = useMemo(() => {
    const map = new Map<string, PendingApproval>();
    for (const a of pendingApprovals) {
      const lid = a.metadata?.leadId;
      if (lid && !map.has(lid)) map.set(lid, a);
    }
    return map;
  }, [pendingApprovals]);

  const pendingFollowUpCount = approvalByLeadId.size;

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
    // Channel filter
    if (channelFilter === 'email') filtered = filtered.filter(l => l.contact_email);
    else if (channelFilter === 'instagram_dm') filtered = filtered.filter(l => l.outreach_channel === 'instagram_dm' || (!l.contact_email && l.contact_instagram));
    else if (channelFilter === 'form') filtered = filtered.filter(l => l.outreach_channel === 'form');
    else if (channelFilter === 'no_email') filtered = filtered.filter(l => !l.contact_email);
    // Overdue follow-up filter
    if (overdueOnly) {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(l =>
        l.next_follow_up &&
        l.next_follow_up.split('T')[0] <= today &&
        !['converted', 'declined', 'dead'].includes(l.status)
      );
    }
    // Pending follow-up approval filter
    if (pendingApprovalsOnly) {
      filtered = filtered.filter(l => approvalByLeadId.has(l.id));
    }
    return filtered;
  }, [leads, statusFilter, shopTypeFilter, searchQuery, channelFilter, overdueOnly, pendingApprovalsOnly, approvalByLeadId]);

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
          <div className="flex gap-2 items-center flex-wrap">
            {prepResult && (
              <span className={`text-xs px-2 py-1 rounded ${prepResult.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {prepResult}
              </span>
            )}
            {followUpResult && (
              <span className={`text-xs px-2 py-1 rounded ${followUpResult.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {followUpResult}
              </span>
            )}
            {/* Mobile: Show only primary actions */}
            <div className="flex md:hidden gap-2 flex-wrap">
              {draftReadyCount > 0 && (
                <Button variant="secondary" onClick={handleApproveAll} className="flex-1">
                  ✓ Approve ({draftReadyCount})
                </Button>
              )}
              <Button onClick={() => setShowAddForm(!showAddForm)} className="flex-1">
                + Add
              </Button>
              {(overdueCount > 0 || runningPrep) && (
                <button
                  onClick={handleRunFollowUp}
                  disabled={runningFollowUp}
                  className="px-3 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50 disabled:opacity-50"
                  title="Draft follow-ups"
                >
                  ⋮
                </button>
              )}
            </div>

            {/* Desktop: Show all actions */}
            <div className="hidden md:flex gap-2 flex-wrap">
              <Button variant="secondary" onClick={handleRunPrep} disabled={runningPrep}>
                {runningPrep ? 'Drafting…' : 'Draft Qualified Leads'}
              </Button>
              {overdueCount > 0 && (
                <Button variant="secondary" onClick={handleRunFollowUp} disabled={runningFollowUp}>
                  {runningFollowUp ? 'Drafting follow-ups…' : `Draft Follow-ups (${overdueCount})`}
                </Button>
              )}
              {draftReadyCount > 0 && (
                <Button variant="secondary" onClick={handleApproveAll}>
                  Approve All ({draftReadyCount})
                </Button>
              )}
              <Button onClick={() => setShowAddForm(!showAddForm)}>
                + Add Lead
              </Button>
            </div>
          </div>
        }
      />

      {/* Pipeline — Outreach Funnel */}
      {/* Mobile: 2-column, top 4 metrics only */}
      <div className="grid grid-cols-2 gap-3 mb-3 md:hidden">
        {['qualified', 'outreach_drafted', 'contacted'].map(stage => (
          <button
            key={stage}
            onClick={() => setStatusFilter(statusFilter === stage ? 'all' : stage)}
            className={`rounded-lg p-4 text-center transition-colors ${statusFilter === stage ? 'ring-2 ring-blue-500' : ''} ${STATUS_COLORS[stage] || 'bg-gray-100 text-gray-700'}`}
          >
            <div className="text-3xl font-bold mb-1">{pipelineCounts[stage] || 0}</div>
            <div className="text-sm font-medium">{STATUS_LABELS[stage]}</div>
          </button>
        ))}
        {/* Overdue count as 4th metric on mobile */}
        <button
          onClick={() => setOverdueOnly(!overdueOnly)}
          className={`rounded-lg p-4 text-center transition-colors ${overdueOnly ? 'ring-2 ring-red-500 bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
        >
          <div className="text-3xl font-bold mb-1">{overdueCount}</div>
          <div className="text-sm font-medium">Overdue</div>
        </button>
      </div>

      {/* Desktop: Original 5-column layout */}
      <div className="hidden md:grid grid-cols-5 gap-3 mb-3">
        {PIPELINE_FUNNEL.map(stage => (
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

      {/* Pipeline — After Reply (two tracks + outcomes) - Hidden on mobile */}
      <div className="hidden md:grid grid-cols-[3fr_2fr_2fr] gap-3 mb-6">
        {/* Path A: Direct */}
        <div className="border border-green-200 rounded-lg p-2 bg-green-50/30">
          <div className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-1.5 px-1">Direct</div>
          <div className="grid grid-cols-3 gap-1.5">
            {PIPELINE_DIRECT.map(stage => (
              <button
                key={stage}
                onClick={() => setStatusFilter(statusFilter === stage ? 'all' : stage)}
                className={`rounded-lg p-2 text-center transition-colors ${statusFilter === stage ? 'ring-2 ring-blue-500' : ''} ${STATUS_COLORS[stage] || 'bg-gray-100 text-gray-700'}`}
              >
                <div className="text-lg md:text-xl font-bold">{pipelineCounts[stage] || 0}</div>
                <div className="text-[9px] md:text-[10px] font-medium leading-tight">{STATUS_LABELS[stage]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Path B: Vendor Form */}
        <div className="border border-blue-200 rounded-lg p-2 bg-blue-50/30">
          <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1.5 px-1">Vendor Form</div>
          <div className="grid grid-cols-2 gap-1.5">
            {PIPELINE_VENDOR.map(stage => (
              <button
                key={stage}
                onClick={() => setStatusFilter(statusFilter === stage ? 'all' : stage)}
                className={`rounded-lg p-2 text-center transition-colors ${statusFilter === stage ? 'ring-2 ring-blue-500' : ''} ${STATUS_COLORS[stage] || 'bg-gray-100 text-gray-700'}`}
              >
                <div className="text-lg md:text-xl font-bold">{pipelineCounts[stage] || 0}</div>
                <div className="text-[9px] md:text-[10px] font-medium leading-tight">{STATUS_LABELS[stage]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Outcomes */}
        <div className="border border-gray-200 rounded-lg p-2 bg-gray-50/30">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 px-1">Outcomes</div>
          <div className="grid grid-cols-2 gap-1.5">
            {PIPELINE_OUTCOMES.map(stage => (
              <button
                key={stage}
                onClick={() => setStatusFilter(statusFilter === stage ? 'all' : stage)}
                className={`rounded-lg p-2 text-center transition-colors ${statusFilter === stage ? 'ring-2 ring-blue-500' : ''} ${STATUS_COLORS[stage] || 'bg-gray-100 text-gray-700'}`}
              >
                <div className="text-lg md:text-xl font-bold">{pipelineCounts[stage] || 0}</div>
                <div className="text-[9px] md:text-[10px] font-medium leading-tight">{STATUS_LABELS[stage]}</div>
              </button>
            ))}
          </div>
        </div>
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
        <select
          value={channelFilter}
          onChange={e => setChannelFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white"
        >
          <option value="all">All Channels</option>
          <option value="email">Email Only</option>
          <option value="instagram_dm">IG DM Only</option>
          <option value="form">Form Only</option>
          <option value="no_email">No Email</option>
        </select>
        <button
          onClick={() => setOverdueOnly(!overdueOnly)}
          className={`px-3 py-2 border rounded-lg text-sm transition-colors ${overdueOnly ? 'bg-red-100 border-red-300 text-red-800 font-medium' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          title="Show only leads with an overdue follow-up date"
        >
          {overdueOnly ? `✓ Overdue only (${overdueCount})` : `Overdue only (${overdueCount})`}
        </button>
        <button
          onClick={() => setPendingApprovalsOnly(!pendingApprovalsOnly)}
          className={`px-3 py-2 border rounded-lg text-sm transition-colors ${pendingApprovalsOnly ? 'bg-blue-100 border-blue-300 text-blue-800 font-medium' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          title="Show only leads with a pending follow-up draft awaiting approval"
        >
          {pendingApprovalsOnly ? `✓ Pending follow-ups (${pendingFollowUpCount})` : `Pending follow-ups (${pendingFollowUpCount})`}
        </button>
        {pendingFollowUpCount > 0 && (
          <button
            onClick={selectAllVisiblePending}
            className="px-3 py-2 border rounded-lg text-sm bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            title="Select (or clear) all follow-ups in the current filter"
          >
            Select all visible
          </button>
        )}
      </div>

      {/* Bulk action bar — visible when selections exist */}
      {(selectedFollowUps.size > 0 || bulkProgress) && (
        <div className="sticky top-0 z-10 mb-3 flex items-center justify-between gap-3 bg-blue-900 text-white px-4 py-3 rounded-lg shadow">
          <div className="text-sm font-medium">
            {bulkProgress
              ? bulkProgress
              : `${selectedFollowUps.size} follow-up${selectedFollowUps.size === 1 ? '' : 's'} selected`}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBulkApprove}
              disabled={bulkRunning || selectedFollowUps.size === 0}
              className="px-4 py-1.5 bg-green-500 hover:bg-green-400 text-white text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Approve {selectedFollowUps.size}
            </button>
            <button
              onClick={handleBulkReject}
              disabled={bulkRunning || selectedFollowUps.size === 0}
              className="px-4 py-1.5 bg-red-500 hover:bg-red-400 text-white text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject {selectedFollowUps.size}
            </button>
            <button
              onClick={() => setSelectedFollowUps(new Set())}
              disabled={bulkRunning}
              className="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </div>
      )}

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
                const pendingFollowUp = approvalByLeadId.get(lead.id) || null;
                // Data integrity: status claims pre-send but sent_at is set, OR status claims post-send but no contact exists
                const preSendStatuses = ['researched', 'verified', 'qualified', 'outreach_drafted', 'outreach_approved'];
                const postSendStatuses = ['contacted', 'replied', 'application_required', 'application_submitted', 'samples_requested', 'samples_sent', 'follow_up_1', 'follow_up_2', 'follow_up_3'];
                const inconsistentSent = preSendStatuses.includes(lead.status) && !!lead.outreach_sent_at;
                const inconsistentContact = postSendStatuses.includes(lead.status) && !lead.contact_email && !lead.contact_instagram && lead.outreach_channel !== 'form';
                const integrityIssue = inconsistentSent
                  ? `Status is "${STATUS_LABELS[lead.status]}" but outreach was already sent on ${new Date(lead.outreach_sent_at).toLocaleDateString()}. Either revert sent_at (if send didn't actually happen) or advance status to Contacted.`
                  : inconsistentContact
                  ? `Status is "${STATUS_LABELS[lead.status]}" but no contact exists. Add email/IG or revert status.`
                  : null;

                return (
                  <div key={lead.id}>
                    {/* Mobile Card View */}
                    <div
                      className={`md:hidden p-4 border-b cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                      onClick={() => {
                        setExpandedLead(isExpanded ? null : lead.id);
                        setEditingDraft(null);
                        setEditingNotes(null);
                        setEditingResponseNotes(null);
                      }}
                    >
                      {/* Business Name & Status */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-base text-gray-900 mb-1 flex items-center gap-2">
                            <span className={`text-xs transition-transform inline-block ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                            {lead.business_name}
                          </div>
                          <div className="text-sm text-gray-500">{lead.city}{lead.city && lead.state ? ', ' : ''}{lead.state}</div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[lead.status] || 'bg-gray-100'}`}>
                          {STATUS_LABELS[lead.status]}
                        </div>
                      </div>

                      {/* Products & Shop Type */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{lead.shop_type}</span>
                        {(lead.product_fit || []).slice(0, 2).map(p => (
                          <span key={p} className={`text-xs px-2 py-1 rounded ${p === 'glass' ? 'bg-blue-50 text-blue-600' : p === 'leather' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-600'}`}>{p}</span>
                        ))}
                      </div>

                      {/* Follow-up Badge or Date */}
                      {pendingFollowUp ? (
                        <div className="mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                            Follow-up ready
                          </span>
                        </div>
                      ) : isOverdue ? (
                        <div className="mt-2 text-sm text-red-600 font-medium">
                          Follow-up overdue: {new Date(lead.next_follow_up!).toLocaleDateString()}
                        </div>
                      ) : null}
                    </div>

                    {/* Desktop Table Row */}
                    <div
                      className={`hidden md:grid grid-cols-[1fr_90px_100px_50px_120px_100px_80px] gap-0 items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors text-sm ${isExpanded ? 'bg-blue-50/50' : ''}`}
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
                          <div className="font-medium text-gray-900 flex items-center gap-1.5 flex-wrap">
                            {integrityIssue && (
                              <span title={integrityIssue} className="text-amber-600 text-xs" aria-label="Data integrity issue">&#9888;</span>
                            )}
                            {lead.business_name}
                            {pendingFollowUp && (
                              <>
                                <span
                                  className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium"
                                  title={`Follow-up #${pendingFollowUp.metadata.followUpNumber || '?'} drafted, awaiting approval`}
                                >
                                  Follow-up ready
                                </span>
                                <label
                                  onClick={e => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 ml-1 text-xs text-gray-600 cursor-pointer select-none"
                                  title="Select for batch approval"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedFollowUps.has(pendingFollowUp.id)}
                                    onChange={() => toggleFollowUpSelection(pendingFollowUp.id)}
                                    className="w-3.5 h-3.5"
                                  />
                                  select
                                </label>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {lead.city}{lead.city && lead.state ? ', ' : ''}{lead.state}
                            {lead.outreach_channel === 'form' && (
                              <span className="ml-1.5 px-1 py-0.5 bg-blue-100 text-blue-600 rounded text-[9px] font-medium">Form</span>
                            )}
                            {lead.outreach_channel !== 'form' && !lead.contact_email && lead.contact_instagram && (
                              <span className="ml-1.5 px-1 py-0.5 bg-pink-100 text-pink-600 rounded text-[9px] font-medium">IG DM</span>
                            )}
                            {lead.outreach_channel !== 'form' && !lead.contact_email && !lead.contact_instagram && lead.contact_phone && (
                              <span className="ml-1.5 px-1 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-medium">Phone</span>
                            )}
                            {lead.outreach_channel !== 'form' && !lead.contact_email && !lead.contact_instagram && !lead.contact_phone && (
                              <span className="ml-1.5 px-1 py-0.5 bg-red-50 text-red-400 rounded text-[9px] font-medium">No contact</span>
                            )}
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
                        {/* Integrity warning */}
                        {integrityIssue && (
                          <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
                            <span className="font-semibold">&#9888; Inconsistent state:</span> {integrityIssue}
                          </div>
                        )}
                        {/* Feedback banner */}
                        {feedback && (
                          <div className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {feedback.message}
                          </div>
                        )}

                        {/* Pending follow-up draft (from approval queue) */}
                        {pendingFollowUp && (
                          <div className="mb-4 border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2 gap-3">
                              <div className="flex items-center gap-2">
                                <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={selectedFollowUps.has(pendingFollowUp.id)}
                                    onChange={() => toggleFollowUpSelection(pendingFollowUp.id)}
                                    className="w-4 h-4"
                                  />
                                  <h4 className="text-sm font-semibold text-blue-900">
                                    Pending Follow-up{pendingFollowUp.metadata.followUpNumber ? ` #${pendingFollowUp.metadata.followUpNumber}` : ''}
                                  </h4>
                                </label>
                              </div>
                              <span className="text-xs text-blue-600">
                                Drafted {new Date(pendingFollowUp.created).toLocaleString()}
                              </span>
                            </div>
                            {editingFollowUp === pendingFollowUp.id ? (
                              <div>
                                <textarea
                                  value={followUpEditValue}
                                  onChange={e => setFollowUpEditValue(e.target.value)}
                                  rows={12}
                                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono text-gray-900 bg-white focus:ring-2 focus:ring-blue-300 outline-none"
                                />
                                <div className="flex gap-2 mt-2">
                                  <button onClick={() => handleSaveFollowUpEdit(pendingFollowUp, lead.id)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700">
                                    Save & Approve
                                  </button>
                                  <button onClick={() => setEditingFollowUp(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300">
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="bg-white border border-blue-200 rounded p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-[300px] overflow-y-auto mb-3">
                                  {pendingFollowUp.content}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => handleApproveFollowUp(pendingFollowUp, lead.id)}
                                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => { setEditingFollowUp(pendingFollowUp.id); setFollowUpEditValue(pendingFollowUp.content); }}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleRejectFollowUp(pendingFollowUp, lead.id)}
                                    className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200"
                                  >
                                    Reject
                                  </button>
                                </div>
                                <p className="text-xs text-blue-600 mt-2">
                                  Approving queues this for the next 10am PDT batch send (weekdays). Edit lets you tweak before approving.
                                </p>
                              </>
                            )}
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
                            {['contacted', 'replied', 'application_required', 'application_submitted', 'samples_requested', 'samples_sent', 'follow_up_1', 'follow_up_2', 'follow_up_3'].includes(lead.status) && (
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
                                      <button onClick={() => handleApplicationRequired(lead)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors">Apply to Be Vendor</button>
                                    </>
                                  )}
                                  {lead.status === 'application_required' && (
                                    <button onClick={() => handleApplicationSubmitted(lead)} className="px-3 py-1.5 bg-cyan-600 text-white text-xs font-medium rounded hover:bg-cyan-700 transition-colors">Filled Out Vendor Form</button>
                                  )}
                                  {lead.status === 'application_submitted' && (
                                    <button onClick={() => handleSamplesRequested(lead)} className="px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-700 transition-colors">Samples Requested</button>
                                  )}
                                  {['samples_requested', 'application_required'].includes(lead.status) && (
                                    <button onClick={() => handleSamplesSent(lead)} className="px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded hover:bg-teal-700 transition-colors">Samples Sent</button>
                                  )}
                                  {['replied', 'application_required', 'application_submitted', 'samples_requested', 'samples_sent'].includes(lead.status) && (
                                    <button onClick={() => handleMarkConverted(lead)} className="px-3 py-1.5 bg-green-700 text-white text-xs font-medium rounded hover:bg-green-800 transition-colors">Converted</button>
                                  )}
                                  {['replied', 'application_required', 'application_submitted', 'samples_requested', 'samples_sent'].includes(lead.status) && (
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
                                  {lead.outreach_channel === 'form' ? (
                                    <>
                                      {extractFormUrl(lead.notes) && (
                                        <a
                                          href={extractFormUrl(lead.notes)!}
                                          target="_blank"
                                          rel="noopener"
                                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                          Open Form &rarr;
                                        </a>
                                      )}
                                      <button
                                        onClick={() => handleMarkFormSubmitted(lead)}
                                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                      >
                                        Mark Submitted
                                      </button>
                                    </>
                                  ) : lead.outreach_channel === 'instagram_dm' ? (
                                    <>
                                      {lead.contact_instagram && (
                                        <a
                                          href={'https://instagram.com/' + lead.contact_instagram}
                                          target="_blank"
                                          rel="noopener"
                                          className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors"
                                        >
                                          Open IG &rarr;
                                        </a>
                                      )}
                                      <button
                                        onClick={() => handleMarkDMSent(lead)}
                                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                      >
                                        Mark DM Sent
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => handleApprove(lead)}
                                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                      Approve
                                    </button>
                                  )}
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

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMobileFilters(false)}
          />

          {/* Modal */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-base text-gray-900 bg-white"
                >
                  <option value="all">All Statuses</option>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Shop Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shop Type</label>
                <select
                  value={shopTypeFilter}
                  onChange={e => setShopTypeFilter(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-base text-gray-900 bg-white"
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

              {/* Channel Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
                <select
                  value={channelFilter}
                  onChange={e => setChannelFilter(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-base text-gray-900 bg-white"
                >
                  <option value="all">All Channels</option>
                  <option value="email">Email Only</option>
                  <option value="instagram_dm">IG DM Only</option>
                  <option value="form">Form Only</option>
                  <option value="no_email">No Email</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overdueOnly}
                    onChange={e => setOverdueOnly(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-base text-gray-700">
                    Overdue only ({overdueCount})
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pendingApprovalsOnly}
                    onChange={e => setPendingApprovalsOnly(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-base text-gray-700">
                    Pending follow-ups ({pendingFollowUpCount})
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setShopTypeFilter('all');
                    setChannelFilter('all');
                    setOverdueOnly(false);
                    setPendingApprovalsOnly(false);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 px-4 py-3 rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
