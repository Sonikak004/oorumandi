'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cancelOrder } from '@/app/actions';
import { ShoppingBag, ArrowLeft, Package, Truck, CheckCircle2, MapPin, ChevronDown } from 'lucide-react';

type OrderItem = {
  id: string;
  quantity: number;
  status: string;
  estimatedDeliveryTime: string | null;
  product_name: string;
  variant: string;
  branch: { name: string };
};

type Order = {
  id: string;
  createdAt: string;
  items: OrderItem[];
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedOrders, setCollapsedOrders] = useState<Record<string, boolean>>({});

  const toggleOrder = (orderId: string) => {
    setCollapsedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/vendor/orders');
        if (res.ok) {
          setOrders(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000); // Poll every 3 seconds for live tracking
    return () => clearInterval(interval);
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel the pending items in this order?')) return;
    try {
      setLoading(true);
      await cancelOrder(orderId);
      const res = await fetch('/api/vendor/orders');
      if (res.ok) setOrders(await res.json());
    } catch (e) {
      alert('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  if (loading && orders.length === 0) {
    return <div className="py-8 text-center text-gray-500 font-medium text-sm flex items-center justify-center h-full min-h-[50vh]">Loading your orders...</div>;
  }

  return (
    <div className="bg-gray-100 flex-1 overflow-y-auto pb-20 sm:pb-8 sm:bg-white">
      {/* Top Header section */}
      <div className="bg-white px-4 py-4 sm:py-6 sticky top-0 z-40 border-b border-gray-100 flex items-center gap-3 shadow-sm sm:shadow-none sm:rounded-t-2xl">
        <Link href="/vendor" className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg sm:text-xl font-extrabold text-[#1a2f4c] leading-tight">Your Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 text-center px-4 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
             <ShoppingBag className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-[#1a2f4c]">No Orders Yet</h2>
          <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">Your order history will appear here once you place an order.</p>
          <Link href="/vendor/shop" className="mt-6 font-bold text-[#ef4f5f] bg-red-50 px-6 py-2.5 rounded-full hover:bg-red-100 transition-colors">Go to Shop</Link>
        </div>
      ) : (
        <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
          {orders.map(order => {
            // Group items by branch
            const groupedByBranch = order.items.reduce((acc, item) => {
              const bName = item.branch.name || 'Unknown Branch';
              if (!acc[bName]) acc[bName] = [];
              acc[bName].push(item);
              return acc;
            }, {} as Record<string, OrderItem[]>);

            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 sm:border-gray-200">
                <div 
                  className="px-4 py-3 flex flex-row justify-between items-center bg-[#fcfcfc] border-b border-gray-100 gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOrder(order.id)}
                >
                  <div>
                    <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest block mb-0.5">Order #{order.id.slice(0, 8)}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-gray-600">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-auto">
                    {order.items.some(item => item.status === 'PENDING') && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.id); }}
                        className="text-[10px] sm:text-xs font-extrabold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-1.5 rounded-full transition-colors border border-red-200 shadow-sm uppercase tracking-wide flex-none"
                      >
                        Cancel Order
                      </button>
                    )}
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${collapsedOrders[order.id] ? '' : 'rotate-180'}`} />
                  </div>
                </div>
                
                <div className={`divide-y divide-gray-100 bg-white ${collapsedOrders[order.id] ? 'hidden' : 'block'}`}>
                  {Object.entries(groupedByBranch).map(([branchName, branchItems]) => (
                    <div key={branchName} className="p-5">
                      <h3 className="font-black text-[#1a2f4c] text-sm mb-4 uppercase tracking-widest flex items-center gap-2 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 inline-flex">
                         <MapPin className="w-4 h-4 text-blue-500" /> {branchName}
                      </h3>
                      
                      <div className="space-y-4 sm:space-y-6">
                        {branchItems.map(item => {
                          if (item.status === 'CANCELLED') {
                            return (
                              <div key={item.id} className="flex items-center justify-between border border-red-50 bg-red-50/40 p-3 rounded-lg opacity-80">
                                <div className="flex items-center gap-2">
                                  <span className="line-through text-xs font-medium text-gray-500">{item.product_name} ({item.variant}) - {item.quantity} units</span>
                                </div>
                                <span className="text-[9px] font-extrabold text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase tracking-widest border border-red-200">Cancelled</span>
                              </div>
                            );
                          }
                          
                          return (
                          <div key={item.id} className="flex flex-col gap-4 border border-gray-50 p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            <div className="flex gap-4 items-start">
                              <div className="w-14 h-14 bg-[#fdf9f5] rounded-xl flex items-center justify-center text-red-500 border border-red-50 flex-none">
                                <Package className="w-6 h-6" />
                              </div>
                              <div className="flex-1 pt-1">
                                <h4 className="font-extrabold text-[#1a2f4c] text-sm leading-tight mb-1">{item.product_name || 'Item'}</h4>
                                <div className="flex items-center gap-2 mb-2">
                                   <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">{item.variant || 'Standard'}</span>
                                </div>
                                <p className="text-gray-500 text-xs font-bold">Qty: <span className="text-[#1a2f4c]">{item.quantity} units</span></p>
                              </div>
                              <div className="text-right pt-1">
                                <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full ${
                                  item.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                  item.status === 'DISPATCHED' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                  item.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border border-green-200' :
                                  item.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border border-red-200' :
                                  'bg-gray-50 text-gray-600 border border-gray-200'
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                            </div>
                            
                            {/* Status Tracker */}
                            {item.status === 'CANCELLED' ? (
                              <div className="mt-1 bg-red-50/50 rounded-xl p-3 border border-red-100 text-center">
                                <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest">Item Cancelled</span>
                              </div>
                            ) : (
                              <div className="mt-1 bg-[#fcfcfc] rounded-xl p-4 border border-gray-100">
                                <div className="relative flex justify-between items-center px-2">
                                  <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-gray-200 -translate-y-1/2 -z-10"></div>
                                  <div className={`absolute top-1/2 left-4 h-[2px] bg-green-500 -translate-y-1/2 -z-10 transition-all duration-500 ${
                                    item.status === 'PENDING' ? 'w-0' :
                                    item.status === 'DISPATCHED' ? 'w-1/2' :
                                    'w-[calc(100%-2rem)]'
                                  }`}></div>
                                  
                                  <div className="flex flex-col items-center gap-2">
                                     <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center border-2 border-white shadow-sm z-10"><Package className="w-3 h-3" /></div>
                                     <span className="text-[9px] font-extrabold text-green-600 uppercase tracking-widest">Ordered</span>
                                  </div>
                                  
                                  <div className="flex flex-col items-center gap-2">
                                     <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 transition-colors duration-500 ${
                                       item.status === 'DISPATCHED' || item.status === 'DELIVERED' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                                     }`}><Truck className="w-3 h-3" /></div>
                                     <span className={`text-[9px] font-extrabold uppercase tracking-widest ${item.status === 'DISPATCHED' || item.status === 'DELIVERED' ? 'text-green-600' : 'text-gray-400'}`}>Dispatched</span>
                                  </div>
                                  
                                  <div className="flex flex-col items-center gap-2">
                                     <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 transition-colors duration-500 ${
                                       item.status === 'DELIVERED' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                                     }`}><CheckCircle2 className="w-3 h-3" /></div>
                                     <span className={`text-[9px] font-extrabold uppercase tracking-widest ${item.status === 'DELIVERED' ? 'text-green-600' : 'text-gray-400'}`}>Delivered</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {item.estimatedDeliveryTime && item.status === 'DISPATCHED' && (
                              <div className="bg-blue-50/50 p-3 rounded-xl text-xs font-bold text-blue-700 flex items-center justify-between border border-blue-100 mt-1">
                                <span>Expected Delivery Time</span>
                                <span className="text-blue-800 text-sm">{new Date(item.estimatedDeliveryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                            )}
                          </div>
                        )})}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
