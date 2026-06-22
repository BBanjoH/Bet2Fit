import Link from 'next/link';
import { Scale, DollarSign, Camera, Trophy, Users, Shield, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">BetFit</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Log in</Link>
          <Link href="/signup" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">Get Started</Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Trophy className="w-4 h-4" />
          <span>Join 10,000+ users betting on their fitness</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Bet on Yourself.<br />
          <span className="text-green-600">Win Real Money.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Stake money on your weight loss goals, verify with photo check-ins, and get paid up to 2× when you succeed.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/signup" className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-colors">
            Start Your First Bet
          </Link>
          <Link href="/login" className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors">
            Sign In
          </Link>
        </div>
      </section>

      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How BetFit Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: DollarSign, step: '1', title: 'Place Your Bet', desc: 'Set a weight goal, choose a timeframe, and stake your money. Minimum $5.' },
              { icon: Camera, step: '2', title: 'Verify Progress', desc: 'Submit weekly weigh-ins with scale photos and selfies for photo verification.' },
              { icon: Trophy, step: '3', title: 'Win Rewards', desc: 'Hit your target and win up to 2× your stake. Shorter bets = bigger rewards.' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-green-600 font-bold text-sm mb-2">Step {step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why BetFit?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Verified Check-ins', desc: 'Photo-based weight verification keeps everyone honest and accountable.' },
            { icon: Trophy, title: 'Global Leaderboard', desc: 'Compete with fitness enthusiasts worldwide and climb the rankings.' },
            { icon: Users, title: 'Community', desc: 'Share progress, motivate friends, and celebrate wins together.' },
            { icon: DollarSign, title: 'Real Rewards', desc: 'Win up to 2× your stake. Flutterwave supports 150+ currencies globally.' },
            { icon: TrendingUp, title: 'Progress Tracking', desc: 'Visual charts and analytics to track your weight loss journey.' },
            { icon: Camera, title: 'Easy Check-ins', desc: 'Quick photo uploads directly from your phone camera.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-6 rounded-xl border border-gray-100 hover:border-green-200 transition-colors">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-green-600 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to bet on yourself?</h2>
        <p className="text-green-100 mb-8 text-lg">Thousands of people across Africa and the world are transforming their fitness with real stakes.</p>
        <Link href="/signup" className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-50 transition-colors inline-block">
          Get Started Free
        </Link>
      </section>

      <footer className="text-center py-8 text-gray-500 text-sm border-t">
        © 2025 BetFit. All rights reserved. Powered by Flutterwave. | Bet responsibly.
      </footer>
    </div>
  );
}
