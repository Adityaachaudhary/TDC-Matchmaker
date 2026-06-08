import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, User } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export default function Navbar({ title, subtitle, right }: Props) {
  const navigate = useNavigate();
  const { matchmaker, clearAuth } = useAppStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-black/[0.06] px-6 py-0 sticky top-0 z-20 shadow-navbar min-h-[64px] flex items-center">
      <div className="flex items-center justify-between w-full gap-4">

        {/* Left — title section */}
        <div className="flex flex-col justify-center min-w-0">
          {title && (
            <h1 className="font-display text-charcoal text-xl font-semibold leading-tight truncate">{title}</h1>
          )}
          {subtitle && (
            <p className="font-body text-xs text-charcoal-muted mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Center — any extra content passed in */}
        {right && <div className="flex-1 flex justify-center">{right}</div>}

        {/* Right — user profile dropdown */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 bg-ivory border border-black/10 rounded-full pl-1.5 pr-3 py-1.5 hover:border-gold/40 hover:shadow-sm transition-all duration-200 group"
            >
              <img
                src={matchmaker?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${matchmaker?.name}`}
                alt={matchmaker?.name}
                className="w-7 h-7 rounded-full border border-gold/30 bg-blush flex-shrink-0"
              />
              <div className="text-left hidden sm:block">
                <p className="font-body text-xs font-semibold text-charcoal leading-none">{matchmaker?.name}</p>
                <p className="font-body text-[10px] text-charcoal-muted leading-none mt-0.5">Matchmaker</p>
              </div>
              <ChevronDown
                size={13}
                className={`text-charcoal-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-black/[0.08] rounded-2xl shadow-card-hover py-2 z-50 animate-fade-in">
                {/* Profile info header */}
                <div className="px-4 py-3 border-b border-black/[0.06]">
                  <div className="flex items-center gap-3">
                    <img
                      src={matchmaker?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${matchmaker?.name}`}
                      alt={matchmaker?.name}
                      className="w-10 h-10 rounded-full border-2 border-gold/30 bg-blush"
                    />
                    <div>
                      <p className="font-body text-sm font-semibold text-charcoal">{matchmaker?.name}</p>
                      <p className="font-body text-xs text-charcoal-muted">{matchmaker?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1 px-2">
                  <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-body text-charcoal-muted hover:bg-ivory hover:text-charcoal transition-all">
                    <User size={14} />
                    My Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-body text-red-500 hover:bg-red-50 transition-all mt-1"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
