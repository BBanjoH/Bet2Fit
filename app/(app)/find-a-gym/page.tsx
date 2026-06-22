'use client';
import { useEffect, useState } from 'react';
import { MapPin, Star, Phone, Globe, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Gym } from '@/lib/types';

export default function FindAGymPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('gyms').select('*').order('rating', { ascending: false });
      setGyms(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = gyms.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.city || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.country || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="w-7 h-7 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find a Gym</h1>
          <p className="text-gray-500 text-sm">Verified gyms near you for your fitness journey.</p>
        </div>
      </div>

      <div className="mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input" placeholder="Search by gym name or city..." />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(gym => (
            <div key={gym.id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{gym.name}</h3>
                {gym.verified && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">✓ Verified</span>}
              </div>
              {gym.rating && (
                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(gym.rating!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{gym.rating}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {gym.address ? `${gym.address}, ` : ''}{gym.city}, {gym.country}
              </div>
              {gym.phone && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />{gym.phone}
                </div>
              )}
              {gym.website && (
                <a href={gym.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-green-600 hover:underline">
                  <Globe className="w-3.5 h-3.5" />Visit Website
                </a>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 card p-12 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No gyms found for &quot;{search}&quot;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
