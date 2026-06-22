export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  country: string;
  currency: string;
  bio: string | null;
  wallet_balance: number;
  total_won: number;
  total_staked: number;
  subscription_tier: 'free' | 'basic' | 'pro' | 'premium';
  subscription_expires_at: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Bet {
  id: string;
  user_id: string;
  name: string | null;
  current_weight: number;
  target_weight: number;
  unit: 'kg' | 'lbs';
  timeframe: string;
  timeframe_days: number;
  stake_amount: number;
  currency: string;
  win_multiplier: number;
  win_amount: number;
  status: 'pending' | 'active' | 'completed' | 'won' | 'lost';
  start_date: string | null;
  end_date: string | null;
  current_weight_latest: number | null;
  weight_lost: number;
  progress_pct: number;
  initial_photo_url: string | null;
  initial_selfie_url: string | null;
  payment_reference: string | null;
  created_at: string;
  profiles?: Profile;
}

export interface CheckIn {
  id: string;
  bet_id: string;
  user_id: string;
  weight: number;
  unit: string;
  scale_photo_url: string | null;
  selfie_photo_url: string | null;
  notes: string | null;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_at: string | null;
  created_at: string;
  bets?: Bet;
  profiles?: Profile;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'stake' | 'win' | 'subscription' | 'withdrawal' | 'deposit' | 'refund';
  amount: number;
  currency: string;
  reference: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string | null;
  created_at: string;
}

export interface Gym {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  phone: string | null;
  website: string | null;
  image_url: string | null;
  verified: boolean;
}

export interface Post {
  id: string;
  user_id: string;
  bet_id: string | null;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: Profile;
}
