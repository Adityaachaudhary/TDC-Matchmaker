import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import clsx from 'clsx';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users,           label: 'Customers', path: '/customers' },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <aside className={clsx(
      'sidebar-bg text-white sticky top-0 h-screen z-30 flex flex-col flex-shrink-0 transition-all duration-300',
      sidebarOpen ? 'w-60' : 'w-16'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 min-h-[64px]">
        <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center flex-shrink-0">
          <Heart size={13} className="text-gold" />
        </div>
        {sidebarOpen && (
          <div>
            <p className="font-display text-gold text-[11px] tracking-[0.25em] uppercase font-normal leading-none">The Date Crew</p>
            <p className="font-display text-white/70 text-sm italic font-normal mt-0.5">Matchmaker</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-5 px-2 space-y-1">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
              isActive
                ? 'bg-white/15 text-gold'
                : 'text-white/50 hover:bg-white/8 hover:text-white/80'
            )}
          >
            <Icon size={17} className="flex-shrink-0" />
            {sidebarOpen && (
              <span className="font-body text-sm font-medium">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center w-full py-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/8 transition-all"
        >
          {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>
    </aside>
  );
}
