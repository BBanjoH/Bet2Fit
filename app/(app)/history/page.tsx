'use client';
import { useEffect, useState } from 'react';
import { History, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import type { Bet } from '@/lib/types';

export default function HistoryPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('bets').select('*')
        .eq('user_id', user.id)
        .in('status', ['won', 'lost', 'completed'])
        .order('created_at', { ascending: false });
      setBets(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

  const totalWon = bets.filter(b => b.status === 'won').reduce((s, b) => s + b.win_amount, 0);
  const totalLost = bets.filter(b => b.status === 'lost').reduce((s, b) => s + b.stake_amount, 0);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <History className="w-7 h-7 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">History</h1>
          <p className="text-gray-500 text-sm">All your completed bets.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{bets.length}</div>
          <div className="text-xs text-gray-500">Total Completed</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalWon)}</div>
          <div className="text-xs text-gray-500">Total Won</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{formatCurrency(totalLost)}</div>
          <div className="text-xs text-gray-500">Total Lost</div>
        </div>
      </div>

      {bets.length === 0 ? (
        <div className="card p-12 text-center">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No completed bets yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bets.map(bet => (
            <div key={bet.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{bet.name || `${bet.current_weight}${bet.unit} → ${bet.target_weight}${bet.unit}`}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{bet.start_date && formatDate(bet.start_date)} — {bet.end_date && formatDate(bet.end_date)}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getStatusColor(bet.status)}`}>
                  {bet.status}
                </span>
              </div>
              <div className="flex gap-6 mt-3">
                <div><div className="text-xs text-gray-500">Staked</div><div className="font-semibold">{formatCurrency(bet.stake_amount)}</div></div>
                <div><div className="text-xs text-gray-500">{bet.status === 'won' ? 'Won' : 'Lost'}</div>
                  <div className={`font-semibold ${bet.status === 'won' ? 'text-green-600' : 'text-red-500'}`}>
                    {bet.status === 'won' ? formatCurrency(bet.win_amount) : `-${formatCurrency(bet.stake_amount)}`}
                  </div>
                </div>
                <div><div className="text-xs text-gray-500">Lost</div><div className="font-semibold">{bet.weight_lost.toFixed(1)} {bet.unit}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
