import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { logout } from '@/app/actions';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'ADMIN') redirect('/login');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl text-blue-400 font-bold">ಊ</span>
            <span className="font-semibold text-xl tracking-tight">Oorumandi Admin</span>
          </div>
          
          <form action={logout}>
            <button type="submit" className="text-sm text-slate-300 font-medium hover:text-white transition-colors">
              Logout
            </button>
          </form>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 py-8">
        {children}
      </main>
    </div>
  );
}
