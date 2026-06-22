'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Camera, CheckCircle, Loader2, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TIMEFRAMES, getWinMultiplier, formatCurrency } from '@/lib/utils';

declare global {
  interface Window { FlutterwaveCheckout: (config: unknown) => void; }
}

const STEPS = ['Set Goal', 'Verify Weight', 'Confirm'];

export default function PlaceBetPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1
  const [betName, setBetName] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [unit, setUnit] = useState('kg');
  const [timeframe, setTimeframe] = useState('1_month');
  const [stakeAmount, setStakeAmount] = useState('50');

  // Step 2
  const [scalePhoto, setScalePhoto] = useState<File | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null);
  const [scalePreview, setScalePreview] = useState('');
  const [selfiePreview, setSelfiePreview] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [scalePhotoUrl, setScalePhotoUrl] = useState('');
  const [selfiePhotoUrl, setSelfiePhotoUrl] = useState('');

  const scaleInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const tf = TIMEFRAMES.find(t => t.value === timeframe) || TIMEFRAMES[2];
  const multiplier = getWinMultiplier(tf.days);
  const winAmount = parseFloat(stakeAmount || '0') * multiplier;

  const handlePhotoChange = (file: File | null, type: 'scale' | 'selfie') => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'scale') { setScalePhoto(file); setScalePreview(url); }
    else { setSelfiePhoto(file); setSelfiePreview(url); }
  };

  const uploadPhotos = async (): Promise<boolean> => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    setUploadingPhotos(true);
    try {
      const ts = Date.now();
      if (scalePhoto) {
        const { data } = await supabase.storage.from('bet-photos')
          .upload(`${user.id}/${ts}-scale.jpg`, scalePhoto, { upsert: true });
        if (data) {
          const { data: { publicUrl } } = supabase.storage.from('bet-photos').getPublicUrl(data.path);
          setScalePhotoUrl(publicUrl);
        }
      }
      if (selfiePhoto) {
        const { data } = await supabase.storage.from('bet-photos')
          .upload(`${user.id}/${ts}-selfie.jpg`, selfiePhoto, { upsert: true });
        if (data) {
          const { data: { publicUrl } } = supabase.storage.from('bet-photos').getPublicUrl(data.path);
          setSelfiePhotoUrl(publicUrl);
        }
      }
      return true;
    } catch { return false; }
    finally { setUploadingPhotos(false); }
  };

  const handleStep1Next = () => {
    if (!currentWeight || !targetWeight) { setError('Please enter current and target weight.'); return; }
    if (parseFloat(targetWeight) >= parseFloat(currentWeight)) { setError('Target weight must be less than current weight.'); return; }
    if (parseFloat(stakeAmount) < 5) { setError('Minimum stake is $5.'); return; }
    setError('');
    setStep(2);
  };

  const handleStep2Next = async () => {
    if (!scalePhoto) { setError('Please upload a photo of your scale.'); return; }
    setError('');
    const ok = await uploadPhotos();
    if (ok) setStep(3);
    else setError('Failed to upload photos. Please try again.');
  };

  const handlePayAndCreate = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('email, full_name').eq('id', user.id).single();
    const txRef = `betfit-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const createBet = async (ref: string) => {
      setLoading(true);
      const tfData = TIMEFRAMES.find(t => t.value === timeframe)!;
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + tfData.days);

      const { error: betErr } = await supabase.from('bets').insert({
        user_id: user.id,
        name: betName || null,
        current_weight: parseFloat(currentWeight),
        target_weight: parseFloat(targetWeight),
        unit,
        timeframe,
        timeframe_days: tfData.days,
        stake_amount: parseFloat(stakeAmount),
        currency: 'USD',
        win_multiplier: multiplier,
        win_amount: winAmount,
        status: 'active',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        initial_photo_url: scalePhotoUrl || null,
        initial_selfie_url: selfiePhotoUrl || null,
        payment_reference: ref,
        current_weight_latest: parseFloat(currentWeight),
      });

      if (!betErr) {
        await supabase.from('profiles').update({ total_staked: supabase.rpc('increment' as any) }).eq('id', user.id);
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'stake',
          amount: parseFloat(stakeAmount),
          currency: 'USD',
          reference: ref,
          status: 'completed',
          description: `Stake for ${betName || 'bet'}`,
        });
        router.push('/my-bets?success=1');
      } else {
        setError('Bet created but DB error: ' + betErr.message);
        setLoading(false);
      }
    };

    if (typeof window.FlutterwaveCheckout === 'function') {
      window.FlutterwaveCheckout({
        public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
        tx_ref: txRef,
        amount: parseFloat(stakeAmount),
        currency: 'USD',
        payment_options: 'card,banktransfer,ussd,mpesa,mobilemoney',
        customer: {
          email: profile?.email || user.email,
          name: profile?.full_name || 'BetFit User',
        },
        callback: (response: { status: string; transaction_id: string }) => {
          if (response.status === 'successful') createBet(txRef);
          else setError('Payment was not completed. Please try again.');
        },
        onclose: () => setLoading(false),
        customizations: {
          title: 'BetFit Stake',
          description: `Stake for ${betName || 'fitness bet'} — Win ${formatCurrency(winAmount)}`,
          logo: `${window.location.origin}/icons/icon-192.png`,
        },
      });
    } else {
      // Fallback: create bet without payment (test mode)
      createBet('test-' + txRef);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3">
          <ChevronLeft className="w-4 h-4" /> Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Place a Bet</h1>
        <p className="text-gray-500 text-sm">Set your goal, stake your money, and prove it with photos.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  done ? 'bg-green-600 text-white' : active ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {done ? <CheckCircle className="w-4 h-4" /> : n}
                </div>
                <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 ${step > n ? 'bg-green-600' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {/* Step 1 */}
      {step === 1 && (
        <div className="card p-6 space-y-4">
          <div>
            <label className="label">Bet Name (optional)</label>
            <input value={betName} onChange={e => setBetName(e.target.value)}
              className="input" placeholder="e.g., Summer shred challenge" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Current Weight</label>
              <input type="number" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)}
                className="input" placeholder="85" min="20" max="500" step="0.1" />
            </div>
            <div>
              <label className="label">Target Weight</label>
              <input type="number" value={targetWeight} onChange={e => setTargetWeight(e.target.value)}
                className="input" placeholder="80" min="20" max="500" step="0.1" />
            </div>
          </div>
          <div>
            <label className="label">Unit</label>
            <select value={unit} onChange={e => setUnit(e.target.value)} className="input">
              <option value="kg">Kilograms (kg)</option>
              <option value="lbs">Pounds (lbs)</option>
            </select>
          </div>
          <div>
            <label className="label">Timeframe</label>
            <select value={timeframe} onChange={e => setTimeframe(e.target.value)} className="input">
              {TIMEFRAMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Stake Amount (USD)</label>
            <input type="number" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)}
              className="input" placeholder="50" min="5" step="1" />
            <p className="text-xs text-green-600 mt-1">Minimum $5. Shorter bets = higher reward (up to 2×).</p>
            {stakeAmount && <p className="text-xs text-gray-500 mt-1">Win potential: <strong>{formatCurrency(winAmount)}</strong> ({multiplier}×)</p>}
          </div>
          <button onClick={handleStep1Next} className="btn-primary w-full py-3">
            Next: Verify Weight <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="card p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Verify Your Starting Weight</h3>
            <p className="text-sm text-gray-500">Upload photos for verification. These are reviewed by our team.</p>
          </div>

          <div>
            <label className="label">Scale Photo <span className="text-red-500">*</span></label>
            <p className="text-xs text-gray-400 mb-2">Take a clear photo of your scale showing {currentWeight} {unit}</p>
            <input ref={scaleInputRef} type="file" accept="image/*" capture="environment"
              onChange={e => handlePhotoChange(e.target.files?.[0] || null, 'scale')}
              className="hidden" />
            {scalePreview ? (
              <div className="relative">
                <img src={scalePreview} alt="Scale" className="w-full h-40 object-cover rounded-lg" />
                <button onClick={() => { setScalePhoto(null); setScalePreview(''); }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
              </div>
            ) : (
              <button onClick={() => scaleInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-green-400 transition-colors">
                <Camera className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">Tap to take/upload photo</span>
              </button>
            )}
          </div>

          <div>
            <label className="label">Selfie with Scale (optional but recommended)</label>
            <p className="text-xs text-gray-400 mb-2">Take a selfie standing on the scale</p>
            <input ref={selfieInputRef} type="file" accept="image/*" capture="user"
              onChange={e => handlePhotoChange(e.target.files?.[0] || null, 'selfie')}
              className="hidden" />
            {selfiePreview ? (
              <div className="relative">
                <img src={selfiePreview} alt="Selfie" className="w-full h-40 object-cover rounded-lg" />
                <button onClick={() => { setSelfiePhoto(null); setSelfiePreview(''); }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
              </div>
            ) : (
              <button onClick={() => selfieInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-green-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">Tap to take/upload selfie</span>
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handleStep2Next} disabled={uploadingPhotos} className="btn-primary flex-1 py-3">
              {uploadingPhotos ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <>Next: Confirm <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Confirm Your Bet</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
            {betName && <div className="flex justify-between text-sm"><span className="text-gray-500">Bet Name</span><span className="font-medium">{betName}</span></div>}
            <div className="flex justify-between text-sm"><span className="text-gray-500">Current Weight</span><span className="font-medium">{currentWeight} {unit}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Target Weight</span><span className="font-medium">{targetWeight} {unit}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">To Lose</span><span className="font-medium text-green-600">{(parseFloat(currentWeight) - parseFloat(targetWeight)).toFixed(1)} {unit}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Timeframe</span><span className="font-medium">{tf.label}</span></div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Stake</span><span className="font-bold text-gray-900">{formatCurrency(parseFloat(stakeAmount))}</span></div>
              <div className="flex justify-between text-sm mt-1"><span className="text-gray-500">Win Potential ({multiplier}×)</span><span className="font-bold text-green-600">{formatCurrency(winAmount)}</span></div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-sm text-green-700">
            🔒 Your stake is held securely. You win {formatCurrency(winAmount)} if you reach {targetWeight} {unit} by {new Date(Date.now() + tf.days * 86400000).toLocaleDateString()}.
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handlePayAndCreate} disabled={loading} className="btn-primary flex-1 py-3">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : `Pay ${formatCurrency(parseFloat(stakeAmount))} & Place Bet`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
