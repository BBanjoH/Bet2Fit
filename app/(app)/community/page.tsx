'use client';
import { useEffect, useState, useRef } from 'react';
import { Heart, MessageCircle, Send, Loader2, Users } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { timeAgo, avatarUrl } from '@/lib/utils';
import type { Post } from '@/lib/types';

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [userId, setUserId] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
    const { data } = await supabase.from('posts')
      .select('*, profiles(id, full_name, avatar_url)')
      .order('created_at', { ascending: false }).limit(30);
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    let imageUrl = '';
    if (imageFile) {
      const { data } = await supabase.storage.from('bet-photos')
        .upload(`${user.id}/${Date.now()}-post.jpg`, imageFile, { upsert: true });
      if (data) imageUrl = supabase.storage.from('bet-photos').getPublicUrl(data.path).data.publicUrl;
    }
    await supabase.from('posts').insert({ user_id: user.id, content, image_url: imageUrl || null });
    setContent('');
    setImageFile(null);
    setImagePreview('');
    await load();
    setPosting(false);
  };

  const handleLike = async (postId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
    if (!error) {
      await supabase.from('posts').update({ likes_count: supabase.rpc('increment' as any) }).eq('id', postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-7 h-7 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-500 text-sm">Share your progress and motivate others.</p>
        </div>
      </div>

      <div className="card p-5 mb-6">
        <textarea value={content} onChange={e => setContent(e.target.value)}
          className="input h-20 resize-none mb-3" placeholder="Share your progress, tips, or wins... 💪" />
        {imagePreview && (
          <div className="relative mb-3">
            <img src={imagePreview} alt="" className="h-32 rounded-lg object-cover" />
            <button onClick={() => { setImageFile(null); setImagePreview(''); }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
          }} />
        <div className="flex items-center justify-between">
          <button onClick={() => fileRef.current?.click()} className="text-gray-400 hover:text-green-600 text-sm">+ Photo</button>
          <button onClick={handlePost} disabled={posting || !content.trim()} className="btn-primary px-5 py-2 text-sm">
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Post</>}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => {
            const profile = post.profiles as any;
            return (
              <div key={post.id} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Image src={avatarUrl(profile?.full_name, profile?.avatar_url)} alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{profile?.full_name || 'BetFit User'}</div>
                    <div className="text-xs text-gray-500">{timeAgo(post.created_at)}</div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm mb-3">{post.content}</p>
                {post.image_url && <img src={post.image_url} alt="" className="w-full rounded-lg mb-3 max-h-64 object-cover" />}
                <div className="flex items-center gap-4 pt-2 border-t">
                  <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors text-sm">
                    <Heart className="w-4 h-4" /> {post.likes_count}
                  </button>
                  <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors text-sm">
                    <MessageCircle className="w-4 h-4" /> {post.comments_count}
                  </button>
                </div>
              </div>
            );
          })}
          {posts.length === 0 && (
            <div className="card p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No posts yet. Be the first to share!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
