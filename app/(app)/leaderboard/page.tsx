'use client';
import { useEffect, useState } from 'react';
import { Trophy, Loader2, Medal } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, avatarUrl } from '@/lib/utils';
import Image from 'next/image';

const TABS = [
  { key: 'weight', label: 'Most Lost' },
  { key: 'wins', label: 'Most Wins' },
  { key: 'earnings', label: 'Top Earners' },
] as const;
type TabKey = typeof TABS[number]['key'];

interface Entry {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  value: number;
  label: string;
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<TabKey>('weight');
  const [data, setData] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createClient();

      if (tab === 'weight') {
        const { data: bets } = await supabase
          .from('bets').select('user_id, weight_lost, unit, profiles(id, full_name, avatar_url)')
          .eq('status', 'won').order('weight_lost', { ascending: false }).limit(20);
        const entries: Entry[] = (bets || []).map((b: any) => ({
          id: b.user_id,
          full_name: b.profiles?.full_name,
          avatar_url: b.profiles?.avatar_url,
          value: b.weight_lost,
          label: `${b.weight_lost.toFixed(1)} ${b.unit}`,
        }));
        setData(entries);
      } else if (tab === 'wins') {
        const { data: profiles } = await supabase
          .from('bets').select('user_id, profiles(id, full_name, avatar_url)')
          .eq('status', 'won');
        const map: Record<string, { profile: any; count: number }> = {};
        (profiles || []).forEach((b: any) => {
          const uid = b.user_id;
          if (!map[uid]) map[uid] = { profile: b.profiles, count: 0 };
          map[uid].count++;
        });
        const entries = Object.entries(map)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 20)
          .map(([id, { profile, count }]) => ({
            id, full_name: profile?.full_name, avatar_url: profile?.avatar_url,
            value: count, label: `${count} win${count !== 1 ? 's' : ''}`,
          }));
        setData(entries);
      } else {
        const { data: profiles } = await supabase
          .from('profiles').select('id, full_name, avatar_url, total_won')
          .order('total_won', { ascending: false }).limit(20);
        const entries: Entry[] = (profiles || []).map((p: any) => ({
          id: p.id, full_name: p.full_name, avatar_url: p.avatar_url,
          value: p.total_won, label: formatCurrency(p.total_won),
        }));
        setData(entries);
      }
      setLoading(false);
    }
    load();
  }, [tab]);

  const medalColor = (i: number) => i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-300';

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-7 h-7 text-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-500 text-sm">Top performers across the BetFit community.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border mb-6">
        <div className="flex">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t.key ? 'bg-white border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
      ) : data.length === 0 ? (
        <div className="card p-12 text-center">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No entries yet. Be the first to win!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((entry, i) => (
            <div key={`${entry.id}-${i}`}
              className={`card p-4 flex items-center gap-4 ${
                i === 0 ? 'border-yellow-200 bg-yellow-50' : ''
              }`}>
              <div className="w-8 text-center">
                {i < 3 ? (
                  <Medal className={`w-6 h-6 mx-auto ${medalColor(i)}`} />
                ) : (
                  <span className="text-gray-400 font-bold text-sm">{i + 1}</span>
                )}
              </div>
              <Image
                src={avatarUrl(entry.full_name, entry.avatar_url)}
                alt={entry.full_name || 'User'}
                width={36} height={36}
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">{entry.full_name || 'Anonymous'}</div>
              </div>
              <div className={`font-bold text-sm ${i === 0 ? 'text-yellow-600' : 'text-gray-700'}`}>
                {entry.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
