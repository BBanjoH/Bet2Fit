'use client';
import { useEffect, useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Bet } from '@/lib/types';

export default function CheckInPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedBetId, setSelectedBetId] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [scalePhoto, setScalePhoto] = useState<File | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null);
  const [scalePreview, setScalePreview] = useState('');
  const [selfiePreview, setSelfiePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const scaleRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('bets').select('*')
        .eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false });
      setBets(data || []);
      if (data?.[0]) setSelectedBetId(data[0].id);
      setLoading(false);
    }
    load();
  }, []);

  const handleFile = (file: File | null, type: 'scale' | 'selfie') => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'scale') { setScalePhoto(file); setScalePreview(url); }
    else { setSelfiePhoto(file); setSelfiePreview(url); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBetId) { setError('Please select a bet.'); return; }
    if (!weight) { setError('Please enter your current weight.'); return; }
    if (!scalePhoto) { setError('Scale photo is required for verification.'); return; }
    setError('');
    setSubmitting(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const selectedBet = bets.find(b => b.id === selectedBetId);
    const ts = Date.now();
    let scaleUrl = '', selfieUrl = '';

    try {
      if (scalePhoto) {
        const { data } = await supabase.storage.from('bet-photos')
          .upload(`${user.id}/${ts}-checkin-scale.jpg`, scalePhoto, { upsert: true });
        if (data) scaleUrl = supabase.storage.from('bet-photos').getPublicUrl(data.path).data.publicUrl;
      }
      if (selfiePhoto) {
        const { data } = await supabase.storage.from('bet-photos')
          .upload(`${user.id}/${ts}-checkin-selfie.jpg`, selfiePhoto, { upsert: true });
        if (data) selfieUrl = supabase.storage.from('bet-photos').getPublicUrl(data.path).data.publicUrl;
      }

      const { error: ciErr } = await supabase.from('check_ins').insert({
        bet_id: selectedBetId,
        user_id: user.id,
        weight: parseFloat(weight),
        unit: selectedBet?.unit || 'kg',
        scale_photo_url: scaleUrl || null,
        selfie_photo_url: selfieUrl || null,
        notes: notes || null,
        verification_status: 'pending',
      });

      if (ciErr) throw ciErr;

      // Update bet's latest weight
      const weightLost = (selectedBet?.current_weight || 0) - parseFloat(weight);
      const totalToLose = (selectedBet?.current_weight || 0) - (selectedBet?.target_weight || 0);
      const progress = totalToLose > 0 ? Math.min(100, Math.round((weightLost / totalToLose) * 100)) : 0;

      await supabase.from('bets').update({
        current_weight_latest: parseFloat(weight),
        weight_lost: Math.max(0, weightLost),
        progress_pct: Math.max(0, progress),
      }).eq('id', selectedBetId);

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

  if (success) return (
    <div className="max-w-md mx-auto">
      <div className="card p-10 text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Check-In Submitted!</h2>
        <p className="text-gray-500 text-sm mb-6">Your weigh-in is pending verification by our team. You&apos;ll be notified once approved.</p>
        <div className="flex gap-3">
          <button onClick={() => setSuccess(false)} className="btn-secondary flex-1 py-2.5 text-sm">New Check-In</button>
          <a href="/my-bets" className="btn-primary flex-1 py-2.5 text-sm">View Bets</a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Weight Check-In</h1>
        <p className="text-gray-500 text-sm">Submit a verified weigh-in to update your progress.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5">
          <label className="label">Select Bet</label>
          {bets.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">No active bets. <a href="/place-bet" className="text-green-600 hover:underline">Place a bet first.</a></p>
            </div>
          ) : (
            <select value={selectedBetId} onChange={e => setSelectedBetId(e.target.value)} className="input">
              <option value="">Choose a bet</option>
              {bets.map(b => (
                <option key={b.id} value={b.id}>{b.name || `${b.current_weight}${b.unit} → ${b.target_weight}${b.unit}`}</option>
              ))}
            </select>
          )}
        </div>

        {selectedBetId && (
          <>
            <div className="card p-5">
              <label className="label">Current Weight ({bets.find(b => b.id === selectedBetId)?.unit || 'kg'})</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                className="input" placeholder="Enter your weight" step="0.1" required />
            </div>

            <div className="card p-5 space-y-4">
              <h3 className="font-medium text-gray-900">Photo Verification</h3>
              <p className="text-xs text-gray-500">Photos ensure fair play. Scale photo is required, selfie is recommended.</p>

              <div>
                <label className="label">Scale Photo <span className="text-red-500">*</span></label>
                <input ref={scaleRef} type="file" accept="image/*" capture="environment"
                  onChange={e => handleFile(e.target.files?.[0] || null, 'scale')} className="hidden" />
                {scalePreview ? (
                  <div className="relative">
                    <img src={scalePreview} alt="Scale" className="w-full h-36 object-cover rounded-lg" />
                    <button type="button" onClick={() => { setScalePhoto(null); setScalePreview(''); }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center">✕</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => scaleRef.current?.click()}
                    className="w-full h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-green-400 transition-colors">
                    <Camera className="w-7 h-7 text-gray-400" />
                    <span className="text-xs text-gray-500">Tap to take photo of scale</span>
                  </button>
                )}
              </div>

              <div>
                <label className="label">Selfie with Scale (optional)</label>
                <input ref={selfieRef} type="file" accept="image/*" capture="user"
                  onChange={e => handleFile(e.target.files?.[0] || null, 'selfie')} className="hidden" />
                {selfiePreview ? (
                  <div className="relative">
                    <img src={selfiePreview} alt="Selfie" className="w-full h-36 object-cover rounded-lg" />
                    <button type="button" onClick={() => { setSelfiePhoto(null); setSelfiePreview(''); }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center">✕</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => selfieRef.current?.click()}
                    className="w-full h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-green-400 transition-colors">
                    <Upload className="w-7 h-7 text-gray-400" />
                    <span className="text-xs text-gray-500">Tap to take selfie</span>
                  </button>
                )}
              </div>
            </div>

            <div className="card p-5">
              <label className="label">Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                className="input h-20 resize-none" placeholder="e.g., Morning weigh-in after workout" />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Check-In'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
