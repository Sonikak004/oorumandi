'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: 'Invalid email or password' };
  }

  // Fetch user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profile?.role === 'ADMIN') {
    redirect('/admin');
  } else {
    redirect('/vendor');
  }
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

type OrderPayloadItem = {
  productName: string;
  variant: string;
  branchId: string;
  quantity: number;
};

export async function placeOrder(items: OrderPayloadItem[], deliveryDate?: string, deliveryTime?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');
  
  if (!items || items.length === 0) {
    throw new Error('No items selected');
  }

  // Insert Order (without category)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      vendor_id: user.id
    })
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);

  let estTime = null;
  if (deliveryDate) {
    try {
      const timeStr = deliveryTime?.includes('Morning') ? '06:00:00' : deliveryTime?.includes('Evening') ? '16:00:00' : '09:00:00';
      estTime = new Date(`${deliveryDate}T${timeStr}`).toISOString();
    } catch (e) {
      console.error("Invalid date");
    }
  }

  // Insert Order Items
  const itemsToInsert = items.map(item => ({
    order_id: order.id,
    branch_id: item.branchId,
    quantity: item.quantity,
    product_name: item.productName,
    variant: item.variant,
    status: 'PENDING',
    estimated_delivery_time: estTime
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsToInsert);

  if (itemsError) throw new Error(itemsError.message);

  revalidatePath('/vendor/orders');
  revalidatePath('/admin');
  redirect('/vendor/orders');
}

export async function cancelOrder(orderId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Ensure the order belongs to the user
  const { data: order } = await supabase
    .from('orders')
    .select('vendor_id')
    .eq('id', orderId)
    .single();

  if (order?.vendor_id !== user.id) {
    throw new Error('Unauthorized order access');
  }

  // Update status of all PENDING items in the order
  const { error } = await supabase
    .from('order_items')
    .update({ quantity: 0 })
    .eq('order_id', orderId)
    .eq('status', 'PENDING');

  if (error) throw new Error(error.message);

  revalidatePath('/vendor/orders');
  return { success: true };
}

export async function updateOrderStatus(id: string, status: string, etaMinutes?: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'ADMIN') throw new Error('Unauthorized');

  const updateData: any = { status };
  
  if (etaMinutes !== undefined) {
    const etaDate = new Date();
    etaDate.setMinutes(etaDate.getMinutes() + etaMinutes);
    updateData.estimated_delivery_time = etaDate.toISOString();
  }

  const { error } = await supabase
    .from('order_items')
    .update(updateData)
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin');
  revalidatePath('/vendor/orders');
}
