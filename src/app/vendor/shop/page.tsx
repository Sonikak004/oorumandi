import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import OrderClientView from './OrderClientView';

export default async function ShopPage({ searchParams }: { searchParams: { cat?: string, search?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  
  const { data: branches } = await supabase
    .from('branches')
    .select('*')
    .eq('vendor_id', user.id)
    .order('name');

  return <OrderClientView branches={branches || []} initialCategory={searchParams.cat || 'vegetables'} initialSearch={searchParams.search || ''} />;
}
