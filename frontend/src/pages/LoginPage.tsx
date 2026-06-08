import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import api from '../lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAppStore((s) => s.setAuth);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.token, res.data.matchmaker);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen login-bg flex items-center justify-center p-6">
      {/* Background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {[200, 340, 480].map((s, i) => (
          <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/8"
            style={{ width: s, height: s }} />
        ))}
      </div>

      <div className="w-full max-w-sm relative animate-fade-up">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-full bg-burgundy/10 border-2 border-burgundy/20 flex items-center justify-center mx-auto mb-5">
            <Heart size={22} className="text-burgundy" />
          </div>
          <p className="font-body text-xs tracking-[0.3em] uppercase text-charcoal-muted mb-1">The Date Crew</p>
          <h1 className="font-display text-charcoal text-4xl font-semibold">Matchmaker</h1>
          <p className="font-body text-sm text-charcoal-muted mt-2">Internal Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-card-hover border border-black/[0.06] p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label block mb-2">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@thedatecrew.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required autoFocus
              />
            </div>
            <div>
              <label className="label block mb-2">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl font-body">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm tracking-wide">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing In...</>
                : 'Sign In'}
            </button>
          </form>

          {/* Demo creds */}
          <div className="mt-6 pt-5 border-t border-black/[0.06]">
            <p className="text-xs text-charcoal-muted text-center font-body mb-3">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Priya Kapoor', role: 'Matchmaker 1', email: 'priya@thedatecrew.com', pwd: 'tdc@1234' },
                { name: 'Rahul Mehra', role: 'Matchmaker 2', email: 'rahul@thedatecrew.com', pwd: 'tdc@5678' },
              ].map(cred => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => { setEmail(cred.email); setPassword(cred.pwd); }}
                  className="bg-[#F8F4EE] border border-black/10 rounded-2xl px-3 py-2.5 text-left hover:border-gold/40 hover:bg-ivory transition-all"
                >
                  <span className="block font-body text-xs font-semibold text-charcoal">{cred.name}</span>
                  <span className="block font-body text-[10px] text-charcoal-muted">{cred.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-charcoal-muted font-body mt-6">
          © 2024 The Date Crew · Private & Confidential
        </p>
      </div>
    </div>
  );
}
