import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Users, Heart, TrendingUp, Clock, ArrowRight, Star } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { useAppStore } from '../store/useAppStore';
import api from '../lib/api';
import type { Profile } from '../types';
import StatusBadge from '../components/ui/StatusBadge';

export default function DashboardPage() {
  const matchmaker = useAppStore((s) => s.matchmaker);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then(r => r.data),
  });

  const customers: Profile[] = data?.customers || [];

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    matched: customers.filter(c => c.status === 'matched').length,
    onHold: customers.filter(c => c.status === 'on_hold').length,
    paused: customers.filter(c => c.status === 'paused').length,
    female: customers.filter(c => c.gender === 'female').length,
    male: customers.filter(c => c.gender === 'male').length,
  };

  const recentCustomers = [...customers]
    .filter(c => c.status === 'active')
    .slice(0, 5);

  const statCards = [
    { label: 'Total Clients', value: stats.total, icon: Users, color: 'bg-blue-50 text-blue-600', bar: 'bg-blue-400' },
    { label: 'Active', value: stats.active, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-400' },
    { label: 'Matched', value: stats.matched, icon: Heart, color: 'bg-violet-50 text-violet-600', bar: 'bg-violet-400' },
    { label: 'On Hold / Paused', value: stats.onHold + stats.paused, icon: Clock, color: 'bg-amber-50 text-amber-600', bar: 'bg-amber-400' },
  ];

  return (
    <div className="min-h-screen bg-[#F0EBE3] flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar
          title={`Good day, ${matchmaker?.name?.split(' ')[0] || 'Matchmaker'} 👋`}
          subtitle="Here's what's happening with your clients today"
        />

        <main className="flex-1 p-6 overflow-auto">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
{statCards.map(({ label, value, icon: Icon, color, bar }, i) => (
               <div key={label} className="card p-5 animate-fade-up stagger-1" style={{ animationDelay: `${i * 0.07}s` }}>
                 <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
                    <Icon size={18} />
                  </div>
                  <span className="font-display text-3xl font-semibold text-charcoal">{isLoading ? '—' : value}</span>
                </div>
                <p className="font-body text-sm text-charcoal-muted">{label}</p>
                <div className="mt-3 h-1 bg-black/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full score-bar-fill ${bar}`}
                    style={{ width: stats.total ? `${(value / stats.total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gender split */}
            <div className="card p-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="font-display text-charcoal text-lg font-semibold mb-5">Client Split</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="font-body text-sm text-charcoal-muted">Women</span>
                    <span className="font-body text-sm font-semibold text-charcoal">{stats.female}</span>
                  </div>
                  <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-400 rounded-full score-bar-fill"
                      style={{ width: stats.total ? `${(stats.female / stats.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="font-body text-sm text-charcoal-muted">Men</span>
                    <span className="font-body text-sm font-semibold text-charcoal">{stats.male}</span>
                  </div>
                  <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full score-bar-fill"
                      style={{ width: stats.total ? `${(stats.male / stats.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-black/[0.06]">
                  {['active', 'matched', 'on_hold', 'paused'].map(status => {
                    const count = customers.filter(c => c.status === status).length;
                    const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={status} className="flex justify-between items-center py-1.5">
                        <StatusBadge status={status} />
                        <span className="font-body text-xs text-charcoal-muted">{count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent active clients */}
            <div className="lg:col-span-2 card p-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-charcoal text-lg font-semibold">Recently Active Clients</h2>
                <button
                  onClick={() => navigate('/customers')}
                  className="flex items-center gap-1 text-xs font-body text-gold hover:text-gold-dark transition-colors font-medium"
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-black/5" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-black/5 rounded-full w-32" />
                        <div className="h-2.5 bg-black/5 rounded-full w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentCustomers.length === 0 ? (
                <p className="font-body text-sm text-charcoal-muted text-center py-8">No active clients yet</p>
              ) : (
                <div className="space-y-1">
                  {recentCustomers.map((c, i) => (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/customer/${c.id}`)}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-ivory cursor-pointer transition-all group"
                    >
                      <img src={c.profilePhoto} alt={c.firstName} className="w-10 h-10 rounded-full border border-black/10 bg-blush flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-semibold text-charcoal truncate">{c.firstName} {c.lastName}</p>
                        <p className="font-body text-xs text-charcoal-muted truncate">{c.designation} · {c.city}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-body text-xs text-gold font-medium hidden sm:block">{c.annualIncomeBracket}</span>
                        <ArrowRight size={13} className="text-charcoal-muted group-hover:text-gold transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick insights */}
          <div className="mt-6 card p-6 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Star size={16} className="text-gold" />
              <h2 className="font-display text-charcoal text-lg font-semibold">Quick Insights</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Avg Age (Women)', value: stats.female ? Math.round(customers.filter(c=>c.gender==='female').reduce((s,c)=>s+c.age,0)/stats.female) + ' yrs' : '—' },
                { label: 'Avg Age (Men)', value: stats.male ? Math.round(customers.filter(c=>c.gender==='male').reduce((s,c)=>s+c.age,0)/stats.male) + ' yrs' : '—' },
                { label: 'Top City', value: (() => { const freq: Record<string,number> = {}; customers.forEach(c => freq[c.city] = (freq[c.city]||0)+1); return Object.entries(freq).sort((a,b)=>b[1]-a[1])[0]?.[0] || '—'; })() },
                { label: 'Religions', value: new Set(customers.map(c=>c.religion)).size + ' represented' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-ivory rounded-2xl p-4 border border-black/[0.05]">
                  <p className="label mb-1">{label}</p>
                  <p className="font-display text-charcoal text-xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
