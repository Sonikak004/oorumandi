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

  if (profile?.role !== 'VENDOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch orders with nested items and branches
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      order_items (
        id,
        quantity,
        status,
        product_name,
        variant,
        estimated_delivery_time,
        branches (
          name
        )
      )
    `)
    .eq('vendor_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform data to match previous structure for the frontend
  const transformedOrders = orders.map(order => ({
    id: order.id,
    createdAt: order.created_at,
    items: order.order_items.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      status: item.quantity === 0 ? 'CANCELLED' : item.status,
      product_name: item.product_name,
      variant: item.variant,
      estimatedDeliveryTime: item.estimated_delivery_time,
      branch: { name: item.branches?.name || 'Unknown' }
    }))
  }));

  return NextResponse.json(transformedOrders);
}
