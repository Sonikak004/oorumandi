import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { logout } from '@/app/actions';
import { User, LogOut } from 'lucide-react';

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  
  return (
    <div className="flex-1 overflow-y-auto bg-[#fcfcfc] font-sans">
      <div className="max-w-xl mx-auto p-5 sm:p-8">
        <h2 className="font-extrabold text-[#1a2f4c] text-2xl mb-8">My Profile</h2>
        
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <User className="w-12 h-12" />
          </div>
          <h3 className="font-extrabold text-lg text-[#1a2f4c]">{user.email?.split('@')[0]}</h3>
          <p className="text-sm font-medium text-gray-500">{user.email}</p>
        </div>
        
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <form action={logout} className="p-2">
            <button type="submit" className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-red-50 text-red-500 transition-colors group">
              <span className="font-bold">Sign Out</span>
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
