import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft, Heart, MapPin, GraduationCap, Briefcase, Phone,
  Mail, StickyNote, Plus, Trash2, RefreshCw, Sparkles, CheckCircle2,
  AlertCircle, Send, Star
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import StatusBadge from '../components/ui/StatusBadge';
import { useAppStore } from '../store/useAppStore';
import api from '../lib/api';
import type { Profile, Match, Note } from '../types';
import clsx from 'clsx';

/* ─── tiny helpers ─── */
const InfoBlock = ({ label, value }: { label: string; value: string | number | boolean | string[] }) => (
  <div className="bg-[#F8F4EE] rounded-2xl px-4 py-3 border border-black/[0.05]">
    <p className="label mb-1">{label}</p>
    <p className="font-body text-sm text-charcoal capitalize font-medium">
      {Array.isArray(value) ? value.join(', ') : value === true ? 'Yes' : value === false ? 'No' : String(value)}
    </p>
  </div>
);

const TIER_GRAD: Record<string, string> = {
  exceptional: 'score-exceptional', high: 'score-high',
  good: 'score-good', possible: 'score-possible', low: 'score-low',
};
const TIER_PILL: Record<string, string> = {
  exceptional: 'tier-exceptional', high: 'tier-high',
  good: 'tier-good', possible: 'tier-possible', low: 'tier-low',
};

/* ─── MatchCard (inline) ─── */
function MatchCard({ match, client, matcherName, rank }: { match: Match; client: Profile; matcherName: string; rank: number }) {
  const { candidate, score, label, tier, reasons, redFlags } = match;
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [aiNote, setAiNote] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const generateIntro = async () => {
    setShowModal(true);
    if (emailDraft) return;
    setLoadingEmail(true);
    try {
      const res = await api.post('/ai/intro', { client, match: { ...candidate, score, label, reasons }, matcherName });
      setEmailDraft(res.data.email);
    } catch {
      setEmailDraft(`Dear ${client.firstName},\n\nI'm delighted to introduce ${candidate.firstName} ${candidate.lastName}, a ${candidate.age}-year-old ${candidate.designation} based in ${candidate.city}.\n\nWarm regards,\n${matcherName}`);
    } finally { setLoadingEmail(false); }
  };

  const getAiNote = async () => {
    if (aiNote) return;
    setLoadingAi(true);
    try {
      const res = await api.post('/ai/score-explanation', {
        client: { firstName: client.firstName },
        match: { firstName: candidate.firstName, score, label, reasons, redFlags }
      });
      setAiNote(res.data.explanation);
    } catch {
      setAiNote(`${candidate.firstName} is a ${label.toLowerCase()} for ${client.firstName} based on ${reasons.slice(0,2).join(' and ')}.`);
    } finally { setLoadingAi(false); }
  };

  return (
    <>
      <div className={clsx('card overflow-hidden transition-all duration-300', rank <= 3 && 'ring-1 ring-gold/30')}>
        {rank <= 3 && <div className={`h-0.5 w-full ${TIER_GRAD[tier]}`} />}

        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="relative flex-shrink-0">
              <img src={candidate.profilePhoto} alt={candidate.firstName} className="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-blush" />
              <div className="absolute -top-1 -left-1 w-5 h-5 bg-charcoal rounded-full flex items-center justify-center">
                <span className="font-body text-white text-[9px] font-bold">#{rank}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-charcoal font-semibold text-lg leading-tight">{candidate.firstName} {candidate.lastName}</h3>
                <span className={clsx('text-[11px] font-medium px-2.5 py-1 rounded-full border flex-shrink-0 font-body', TIER_PILL[tier])}>{label}</span>
              </div>
              <p className="font-body text-xs text-charcoal-muted mt-0.5">{candidate.designation} · {candidate.city} · {candidate.age}y</p>
              <p className="font-body text-xs text-gold font-semibold mt-0.5">{candidate.annualIncomeBracket}</p>
            </div>
          </div>

          {/* Score bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-1.5">
              <span className="label">Compatibility</span>
              <span className="font-display text-lg font-semibold text-charcoal">{score}<span className="font-body text-xs text-charcoal-muted font-normal">/100</span></span>
            </div>
            <div className="h-2 bg-black/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full score-bar-fill ${TIER_GRAD[tier]}`} style={{ width: `${score}%` }} />
            </div>
          </div>

          {/* Expanded details */}
          {expanded && (
            <div className="mb-4 space-y-3 animate-fade-in">
              {(aiNote || loadingAi) && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles size={11} className="text-gold" />
                    <span className="label text-amber-700">AI Analysis</span>
                  </div>
                  {loadingAi
                    ? <div className="h-3 bg-amber-100 rounded-full animate-pulse w-3/4" />
                    : <p className="font-body text-xs text-charcoal leading-relaxed">{aiNote}</p>}
                </div>
              )}

              {reasons.length > 0 && (
                <div>
                  <p className="label mb-2">Why they match</p>
                  <div className="space-y-1.5">
                    {reasons.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-body text-charcoal">
                        <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0" />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {redFlags.length > 0 && (
                <div>
                  <p className="label mb-2">Points to discuss</p>
                  <div className="space-y-1.5">
                    {redFlags.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-body text-amber-700">
                        <AlertCircle size={11} className="text-amber-500 flex-shrink-0" />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  ['Diet', candidate.diet], ['Family', candidate.familyType],
                  ['Kids', candidate.wantKids], ['Relocate', candidate.openToRelocate],
                  ['Pets', candidate.openToPets], ['Marital', candidate.maritalStatus.replace('_',' ')],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="bg-[#F8F4EE] rounded-xl px-3 py-2 border border-black/[0.05]">
                    <p className="label mb-0.5">{lbl}</p>
                    <p className="font-body text-xs text-charcoal capitalize font-medium">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={generateIntro}
              className="flex-1 flex items-center justify-center gap-1.5 bg-burgundy text-white text-xs font-body font-semibold py-2.5 rounded-full hover:bg-burgundy-light transition-colors"
            >
              <Send size={11} /> Send Match
            </button>
            <button
              onClick={() => { setExpanded(!expanded); if (!expanded) getAiNote(); }}
              className="flex items-center gap-1.5 border border-gold/40 text-charcoal-muted text-xs font-body py-2.5 px-4 rounded-full hover:border-gold hover:text-gold transition-all"
            >
              <Sparkles size={11} />
              {expanded ? 'Less' : 'Details'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6 p-8 pb-0">
              <div className="w-10 h-10 bg-burgundy/10 rounded-2xl flex items-center justify-center">
                <Send size={16} className="text-burgundy" />
              </div>
              <div>
                <h2 className="font-display text-charcoal text-xl font-semibold">Send Introduction</h2>
                <p className="font-body text-xs text-charcoal-muted">{candidate.firstName} → {client.firstName}</p>
              </div>
            </div>
            <div className="bg-[#F8F4EE] border border-black/[0.06] rounded-2xl p-5 m-8 mt-0 mb-6 max-h-60 overflow-y-auto">
              {loadingEmail
                ? <div className="space-y-2">{[...Array(5)].map((_,i) => <div key={i} className={`h-3 bg-black/5 rounded-full animate-pulse`} style={{width:`${85-i*10}%`}}/>)}</div>
                : <p className="font-body text-sm text-charcoal leading-relaxed whitespace-pre-wrap">{emailDraft}</p>}
            </div>
            <div className="flex gap-3 p-8 pt-0">
              <button className="flex-1 btn-primary text-sm"
                onClick={() => { alert(`Introduction sent to ${client.firstName} ✓`); setShowModal(false); }}>
                Confirm & Send
              </button>
              <button className="btn-ghost text-sm" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

/* ─── Main page ─── */
export default function CustomerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { matchmaker } = useAppStore();
  const [activeTab, setActiveTab] = useState<'biodata' | 'matches' | 'notes'>('biodata');
  const [noteText, setNoteText] = useState('');

  const { data: customerData, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.get(`/customers/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const { data: matchData, isLoading: loadingMatches, refetch: refetchMatches } = useQuery({
    queryKey: ['matches', id],
    queryFn: () => api.get(`/matches/${id}`).then(r => r.data),
    enabled: !!id && activeTab === 'matches',
  });

  const { data: notesData, refetch: refetchNotes } = useQuery({
    queryKey: ['notes', id],
    queryFn: () => api.get(`/notes/${id}`).then(r => r.data),
    enabled: !!id && activeTab === 'notes',
  });

  const addNote = useMutation({
    mutationFn: (text: string) => api.post(`/notes/${id}`, { text }),
    onSuccess: () => { setNoteText(''); refetchNotes(); },
  });
  const deleteNote = useMutation({
    mutationFn: (noteId: string) => api.delete(`/notes/${noteId}`),
    onSuccess: () => refetchNotes(),
  });

  const customer: Profile | undefined = customerData?.customer;
  const matches: Match[] = matchData?.matches || [];
  const notes: Note[] = notesData?.notes || [];

  if (isLoading) return (
    <div className="min-h-screen bg-[#F0EBE3] flex">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display text-charcoal-muted text-xl italic">Loading profile...</p>
        </div>
      </div>
    </div>
  );

  if (!customer) return (
    <div className="min-h-screen bg-[#F0EBE3] flex">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl italic text-charcoal-muted mb-4">Customer not found</p>
          <button onClick={() => navigate('/customers')} className="btn-secondary">← Back</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0EBE3] flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar
          title={`${customer.firstName} ${customer.lastName}`}
          subtitle={`${customer.designation} · ${customer.city}`}
        />

        <main className="flex-1 p-6 overflow-auto">
          {/* Hero card */}
          <div className="card mb-6 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-burgundy via-gold to-burgundy-light" />
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-shrink-0 text-center">
                  <img
                    src={customer.profilePhoto}
                    alt={customer.firstName}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-blush"
                  />
                  <span className={clsx(
                    'mt-2 inline-block text-xs font-body font-medium px-3 py-1 rounded-full border',
                    customer.gender === 'female' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                  )}>
                    {customer.gender === 'female' ? '♀ Female' : '♂ Male'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <h1 className="font-display text-charcoal text-3xl font-semibold leading-tight">
                        {customer.firstName} {customer.lastName}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 font-body text-sm text-charcoal-muted">
                        <span className="flex items-center gap-1"><MapPin size={12} />{customer.city}</span>
                        <span>· {customer.age} yrs</span>
                        <span className="text-gold font-semibold">· {customer.annualIncomeBracket}</span>
                      </div>
                    </div>
                    <StatusBadge status={customer.status} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: Briefcase, label: 'Role', val: customer.designation, sub: customer.company },
                      { icon: GraduationCap, label: 'Education', val: customer.degree, sub: customer.college },
                      { icon: Star, label: 'Religion', val: customer.religion, sub: customer.caste },
                      { icon: Heart, label: 'Marital', val: customer.maritalStatus.replace('_',' '), sub: customer.manglik ? 'Manglik' : 'Non-Manglik' },
                    ].map(({ icon: Icon, label, val, sub }) => (
                      <div key={label} className="bg-[#F8F4EE] rounded-2xl p-3 border border-black/[0.05]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon size={11} className="text-gold" />
                          <p className="label">{label}</p>
                        </div>
                        <p className="font-body text-sm font-semibold text-charcoal capitalize leading-tight">{val}</p>
                        <p className="font-body text-xs text-charcoal-muted truncate">{sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => navigate('/customers')}
              className="flex items-center gap-1.5 text-xs font-body text-charcoal-muted hover:text-charcoal transition-colors bg-ivory border border-black/10 rounded-full px-4 py-2.5"
            >
              <ArrowLeft size={12} /> Back to Customers
            </button>
            {(['biodata', 'matches', 'notes'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body font-medium transition-all capitalize',
                  activeTab === tab
                    ? 'bg-burgundy text-white shadow-sm'
                    : 'bg-white text-charcoal-muted hover:text-charcoal hover:bg-white/80 border border-black/10'
                )}
              >
                {tab === 'matches' && <Heart size={13} />}
                {tab === 'notes' && <StickyNote size={13} />}
                {tab === 'biodata' && <GraduationCap size={13} />}
                {tab === 'matches' ? `Matches` : tab === 'notes' ? `Notes (${notes.length})` : 'Biodata'}
              </button>
            ))}
          </div>

          {/* BIODATA TAB */}
          {activeTab === 'biodata' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
              <div className="card p-6">
                <h2 className="font-display text-charcoal text-lg font-semibold mb-4">Personal Details</h2>
                <div className="grid grid-cols-2 gap-3">
                  <InfoBlock label="Date of Birth" value={customer.dateOfBirth} />
                  <InfoBlock label="Height" value={`${customer.height} cm`} />
                  <InfoBlock label="Mother Tongue" value={customer.motherTongue} />
                  <InfoBlock label="Siblings" value={customer.siblings} />
                  <InfoBlock label="Family Type" value={customer.familyType} />
                  <InfoBlock label="Complexion" value={customer.complexion} />
                  <div className="col-span-2"><InfoBlock label="Languages" value={customer.languages} /></div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-display text-charcoal text-lg font-semibold mb-4">Lifestyle & Values</h2>
                <div className="grid grid-cols-2 gap-3">
                  <InfoBlock label="Diet" value={customer.diet} />
                  <InfoBlock label="Smoking" value={customer.smoking ? 'Yes' : 'No'} />
                  <InfoBlock label="Drinking" value={customer.drinking ? 'Yes' : 'No'} />
                  <InfoBlock label="Manglik" value={customer.manglik ? 'Yes' : 'No'} />
                  <InfoBlock label="Wants Kids" value={customer.wantKids} />
                  <InfoBlock label="Open to Pets" value={customer.openToPets} />
                  <InfoBlock label="Relocate" value={customer.openToRelocate} />
                  <InfoBlock label="Body Type" value={customer.bodyType} />
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-display text-charcoal text-lg font-semibold mb-4">Contact Information</h2>
                <div className="space-y-3">
                  {[
                    { Icon: Mail, label: 'Email', val: customer.email },
                    { Icon: Phone, label: 'Phone', val: `+91 ${customer.phone}` },
                  ].map(({ Icon, label, val }) => (
                    <div key={label} className="flex items-center gap-3 bg-[#F8F4EE] rounded-2xl p-3 border border-black/[0.05]">
                      <div className="w-8 h-8 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon size={13} className="text-gold" />
                      </div>
                      <div>
                        <p className="label">{label}</p>
                        <p className="font-body text-sm text-charcoal font-medium">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-display text-charcoal text-lg font-semibold mb-4">Career & Education</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-[#F8F4EE] rounded-2xl p-3 border border-black/[0.05]">
                    <div className="w-8 h-8 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase size={13} className="text-gold" />
                    </div>
                    <div>
                      <p className="label">Current Role</p>
                      <p className="font-body text-sm font-semibold text-charcoal">{customer.designation}</p>
                      <p className="font-body text-xs text-charcoal-muted">{customer.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[#F8F4EE] rounded-2xl p-3 border border-black/[0.05]">
                    <div className="w-8 h-8 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <GraduationCap size={13} className="text-gold" />
                    </div>
                    <div>
                      <p className="label">Education</p>
                      <p className="font-body text-sm font-semibold text-charcoal">{customer.degree}</p>
                      <p className="font-body text-xs text-charcoal-muted">{customer.college}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoBlock label="Annual Income" value={customer.annualIncomeBracket} />
                    <InfoBlock label="Income (LPA)" value={`₹${customer.income} LPA`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MATCHES TAB */}
          {activeTab === 'matches' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display text-charcoal text-xl font-semibold">
                    Suggested Matches <span className="text-charcoal-muted font-normal text-base">for {customer.firstName}</span>
                  </h2>
                  <p className="font-body text-xs text-charcoal-muted mt-1">{matches.length} matches · ranked by compatibility score</p>
                </div>
                <button onClick={() => refetchMatches()} className="flex items-center gap-1.5 btn-ghost text-xs border border-black/10">
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>

              {loadingMatches ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="card p-5 animate-pulse">
                      <div className="flex gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-black/5" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-black/5 rounded-full w-32" />
                          <div className="h-3 bg-black/5 rounded-full w-48" />
                        </div>
                      </div>
                      <div className="h-2 bg-black/5 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map((match, idx) => (
                    <div key={match.candidate.id} className="animate-fade-up" style={{ animationDelay: `${idx * 0.04}s` }}>
                      <MatchCard match={match} client={customer} matcherName={matchmaker?.name || 'Matchmaker'} rank={idx + 1} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="animate-fade-in max-w-2xl">
              <h2 className="font-display text-charcoal text-xl font-semibold mb-5">Matchmaker Notes</h2>

              <div className="card p-5 mb-5">
                <p className="label mb-2">Add a Note</p>
                <textarea
                  className="w-full bg-[#F8F4EE] border border-black/10 rounded-2xl px-4 py-3 font-body text-sm text-charcoal placeholder-charcoal-muted/60 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none transition-all"
                  rows={3}
                  placeholder="Notes from calls, meetings, preferences..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                />
                <button
                  onClick={() => noteText.trim() && addNote.mutate(noteText)}
                  disabled={!noteText.trim() || addNote.isPending}
                  className="btn-primary mt-3 text-sm flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Plus size={13} />
                  {addNote.isPending ? 'Saving...' : 'Add Note'}
                </button>
              </div>

              {notes.length === 0 ? (
                <div className="text-center py-12 text-charcoal-muted card">
                  <StickyNote size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="font-body text-sm">No notes yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map(note => (
                    <div key={note.id} className="card p-4 group">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-body text-sm text-charcoal leading-relaxed flex-1">{note.text}</p>
                        <button
                          onClick={() => deleteNote.mutate(note.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-charcoal-muted hover:text-red-500 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="font-body text-xs text-charcoal-muted mt-2">
                        {note.matchmakerName} · {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
