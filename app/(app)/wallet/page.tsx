'use client';
import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Loader2, CreditCard, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate, SUBSCRIPTION_PLANS } from '@/lib/utils';
import type { Transaction, Profile } from '@/lib/types';

declare global {
  interface Window { FlutterwaveCheckout: (config: unknown) => void; }
}

export default function WalletPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'subscribe'>('overview');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: p }, { data: t }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ]);
      setProfile(p);
      setTransactions(t || []);
      setLoading(false);
    }
    load();
  }, []);

  const handleSubscribe = async (planId: string, amount: number) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !profile) return;
    const txRef = `betfit-sub-${Date.now()}`;
    if (typeof window.FlutterwaveCheckout === 'function') {
      window.FlutterwaveCheckout({
        public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
        tx_ref: txRef,
        amount,
        currency: 'USD',
        payment_options: 'card,banktransfer',
        customer: { email: profile.email || user.email, name: profile.full_name || 'User' },
        callback: async (resp: { status: string }) => {
          if (resp.status === 'successful') {
            await supabase.from('subscriptions').insert({
              user_id: user.id, plan: planId, amount, currency: 'USD',
              status: 'active', expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
            });
            await supabase.from('profiles').update({ subscription_tier: planId }).eq('id', user.id);
            await supabase.from('transactions').insert({
              user_id: user.id, type: 'subscription', amount, currency: 'USD',
              reference: txRef, status: 'completed', description: `${planId} plan subscription`,
            });
            setProfile(prev => prev ? { ...prev, subscription_tier: planId as any } : prev);
            setActiveTab('overview');
          }
        },
        onclose: () => {},
        customizations: { title: 'BetFit Subscription', description: `${planId} Plan — Monthly` },
      });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

  const typeIcon = (type: string) => type === 'win' || type === 'deposit' ? TrendingUp : TrendingDown;
  const typeColor = (type: string) => type === 'win' || type === 'deposit' || type === 'refund' ? 'text-green-600' : 'text-red-500';
  const typeSign = (type: string) => type === 'win' || type === 'deposit' || type === 'refund' ? '+' : '-';

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-7 h-7 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-500 text-sm">Manage your balance and subscription.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 md:col-span-2 bg-gradient-to-br from-green-600 to-green-700 border-0 text-white">
          <p className="text-green-200 text-sm mb-1">Available Balance</p>
          <p className="text-4xl font-bold mb-4">{formatCurrency(profile?.wallet_balance || 0)}</p>
          <div className="flex gap-3">
            <button className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
              Withdraw
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <div className="card p-4">
            <div className="text-xs text-gray-500 mb-1">Total Won</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(profile?.total_won || 0)}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-gray-500 mb-1">Total Staked</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(profile?.total_staked || 0)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border mb-6">
        <div className="flex">
          {[{ key: 'overview', label: 'Transactions' }, { key: 'subscribe', label: 'Subscription' }].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key as any)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === t.key ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'
              }`}>{t.label}</button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <div className="card p-12 text-center">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions yet.</p>
            </div>
          ) : transactions.map(tx => {
            const Icon = typeIcon(tx.type);
            return (
              <div key={tx.id} className="card p-4 flex items-center gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  tx.type === 'win' || tx.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Icon className={`w-5 h-5 ${typeColor(tx.type)}`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 capitalize">{tx.type}</div>
                  <div className="text-xs text-gray-500">{tx.description || tx.type} · {formatDate(tx.created_at)}</div>
                </div>
                <div className={`font-bold ${typeColor(tx.type)}`}>
                  {typeSign(tx.type)}{formatCurrency(tx.amount)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'subscribe' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUBSCRIPTION_PLANS.filter(p => p.id !== 'free').map(plan => (
            <div key={plan.id} className={`card p-6 ${
              profile?.subscription_tier === plan.id ? 'border-green-400 ring-2 ring-green-400' : ''
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                {profile?.subscription_tier === plan.id && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Current</span>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">${plan.price}<span className="text-sm font-normal text-gray-500">/mo</span></div>
              <ul className="space-y-2 mb-5 mt-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id, plan.price)}
                disabled={profile?.subscription_tier === plan.id}
                className="btn-primary w-full py-2.5 text-sm disabled:opacity-50">
                {profile?.subscription_tier === plan.id ? 'Current Plan' : `Subscribe — $${plan.price}/mo`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
