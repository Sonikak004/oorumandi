'use client';

import { useEffect, useState } from 'react';
import { updateOrderStatus } from '@/app/actions';

type AdminOrderItem = {
  id: string;
  quantity: number;
  status: string;
  productName: string;
  variant: string;
  branch: { name: string };
  order: {
    createdAt: string;
    vendor: { email: string };
  }
};

export default function AdminDashboard() {
  const [items, setItems] = useState<AdminOrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        setItems(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async (id: string, status: string, etaMinutes?: number) => {
    await updateOrderStatus(id, status, etaMinutes);
    fetchItems();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order Management</h1>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm font-medium text-slate-600">
          <span className="text-blue-600 font-bold">{items.length}</span> Total Items
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor details</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Item Details</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No orders have been placed yet.
                  </td>
                </tr>
              ) : items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {new Date(item.order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(item.order.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{item.branch.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{item.order.vendor.email}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg bg-blue-50 text-blue-600">
                        {item.productName?.toLowerCase().includes('milk') || item.productName?.toLowerCase().includes('curd') ? '🥛' : 
                         item.productName?.toLowerCase().includes('chicken') ? '🍗' :
                         item.productName?.toLowerCase().includes('egg') ? '🥚' :
                         item.productName?.toLowerCase().includes('bread') || item.productName?.toLowerCase().includes('bun') || item.productName?.toLowerCase().includes('pav') ? '🍞' :
                         '🥬'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{item.productName || 'Product'}</div>
                        <div className="text-xs font-medium text-slate-500 mt-0.5">{item.variant || 'Standard'} • Qty: {item.quantity}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      item.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      item.status === 'DELIVERED' ? 'bg-green-100 text-green-800 border border-green-200' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {item.status === 'PENDING' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>}
                      {item.status === 'DISPATCHED' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>}
                      {item.status === 'DELIVERED' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>}
                      {item.status}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {item.status === 'PENDING' && (
                      <button 
                        onClick={() => handleUpdate(item.id, 'DISPATCHED', 30)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-sm"
                      >
                        Dispatch Now (30m ETA)
                      </button>
                    )}
                    {item.status === 'DISPATCHED' && (
                      <button 
                        onClick={() => handleUpdate(item.id, 'DELIVERED')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-sm"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {item.status === 'DELIVERED' && (
                      <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
