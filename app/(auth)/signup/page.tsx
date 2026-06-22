'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scale, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await createClient().auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    });
    if (error) { setError(error.message); setLoading(false); }
    else router.push('/dashboard');
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Scale className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1 text-sm">Start betting on your fitness goals today</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
              className="input" placeholder="John Doe" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="input" placeholder="Min 8 characters" minLength={8} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Create Account
          </button>
        </form>
        <p className="text-center text-xs text-gray-500 mt-4">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
        <p className="text-center text-sm text-gray-600 mt-3">
          Already have an account?{' '}
          <Link href="/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
