'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, TrendingUp, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import type { Bet } from '@/lib/types';

const TABS = ['active', 'pending', 'won', 'lost'] as const;
type Tab = typeof TABS[number];

export default function MyBetsPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('active');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('bets').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setBets(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = bets.filter(b => b.status === tab);
  const counts = TABS.reduce((acc, t) => ({ ...acc, [t]: bets.filter(b => b.status === t).length }), {} as Record<Tab, number>);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bets</h1>
          <p className="text-gray-500 text-sm">{bets.length} total bets</p>
        </div>
        <Link href="/place-bet" className="btn-primary px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> New Bet
        </Link>
      </div>

      <div className="bg-white rounded-xl border mb-6">
        <div className="flex">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                tab === t ? 'bg-white border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t} ({counts[t]})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No {tab} bets yet.</p>
          {tab === 'active' && (
            <Link href="/place-bet" className="mt-3 inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Place Your First Bet
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(bet => (
            <BetCard key={bet.id} bet={bet} />
          ))}
        </div>
      )}
    </div>
  );
}

function BetCard({ bet }: { bet: Bet }) {
  const weightLost = bet.current_weight - (bet.current_weight_latest || bet.current_weight);
  const totalToLose = bet.current_weight - bet.target_weight;
  const progress = totalToLose > 0 ? Math.min(100, Math.round((weightLost / totalToLose) * 100)) : 0;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{bet.name || `${bet.current_weight}${bet.unit} → ${bet.target_weight}${bet.unit}`}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {bet.start_date ? formatDate(bet.start_date) : 'Pending'} — {bet.end_date ? formatDate(bet.end_date) : 'TBD'}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 capitalize ${getStatusColor(bet.status)}`}>
          ↗️ {bet.status}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{weightLost.toFixed(1)} {bet.unit} lost</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex gap-4">
        <div>
          <div className="text-xs text-gray-500">Stake</div>
          <div className="font-bold text-gray-900">{formatCurrency(bet.stake_amount)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Win</div>
          <div className="font-bold text-green-600">{formatCurrency(bet.win_amount)}</div>
        </div>
      </div>
    </div>
  );
}
