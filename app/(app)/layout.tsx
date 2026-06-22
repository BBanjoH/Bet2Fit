import Sidebar from '@/components/Sidebar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = supabase.auth.getUser() as any;

  // Middleware handles redirect but server double-check
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 pt-16 lg:pt-4">
          {children}
        </div>
      </main>
    </div>
  );
}
