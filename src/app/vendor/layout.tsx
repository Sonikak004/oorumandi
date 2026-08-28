import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Store, ClipboardList, User } from 'lucide-react';

export default async function VendorLayout({
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

  if (profile?.role !== 'VENDOR') redirect('/login');

  return (
    <div className="bg-[#fdf9f5] h-screen h-[100dvh] flex flex-col font-sans overflow-hidden">
      {/* Top Header */}
      <div className="bg-[#1e2235] text-white p-3 sm:p-4 border-b border-gray-800 flex-none z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/vendor" className="flex items-center gap-3 group">
               {/* Orange Logo Box */}
               <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-[#ffb347] to-[#ff7b00] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-none">
                 <span className="text-2xl sm:text-3xl text-[#1e2235] font-black -translate-y-1" style={{ lineHeight: '1' }}>ಊ</span>
               </div>
               
               {/* Title & Subtitle */}
               <div className="flex flex-col justify-center pt-0.5">
                 <span className="font-black text-[19px] sm:text-xl tracking-wide text-white leading-none mb-1">Oorumandi</span>
                 <span className="text-[11px] sm:text-xs text-[#9eb4e5] font-semibold leading-none">Fresh from your local market</span>
               </div>
            </Link>
            
            {/* Desktop Nav */}
            <div className="hidden sm:flex items-center gap-8">
              <Link href="/vendor" className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-white transition-colors">
                <Store className="w-4 h-4" /> Shop
              </Link>
              <Link href="/vendor/orders" className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-white transition-colors">
                <ClipboardList className="w-4 h-4" /> Orders
              </Link>
              <Link href="/vendor/profile" className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-white transition-colors">
                <User className="w-4 h-4" /> Profile
              </Link>
            </div>
        </div>
      </div>
      
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto bg-white sm:my-6 sm:rounded-2xl sm:shadow-sm sm:border border-gray-200 overflow-hidden relative pb-[60px] sm:pb-0">
        {children}
      </main>
      
      {/* Mobile Bottom Nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-between items-center py-2 px-6 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <Link href="/vendor" className="flex flex-col items-center gap-1 min-w-[50px] group">
          <Store className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" />
          <span className="text-[10px] font-bold text-gray-800">Shop</span>
        </Link>
        <Link href="/vendor/orders" className="flex flex-col items-center gap-1 min-w-[50px] group">
          <ClipboardList className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          <span className="text-[10px] font-medium text-gray-500">Orders</span>
        </Link>
        <Link href="/vendor/profile" className="flex flex-col items-center gap-1 min-w-[50px] group">
          <User className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          <span className="text-[10px] font-medium text-gray-500">Profile</span>
        </Link>
      </div>
    </div>
  );
}
