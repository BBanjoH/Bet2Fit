'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Loader2, AlertCircle, Eye } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { formatDate, avatarUrl } from '@/lib/utils';
import type { CheckIn, Profile } from '@/lib/types';

interface CheckInWithDetails extends CheckIn {
  bets: { name: string | null; current_weight: number; target_weight: number; unit: string; } | null;
  profiles: Profile | null;
}

export default function AdminPage() {
  const [checkIns, setCheckIns] = useState<CheckInWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      setIsAdmin(p?.is_admin || false);
      if (p?.is_admin) {
        const { data } = await supabase.from('check_ins')
          .select('*, bets(name, current_weight, target_weight, unit), profiles(id, full_name, avatar_url, email)')
          .eq('verification_status', 'pending')
          .order('created_at', { ascending: false });
        setCheckIns(data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleVerify = async (checkInId: string, betId: string, status: 'approved' | 'rejected') => {
    setProcessing(checkInId);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('check_ins').update({
      verification_status: status,
      verified_at: new Date().toISOString(),
      verified_by: user.id,
    }).eq('id', checkInId);
    if (status === 'approved') {
      const { data: ci } = await supabase.from('check_ins').select('weight, unit, user_id, bets(target_weight, current_weight, win_amount, stake_amount)').eq('id', checkInId).single() as any;
      if (ci && ci.bets) {
        const reached = parseFloat(ci.weight) <= parseFloat(ci.bets.target_weight);
        if (reached) {
          await supabase.from('bets').update({ status: 'won', weight_lost: ci.bets.current_weight - ci.weight, progress_pct: 100 }).eq('id', betId);
          await supabase.from('profiles').update({ total_won: supabase.rpc('increment' as any), wallet_balance: supabase.rpc('increment' as any) }).eq('id', ci.user_id);
          await supabase.from('transactions').insert({ user_id: ci.user_id, type: 'win', amount: ci.bets.win_amount, currency: 'USD', status: 'completed', description: 'Bet won!' });
        }
      }
    }
    setCheckIns(prev => prev.filter(c => c.id !== checkInId));
    setProcessing(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

  if (!isAdmin) return (
    <div className="max-w-md mx-auto">
      <div className="card p-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-500 text-sm">You need admin privileges to access this page.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-7 h-7 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm">{checkIns.length} pending check-ins to review.</p>
        </div>
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <img src={selectedPhoto} alt="" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}

      {checkIns.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-500">All caught up! No pending check-ins.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {checkIns.map(ci => (
            <div key={ci.id} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={avatarUrl(ci.profiles?.full_name || null, ci.profiles?.avatar_url || null)}
                  alt="" width={40} height={40} className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{ci.profiles?.full_name || 'Unknown User'}</div>
                  <div className="text-xs text-gray-500">{ci.profiles?.email} · {formatDate(ci.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{ci.weight} {ci.unit}</div>
                  <div className="text-xs text-gray-500">Reported weight</div>
                </div>
              </div>

              {ci.bets && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                  <div className="font-medium text-gray-700">{ci.bets.name || `Bet: ${ci.bets.current_weight}${ci.bets.unit} → ${ci.bets.target_weight}${ci.bets.unit}`}</div>
                  <div className="text-gray-500">Target: {ci.bets.target_weight} {ci.bets.unit}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                {ci.scale_photo_url && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Scale Photo</div>
                    <button onClick={() => setSelectedPhoto(ci.scale_photo_url!)}>
                      <img src={ci.scale_photo_url} alt="Scale" className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity" />
                    </button>
                  </div>
                )}
                {ci.selfie_photo_url && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Selfie Photo</div>
                    <button onClick={() => setSelectedPhoto(ci.selfie_photo_url!)}>
                      <img src={ci.selfie_photo_url} alt="Selfie" className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity" />
                    </button>
                  </div>
                )}
                {!ci.scale_photo_url && !ci.selfie_photo_url && (
                  <div className="col-span-2 text-center text-gray-400 text-sm py-4">No photos uploaded</div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleVerify(ci.id, ci.bet_id, 'rejected')}
                  disabled={processing === ci.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => handleVerify(ci.id, ci.bet_id, 'approved')}
                  disabled={processing === ci.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50">
                  {processing === ci.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
