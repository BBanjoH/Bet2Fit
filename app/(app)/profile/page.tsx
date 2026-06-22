'use client';
import { useEffect, useState, useRef } from 'react';
import { User, Camera, Loader2, CheckCircle, Save } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { avatarUrl } from '@/lib/utils';
import type { Profile } from '@/lib/types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const avatarRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (p) {
        setProfile(p);
        setFullName(p.full_name || '');
        setUsername(p.username || '');
        setBio(p.bio || '');
        setCountry(p.country || '');
        setCurrency(p.currency || 'USD');
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error: err } = await supabase.from('profiles').update({
      full_name: fullName, username: username || null,
      bio: bio || null, country, currency,
    }).eq('id', user.id);
    if (err) setError(err.message);
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  };

  const handleAvatarChange = async (file: File) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.storage.from('bet-photos').upload(`${user.id}/avatar.jpg`, file, { upsert: true });
    if (data) {
      const url = supabase.storage.from('bet-photos').getPublicUrl(data.path).data.publicUrl;
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
      setProfile(prev => prev ? { ...prev, avatar_url: url } : prev);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-7 h-7 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500 text-sm">Manage your account settings.</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      {saved && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />Profile saved!</div>}

      <div className="card p-6 mb-5">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Image
              src={avatarUrl(fullName, profile?.avatar_url || null)}
              alt="Avatar"
              width={72} height={72}
              className="w-18 h-18 rounded-full object-cover w-16 h-16"
            />
            <button onClick={() => avatarRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-green-600 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-green-700">
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); }} />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg">{fullName || profile?.email}</div>
            <div className="text-gray-500 text-sm">{profile?.email}</div>
            <div className="text-xs text-green-600 mt-1 capitalize">{profile?.subscription_tier} Plan</div>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} className="input" placeholder="John Doe" />
          </div>
          <div>
            <label className="label">Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} className="input" placeholder="@handle" />
          </div>
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} className="input h-20 resize-none" placeholder="Tell the community about your fitness journey..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Country</label>
            <input value={country} onChange={e => setCountry(e.target.value)} className="input" placeholder="Nigeria" />
          </div>
          <div>
            <label className="label">Preferred Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="input">
              <option value="USD">USD ($)</option>
              <option value="NGN">NGN (₦)</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
              <option value="KES">KES (KSh)</option>
              <option value="GHS">GHS (₵)</option>
              <option value="ZAR">ZAR (R)</option>
            </select>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary py-2.5 px-6">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
