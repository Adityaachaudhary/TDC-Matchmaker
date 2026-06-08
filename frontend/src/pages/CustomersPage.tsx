import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, X, MapPin, Briefcase, ArrowRight } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import StatusBadge from '../components/ui/StatusBadge';
import api from '../lib/api';
import type { Profile } from '../types';
import clsx from 'clsx';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [search, setSearch]           = useState('');
  const [gender, setGender]           = useState('');
  const [status, setStatus]           = useState('');
  const [religion, setReligion]       = useState('');
  const [city, setCity]               = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then(r => r.data),
  });

  const customers: Profile[] = data?.customers || [];

  const uniqueReligions = [...new Set(customers.map(c => c.religion))].sort();
  const uniqueCities    = [...new Set(customers.map(c => c.city))].sort();

  const filtered = customers.filter(c => {
    const name = `${c.firstName} ${c.lastName} ${c.designation} ${c.city}`.toLowerCase();
    return (
      (!search   || name.includes(search.toLowerCase())) &&
      (!gender   || c.gender === gender) &&
      (!status   || c.status === status) &&
      (!religion || c.religion === religion) &&
      (!city     || c.city === city)
    );
  });

  const hasFilters = search || gender || status || religion || city;
  const clearAll = () => { setSearch(''); setGender(''); setStatus(''); setReligion(''); setCity(''); };

  return (
    <div className="min-h-screen bg-[#F0EBE3] flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar
          title="Customers"
          subtitle={`${filtered.length} of ${customers.length} clients`}
        />

        <main className="flex-1 p-6 overflow-auto">

          {/* Filter bar */}
          <div className="card p-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-52">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search name, city, role..."
                  className="input-field pl-10 py-2"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Gender */}
              <div className="relative">
                <select className="select-field py-2 min-w-[130px] text-sm" value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">All Genders</option>
                  <option value="female">Women</option>
                  <option value="male">Men</option>
                </select>
                <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-muted pointer-events-none" />
              </div>

              {/* Status */}
              <div className="relative">
                <select className="select-field py-2 min-w-[140px] text-sm" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="matched">Matched</option>
                  <option value="paused">Paused</option>
                </select>
                <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-muted pointer-events-none" />
              </div>

              {/* Religion */}
              <div className="relative">
                <select className="select-field py-2 min-w-[140px] text-sm" value={religion} onChange={e => setReligion(e.target.value)}>
                  <option value="">All Religions</option>
                  {uniqueReligions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-muted pointer-events-none" />
              </div>

              {/* City */}
              <div className="relative">
                <select className="select-field py-2 min-w-[140px] text-sm" value={city} onChange={e => setCity(e.target.value)}>
                  <option value="">All Cities</option>
                  {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-muted pointer-events-none" />
              </div>

              {/* Clear */}
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 text-xs font-body text-red-400 hover:text-red-600 px-3 py-2 rounded-full hover:bg-red-50 transition-all"
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card p-4 flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-black/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-black/5 rounded-full w-40" />
                    <div className="h-3 bg-black/5 rounded-full w-64" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 card">
              <p className="font-display text-charcoal text-2xl italic mb-2">No clients found</p>
              <p className="font-body text-sm text-charcoal-muted">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((customer, idx) => (
                <div
                  key={customer.id}
                  onClick={() => navigate(`/customer/${customer.id}`)}
                  className="card-hover group p-4 flex items-center gap-4 animate-fade-up"
                  style={{ animationDelay: `${Math.min(idx * 0.025, 0.4)}s` }}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={customer.profilePhoto}
                      alt={customer.firstName}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-blush object-cover"
                    />
                    <span className={clsx(
                      'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white',
                      customer.gender === 'female' ? 'bg-rose-400' : 'bg-blue-400'
                    )} />
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-display text-charcoal font-semibold text-base leading-tight">
                        {customer.firstName} {customer.lastName}
                      </h3>
                      <span className="font-body text-[11px] text-charcoal-muted bg-ivory border border-black/10 px-2 py-0.5 rounded-full">
                        {customer.age}y
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-charcoal-muted font-body flex-wrap">
                      <span className="flex items-center gap-1"><Briefcase size={10} />{customer.designation}</span>
                      <span className="flex items-center gap-1"><MapPin size={10} />{customer.city}</span>
                      <span className="text-gold font-semibold">{customer.annualIncomeBracket}</span>
                    </div>
                  </div>

                  {/* Religion */}
                  <div className="hidden md:block text-right flex-shrink-0">
                    <p className="font-body text-xs font-semibold text-charcoal">{customer.religion}</p>
                    <p className="font-body text-xs text-charcoal-muted">{customer.caste}</p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    <StatusBadge status={customer.status} />
                  </div>

                  {/* Arrow */}
                  <ArrowRight size={15} className="text-charcoal-muted group-hover:text-gold transition-colors flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
