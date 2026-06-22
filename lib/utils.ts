import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getWinMultiplier(timeframeDays: number): number {
  if (timeframeDays <= 7) return 2.0;
  if (timeframeDays <= 14) return 1.8;
  if (timeframeDays <= 30) return 1.6;
  if (timeframeDays <= 60) return 1.4;
  if (timeframeDays <= 90) return 1.3;
  return 1.2;
}

export const TIMEFRAMES = [
  { value: '1_week', label: '1 Week', days: 7 },
  { value: '2_weeks', label: '2 Weeks', days: 14 },
  { value: '1_month', label: '1 Month', days: 30 },
  { value: '2_months', label: '2 Months', days: 60 },
  { value: '3_months', label: '3 Months', days: 90 },
  { value: '6_months', label: '6 Months', days: 180 },
];

export const SUBSCRIPTION_PLANS = [
  { id: 'free', name: 'Free', price: 0, features: ['2 active bets', 'Basic check-ins', 'Leaderboard access'] },
  { id: 'basic', name: 'Basic', price: 4.99, features: ['5 active bets', 'Priority verification', 'Community access', 'Progress analytics'] },
  { id: 'pro', name: 'Pro', price: 9.99, features: ['Unlimited bets', 'Instant verification', 'Advanced analytics', 'No ads', 'Friend challenges'] },
  { id: 'premium', name: 'Premium', price: 19.99, features: ['Everything in Pro', 'Personal AI coach', 'Priority payouts', 'VIP leaderboard', 'Custom bet types'] },
];

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700';
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    case 'won': return 'bg-blue-100 text-blue-700';
    case 'lost': return 'bg-red-100 text-red-700';
    case 'approved': return 'bg-green-100 text-green-700';
    case 'rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export function avatarUrl(name: string | null, avatarUrl: string | null): string {
  if (avatarUrl) return avatarUrl;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=16a34a&color=fff&size=128`;
}
