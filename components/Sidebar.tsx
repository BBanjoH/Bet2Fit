'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Target, TrendingUp, Scale, Trophy,
  Users, MapPin, Wallet, History, User, ShieldCheck,
  Menu, X, LogOut
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/place-bet', icon: Target, label: 'Place Bet' },
  { href: '/my-bets', icon: TrendingUp, label: 'My Bets' },
  { href: '/check-in', icon: Scale, label: 'Check-In' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/community', icon: Users, label: 'Community' },
  { href: '/find-a-gym', icon: MapPin, label: 'Find a Gym' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/admin', icon: ShieldCheck, label: 'Admin Panel' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.push('/login');
  };

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 bg-white border rounded-lg p-2 shadow-sm lg:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r flex flex-col z-50
        transition-transform duration-300 lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-base">BetFit</div>
              <div className="text-xs text-gray-500">Bet on yourself</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
