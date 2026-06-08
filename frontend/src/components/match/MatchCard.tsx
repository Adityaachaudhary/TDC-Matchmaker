import { useState } from 'react';
import { MapPin, GraduationCap, Building2, CheckCircle2, AlertCircle, Send, Sparkles } from 'lucide-react';
import type { Match, Profile } from '../../types';
import api from '../../lib/api';
import clsx from 'clsx';

interface Props {
  match: Match;
  client: Profile;
  matcherName: string;
  rank: number;
}

const TIER_COLORS = {
  exceptional: 'from-amber-500 to-yellow-400',
  high: 'from-emerald-500 to-green-400',
  good: 'from-blue-500 to-sky-400',
  possible: 'from-slate-400 to-slate-300',
  low: 'from-red-400 to-rose-300',
};

const TIER_BG = {
  exceptional: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  good: 'bg-blue-50 text-blue-700 border-blue-200',
  possible: 'bg-slate-50 text-slate-600 border-slate-200',
  low: 'bg-red-50 text-red-500 border-red-200',
};

export default function MatchCard({ match, client, matcherName, rank }: Props) {
  const { candidate, score, label, tier, reasons, redFlags } = match;
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const generateIntro = async () => {
    setShowModal(true);
    if (emailDraft) return;
    setLoadingEmail(true);
    try {
      const res = await api.post('/ai/intro', { client, match: { ...candidate, score, label, reasons }, matcherName });
      setEmailDraft(res.data.email);
    } catch {
      setEmailDraft(`Dear ${client.firstName},\n\nI am pleased to introduce ${candidate.firstName} ${candidate.lastName}, a wonderful match I have found for you.\n\nWarm regards,\n${matcherName}`);
    } finally {
      setLoadingEmail(false);
    }
  };

  const getExplanation = async () => {
    if (aiExplanation) return;
    setLoadingExplanation(true);
    try {
      const res = await api.post('/ai/score-explanation', {
        client: { firstName: client.firstName },
        match: { firstName: candidate.firstName, score, label, reasons, redFlags }
      });
      setAiExplanation(res.data.explanation);
    } catch {
      setAiExplanation(`${candidate.firstName} is a ${label.toLowerCase()} for ${client.firstName} based on ${reasons.slice(0, 2).join(' and ')}.`);
    } finally {
      setLoadingExplanation(false);
    }
  };

  return (
    <>
      <div className={clsx(
        'bg-white border rounded-sm overflow-hidden transition-all duration-300',
        rank <= 3 ? 'border-gold/40 shadow-md' : 'border-gold/15 shadow-sm'
      )}>
        {/* Rank ribbon */}
        {rank <= 3 && (
          <div className={clsx('h-0.5 w-full bg-gradient-to-r', TIER_COLORS[tier])} />
        )}

        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={candidate.profilePhoto}
                alt={candidate.firstName}
                className="w-14 h-14 rounded-full border-2 border-gold/20 bg-blush"
              />
              <div className="absolute -top-1 -left-1 w-5 h-5 bg-charcoal rounded-full flex items-center justify-center">
                <span className="font-body text-ivory text-[9px] font-bold">#{rank}</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-display text-charcoal font-medium text-xl leading-tight">
                  {candidate.firstName} {candidate.lastName}
                </h3>
                <span className={clsx('flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full border font-body', TIER_BG[tier])}>
                  {label}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-charcoal-muted font-body">
                <span className="flex items-center gap-1"><MapPin size={10} />{candidate.city}, {candidate.age}y</span>
                <span className="flex items-center gap-1"><Building2 size={10} />{candidate.designation}</span>
                <span className="flex items-center gap-1"><GraduationCap size={10} />{candidate.degree}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-body text-xs text-gold font-medium">{candidate.annualIncomeBracket}</span>
                <span className="text-gold/30">·</span>
                <span className="font-body text-xs text-charcoal-muted">{candidate.religion} · {candidate.caste}</span>
                {candidate.manglik && (
                  <span className="font-body text-xs bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded-full">Manglik</span>
                )}
              </div>
            </div>
          </div>

          {/* Score bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="label">Compatibility Score</span>
              <span className="text-display text-2xl font-light text-charcoal">{score}<span className="text-sm text-charcoal-muted">/100</span></span>
            </div>
            <div className="h-1.5 bg-ivory rounded-full overflow-hidden">
              <div
                className={clsx('h-full rounded-full bg-gradient-to-r score-bar-fill', TIER_COLORS[tier])}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Expand / Collapse */}
          <button
            onClick={() => { setExpanded(!expanded); if (!expanded) getExplanation(); }}
            className="mt-3 text-xs font-body text-charcoal-muted hover:text-gold transition-colors flex items-center gap-1"
          >
            {expanded ? '▲ Less details' : '▼ View compatibility details'}
          </button>

          {expanded && (
            <div className="mt-4 space-y-3 animate-fade-in border-t border-gold/10 pt-4">
              {/* AI Explanation */}
              {(aiExplanation || loadingExplanation) && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-sm p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={11} className="text-gold" />
                    <span className="label text-gold">AI Analysis</span>
                  </div>
                  {loadingExplanation ? (
                    <div className="h-3 bg-gold/10 rounded animate-pulse w-3/4" />
                  ) : (
                    <p className="font-body text-xs text-charcoal leading-relaxed">{aiExplanation}</p>
                  )}
                </div>
              )}

              {/* Reasons */}
              {reasons.length > 0 && (
                <div>
                  <p className="label mb-2">Why they match</p>
                  <div className="space-y-1">
                    {reasons.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-body text-charcoal">
                        <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0" />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Red flags */}
              {redFlags.length > 0 && (
                <div>
                  <p className="label mb-2">Points to discuss</p>
                  <div className="space-y-1">
                    {redFlags.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-body text-amber-700">
                        <AlertCircle size={11} className="text-amber-500 flex-shrink-0" />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* More profile info */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { label: 'Diet', value: candidate.diet },
                  { label: 'Family', value: candidate.familyType },
                  { label: 'Kids', value: candidate.wantKids },
                  { label: 'Relocate', value: candidate.openToRelocate },
                  { label: 'Pets', value: candidate.openToPets },
                  { label: 'Marital', value: candidate.maritalStatus.replace('_', ' ') },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="label mb-0.5">{label}</p>
                    <p className="font-body text-xs text-charcoal capitalize">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={generateIntro}
              className="flex-1 flex items-center justify-center gap-1.5 bg-burgundy text-ivory text-xs font-body font-medium py-2.5 rounded-sm hover:bg-burgundy-light transition-colors tracking-wide"
            >
              <Send size={12} />
              Send Match
            </button>
            <button
              onClick={() => { setExpanded(!expanded); if (!expanded) getExplanation(); }}
              className="flex items-center justify-center gap-1.5 border border-gold/30 text-charcoal-muted text-xs font-body py-2.5 px-4 rounded-sm hover:border-gold hover:text-gold transition-colors"
            >
              <Sparkles size={12} />
              AI Details
            </button>
          </div>
        </div>
      </div>

      {/* Send Match Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-burgundy/10 rounded-2xl flex items-center justify-center">
                <Send size={16} className="text-burgundy" />
              </div>
              <div>
                <h2 className="font-display text-charcoal text-xl font-semibold">Send Introduction</h2>
                <p className="font-body text-xs text-charcoal-muted">{candidate.firstName} → {client.firstName}</p>
              </div>
            </div>
            <div className="bg-[#F8F4EE] border border-black/[0.06] rounded-2xl p-5 mb-6 max-h-60 overflow-y-auto">
              {loadingEmail
                ? <div className="space-y-2">{[...Array(5)].map((_,i) => <div key={i} className={`h-3 bg-black/5 rounded-full animate-pulse`} style={{width:`${85-i*10}%`}}/>)}</div>
                : <p className="font-body text-sm text-charcoal leading-relaxed whitespace-pre-wrap">{emailDraft}</p>}
            </div>
            <div className="flex gap-3">
              <button className="flex-1 btn-primary text-sm"
                onClick={() => { alert(`Introduction sent to ${client.firstName} ✓`); setShowModal(false); }}>
                Confirm & Send
              </button>
              <button className="btn-ghost text-sm" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
