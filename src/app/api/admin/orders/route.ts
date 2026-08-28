import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all order items with nested order, branch, and vendor profile
  const { data: items, error } = await supabase
    .from('order_items')
    .select(`
      id,
      quantity,
      status,
      product_name,
      variant,
      branches ( name ),
      orders (
        created_at,
        profiles ( email )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const transformedItems = items.map((item: any) => ({
    id: item.id,
    quantity: item.quantity,
    status: item.quantity === 0 ? 'CANCELLED' : item.status,
    productName: item.product_name,
    variant: item.variant,
    branch: { name: item.branches.name },
    order: {
      createdAt: item.orders.created_at,
      vendor: { email: item.orders.profiles.email }
    }
  }));

  return NextResponse.json(transformedItems);
}
