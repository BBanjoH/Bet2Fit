'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, DollarSign, Trophy, Target, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import type { Bet, Profile } from '@/lib/types';

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: p }, { data: b }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('bets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ]);
      setProfile(p);
      setBets(b || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

  const activeBets = bets.filter(b => b.status === 'active');
  const wonBets = bets.filter(b => b.status === 'won');

  const stats = [
    { label: 'Total Staked', value: formatCurrency(profile?.total_staked || 0), icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Bets', value: activeBets.length.toString(), icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Won', value: formatCurrency(profile?.total_won || 0), icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Wallet Balance', value: formatCurrency(profile?.wallet_balance || 0), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile?.full_name?.split(' ')[0] || 'Champ'} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s your fitness betting overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Recent Bets</h2>
              <Link href="/my-bets" className="text-green-600 text-sm hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {bets.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No bets yet. Place your first bet!</p>
                <Link href="/place-bet" className="mt-3 inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                  Place a Bet
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bets.slice(0, 4).map(bet => (
                  <div key={bet.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{bet.name || `${bet.current_weight}${bet.unit} → ${bet.target_weight}${bet.unit}`}</div>
                      <div className="text-xs text-gray-500">{bet.start_date ? formatDate(bet.start_date) : 'Not started'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{formatCurrency(bet.stake_amount)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getStatusColor(bet.status)}`}>
                        {bet.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/place-bet" className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Target className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Place New Bet</span>
              </Link>
              <Link href="/check-in" className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Submit Check-In</span>
              </Link>
              <Link href="/leaderboard" className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">View Leaderboard</span>
              </Link>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-green-600 to-green-700 border-0">
            <h3 className="font-semibold text-white mb-2">Tip of the Day</h3>
            <p className="text-green-100 text-sm">Weigh yourself at the same time each morning for the most consistent results.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
