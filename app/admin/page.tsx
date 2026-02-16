'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminPortal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INVENTORY'>('DASHBOARD');
  const [products, setProducts] = useState<any[]>([]);
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Form States
  const [newCatName, setNewCatName] = useState('');
  const [catId, setCatId] = useState('');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data: p } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    const { data: c } = await supabase.from('catalogues').select('*');
    const { data: o } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (p) setProducts(p);
    if (c) setCatalogues(c);
    if (o) setOrders(o);
  }

  // LOGOUT LOGIC
  const handleLogout = () => {
    // Delete the cookie by setting it to the past
    document.cookie = "vlk_admin_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    // Redirect with success message
    router.push('/login?logout=success');
  };

  const deleteProduct = async (id: string) => {
    if(!confirm("Archive deletion permanent. Proceed?")) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  // ... (Analytics function remains the same)
  const getAnalytics = () => {
    if (orders.length === 0) return { topProduct: 'N/A', peakTime: 'N/A' };
    const counts: any = {};
    orders.forEach(o => counts[o.product_name] = (counts[o.product_name] || 0) + 1);
    const topProduct = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    const hours: any = Array(24).fill(0);
    orders.forEach(o => hours[new Date(o.created_at).getHours()]++);
    const peakHour = hours.indexOf(Math.max(...hours));
    return { topProduct, peakTime: `${peakHour}:00` };
  };
  const insights = getAnalytics();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#050505] text-[#a67c52] font-mono pb-24 md:pb-0">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 border-b md:border-r border-white/5 flex md:flex-col p-6 md:p-8 md:fixed h-auto md:h-full bg-black z-20 justify-between items-center md:items-start">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white italic">VLK²</h1>
          <p className="text-[7px] md:text-[8px] uppercase tracking-widest opacity-40 hidden md:block">System Insights</p>
        </div>
        
        <nav className="hidden md:flex flex-col gap-8 mt-20">
          <button onClick={() => setActiveTab('DASHBOARD')} className={`text-left text-[10px] uppercase tracking-widest ${activeTab === 'DASHBOARD' ? 'text-white font-bold underline underline-offset-8' : 'opacity-30'}`}>01. Dashboard</button>
          <button onClick={() => setActiveTab('INVENTORY')} className={`text-left text-[10px] uppercase tracking-widest ${activeTab === 'INVENTORY' ? 'text-white font-bold underline underline-offset-8' : 'opacity-30'}`}>02. Inventory</button>
          
          {/* LOGOUT BUTTON */}
          <button onClick={handleLogout} className="mt-20 text-left text-[9px] uppercase tracking-widest text-red-500 hover:text-white border-t border-white/10 pt-4 transition-colors">
            Terminate Session
          </button>
        </nav>

        <div className="md:hidden flex items-center gap-4">
          <button onClick={handleLogout} className="text-[8px] uppercase border border-red-500/30 px-2 py-1 text-red-500">Logout</button>
          <div className="text-[9px] uppercase font-bold text-white border border-white/10 px-3 py-1">admin</div>
        </div>
      </aside>

      {/* ... (Rest of your Main UI content) */}
      <main className="flex-1 md:ml-64 p-6 md:p-16">
         {/* Insert the same Dashboard/Inventory logic you had before here */}
         {activeTab === 'DASHBOARD' ? (
           <div className="animate-in fade-in">
             <h3 className="text-2xl md:text-3xl font-black text-white mb-8 md:mb-12 italic">Performance</h3>
             {/* ... analytics grid and orders table ... */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8">
               <div className="border border-[#a67c52]/20 p-6 md:p-8 bg-black">
                <p className="text-[8px] uppercase opacity-40 mb-1">Top Item</p>
                <p className="text-lg md:text-xl font-black text-white truncate">{insights.topProduct}</p>
              </div>
              <div className="border border-[#a67c52]/20 p-6 md:p-8 bg-black">
                <p className="text-[8px] uppercase opacity-40 mb-1">Peak Time</p>
                <p className="text-lg md:text-xl font-black text-white">{insights.peakTime}</p>
              </div>
              <div className="border border-[#a67c52]/20 p-6 md:p-8 bg-black">
                <p className="text-[8px] uppercase opacity-40 mb-1">Total Revenue</p>
                <p className="text-lg md:text-xl font-black text-white">${orders.reduce((s,o)=>s+(o.amount||0),0)}</p>
              </div>
            </div>
            {/* Orders Table */}
            <div className="border border-white/5 bg-black overflow-x-auto">
              <table className="w-full text-left text-[8px] md:text-[9px] uppercase tracking-widest min-w-[500px]">
                <thead className="opacity-40 border-b border-white/5 bg-white/5">
                  <tr><th className="p-4 md:p-6">Client</th><th className="p-4 md:p-6">Status</th><th className="p-4 md:p-6 text-right">Action</th></tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b border-white/5">
                      <td className="p-4 md:p-6 text-white truncate max-w-[100px]">{o.customer_email}</td>
                      <td className="p-4 md:p-6">
                        <span className={`px-2 py-0.5 border text-[7px] ${o.status === 'pending' ? 'border-red-900 text-red-500' : 'border-green-900 text-green-500'}`}>{o.status}</span>
                      </td>
                      <td className="p-4 md:p-6 text-right">
                        <button onClick={() => setSelectedOrder(o)} className="text-[#a67c52] underline">Receipt</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
           </div>
         ) : (
           <div className="animate-in slide-in-from-right-4 space-y-8 md:space-y-12">
             <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter">Inventory</h3>
             {/* ... Inventory forms and product list ... */}
             <section className="bg-black border border-white/5 p-6 md:p-8">
              <h4 className="text-[9px] uppercase opacity-40 mb-4 font-bold italic">1. Collections</h4>
              <form onSubmit={(e)=>e.preventDefault()} className="flex flex-col md:flex-row gap-4">
                <input placeholder="New Name" value={newCatName} onChange={(e)=>setNewCatName(e.target.value)} className="flex-1 bg-transparent border-b border-white/10 py-2 text-[10px] text-white outline-none"/>
                <button className="bg-[#a67c52] text-black px-6 py-2 text-[9px] uppercase font-bold">Add</button>
              </form>
            </section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <aside className="col-span-1 bg-black border border-white/5 p-6 md:p-8 space-y-6 h-fit order-2 md:order-1">
                <h4 className="text-[9px] uppercase opacity-40 font-bold italic text-center">2. New Item</h4>
                <div className="space-y-4">
                  <select value={catId} onChange={(e)=>setCatId(e.target.value)} className="w-full bg-zinc-900 p-3 text-[10px] text-white uppercase outline-none">
                    <option value="">Select Category</option>
                    {catalogues.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input placeholder="Name" className="w-full bg-transparent border-b border-white/10 py-2 text-[10px] text-white outline-none"/>
                  <button className="w-full bg-[#a67c52] text-black py-4 text-[10px] font-black uppercase">Commit</button>
                </div>
              </aside>
              <section className="col-span-1 md:col-span-2 space-y-3 order-1 md:order-2">
                {products.map(p => (
                  <div key={p.id} className="border border-white/5 p-4 flex items-center justify-between bg-black/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-900 overflow-hidden">{p.image_url && <img src={p.image_url} className="w-full h-full object-cover grayscale"/>}</div>
                      <div>
                        <p className="text-[10px] font-bold text-white uppercase">{p.name}</p>
                        <p className="text-[8px] opacity-30">${p.price}</p>
                      </div>
                    </div>
                    <button onClick={()=>deleteProduct(p.id)} className="text-red-900 text-[8px] border border-red-900/20 px-2 py-1">Delete</button>
                  </div>
                ))}
              </section>
            </div>
           </div>
         )}
      </main>

      {/* ... (Receipt modal stays exactly as it was) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[600] flex items-start justify-center bg-black/98 p-4 overflow-y-auto" onClick={() => setSelectedOrder(null)}>
          <div className="relative bg-[#f2f2f2] p-6 md:p-10 text-black w-full max-w-sm shadow-2xl font-mono mt-10 mb-20" onClick={e=>e.stopPropagation()}>
            <button onClick={() => setSelectedOrder(null)} className="absolute top-2 right-2 p-2 text-xs font-bold opacity-30">✕</button>
            <div className="text-center border-b border-dashed border-black/20 pb-6 mb-6">
              <h2 className="text-xl font-black uppercase">VLK²</h2>
              <p className="text-[8px] tracking-[0.3em]">Protocol Record</p>
            </div>
            <div className="text-[9px] space-y-3 uppercase mb-8">
               <div className="flex justify-between"><span>ID:</span><span className="font-bold">#{selectedOrder.id.slice(0,6)}</span></div>
               <div className="flex justify-between"><span>Total:</span><span className="font-black text-lg">${selectedOrder.amount}</span></div>
            </div>
            <div className="h-12 w-full bg-black flex items-end justify-around px-2 mb-6">
                 {[...Array(30)].map((_, i) => (
                   <div key={i} className="bg-white" style={{ width: '1px', height: `${Math.random() * 60 + 30}%` }} />
                 ))}
            </div>
            <button onClick={() => window.print()} className="w-full py-4 bg-black text-white text-[9px] font-black uppercase">Print</button>
          </div>
        </div>
      )}
    </div>
  );
}