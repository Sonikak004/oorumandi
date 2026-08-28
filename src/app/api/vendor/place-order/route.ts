import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { cart } = await request.json();
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Create a single order for this checkout session
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ vendor_id: user.id })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert order items for each product and branch
    const orderItemsToInsert = [];
    
    for (const [productId, cartItem] of Object.entries(cart as any)) {
      const { product, branches } = cartItem as any;
      
      for (const [branchId, quantity] of Object.entries(branches)) {
        if (quantity as number > 0) {
          orderItemsToInsert.push({
            order_id: order.id,
            branch_id: branchId,
            quantity: quantity,
            product_name: product.name,
            variant: product.variant,
            status: 'PENDING'
          });
        }
      }
    }

    if (orderItemsToInsert.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);
        
      if (itemsError) throw itemsError;
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error('Error placing order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
