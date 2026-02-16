'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function adminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ totalSales: 0, totalOrders: 0, pending: 0 });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) {
      setOrders(data);
      const total = data.reduce((sum, o) => sum + (o.amount || 0), 0);
      const pending = data.filter(o => o.status === 'pending').length;
      setMetrics({ totalSales: total, totalOrders: data.length, pending });
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    fetchOrders();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#a67c52] p-10 font-sans selection:bg-[#a67c52] selection:text-black">
      
      {/* 1. SALES ANALYSIS METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="border border-white/5 p-8 bg-black/40">
          <p className="text-[9px] uppercase tracking-[0.4em] opacity-40 mb-2">Gross Revenue</p>
          <p className="text-3xl font-black text-white">${metrics.totalSales.toLocaleString()}</p>
        </div>
        <div className="border border-white/5 p-8 bg-black/40">
          <p className="text-[9px] uppercase tracking-[0.4em] opacity-40 mb-2">Total Acquisitions</p>
          <p className="text-3xl font-black text-white">{metrics.totalOrders}</p>
        </div>
        <div className="border border-white/5 p-8 bg-black/40">
          <p className="text-[9px] uppercase tracking-[0.4em] opacity-40 mb-2">Pending Protocols</p>
          <p className="text-3xl font-black text-[#a67c52]">{metrics.pending}</p>
        </div>
      </div>

      {/* 2. ORDER TRACKING TABLE */}
      <div className="border border-white/5 bg-black/20 overflow-hidden">
        <table className="w-full text-left text-[10px] uppercase tracking-widest">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="p-6 opacity-40">Date</th>
              <th className="p-6 opacity-40">Customer</th>
              <th className="p-6 opacity-40">Item</th>
              <th className="p-6 opacity-40">Amount</th>
              <th className="p-6 opacity-40">Status</th>
              <th className="p-6 opacity-40 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                <td className="p-6 text-white/60">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="p-6 text-white">{order.customer_email}</td>
                <td className="p-6">{order.product_name}</td>
                <td className="p-6 font-bold">${order.amount}</td>
                <td className="p-6">
                  <select 
                    value={order.status} 
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="bg-transparent border border-white/10 py-1 px-2 outline-none focus:border-[#a67c52]"
                  >
                    <option value="pending">PENDING</option>
                    <option value="confirmed">CONFIRMED</option>
                    <option value="shipped">SHIPPED</option>
                  </select>
                </td>
                <td className="p-6 text-right">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="border border-[#a67c52] px-4 py-2 text-[8px] font-bold hover:bg-[#a67c52] hover:text-black transition-all"
                  >
                    Generate Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. THE DIGITAL RECEIPT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-lg bg-white p-16 text-black shadow-2xl animate-in zoom-in-95 duration-300 print:p-0">
            <header className="flex justify-between items-start mb-20">
              <div>
                <h2 className="text-2xl font-black tracking-tighter">VLK²</h2>
                <p className="text-[8px] tracking-[0.4em] uppercase opacity-60">Visual Lukks Archive</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-widest">Invoice No.</p>
                <p className="text-[12px]">#{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </header>

            <div className="mb-20 space-y-2">
              <p className="text-[8px] uppercase tracking-widest opacity-40">Bill To:</p>
              <p className="text-sm font-bold uppercase tracking-widest">{selectedOrder.customer_email}</p>
              <p className="text-[10px] opacity-60 italic">{new Date(selectedOrder.created_at).toLocaleString()}</p>
            </div>

            <div className="border-t border-black pb-4 pt-10 mb-20">
              <div className="flex justify-between items-center uppercase tracking-[0.2em] text-[10px] font-bold">
                <span>Description</span>
                <span>Subtotal</span>
              </div>
              <div className="flex justify-between items-center py-6 border-b border-black/5">
                <span className="text-[12px] uppercase tracking-widest font-black">{selectedOrder.product_name}</span>
                <span className="text-[12px] font-bold">${selectedOrder.amount}</span>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-[8px] uppercase tracking-widest opacity-40">Payment Method</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{selectedOrder.payment_method}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest opacity-40">Total Amount</p>
                <p className="text-3xl font-black italic">${selectedOrder.amount}</p>
              </div>
            </div>

            <footer className="mt-20 pt-10 border-t border-black/10 text-center">
              <p className="text-[8px] uppercase tracking-[0.6em] opacity-40">Verified Acquisition System</p>
              <button 
                onClick={() => window.print()}
                className="mt-10 px-8 py-3 border border-black text-[8px] uppercase tracking-widest hover:bg-black hover:text-white transition-all print:hidden"
              >
                Print Official Record
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}