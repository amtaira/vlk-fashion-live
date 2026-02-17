'use client';
export const dynamic = 'force-dynamic'; 

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

  // Form States for New Product
  const [newCatName, setNewCatName] = useState('');
  const [catId, setCatId] = useState('');
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  
  // NEW: Dynamic Variants & Upload State
  const [variants, setVariants] = useState<{color: string, url: string}[]>([]);
  const [currentColorName, setCurrentColorName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => { 
    fetchData(); 
  }, []);

  async function fetchData() {
    try {
      const { data: p } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      const { data: c } = await supabase.from('catalogues').select('*');
      const { data: o } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (p) setProducts(p);
      if (c) setCatalogues(c);
      if (o) setOrders(o);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  // NEW: Local Drive Upload Logic
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      if (!currentColorName) return alert("Enter color name first (e.g. 'Onyx Black')");
      
      setIsUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
      
      setVariants([...variants, { color: currentColorName.toUpperCase(), url: publicUrl }]);
      setCurrentColorName('');
    } catch (error: any) {
      alert("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const addCatalogue = async () => {
    if(!newCatName) return;
    await supabase.from('catalogues').insert([{ name: newCatName }]);
    setNewCatName('');
    fetchData();
  };

  const addProduct = async () => {
    if(!pName || !pPrice || !catId || variants.length === 0) {
        return alert("PROVIDE NAME, PRICE, CATEGORY AND AT LEAST ONE UPLOADED COLOR");
    }
    
    const { error } = await supabase.from('products').insert([{
      name: pName,
      price: parseFloat(pPrice),
      catalogue_id: catId,
      image_url: variants[0].url, // Sets first upload as default
      variants: variants,        // Saves the dynamic color list
      active: true
    }]);

    if(!error) {
      setPName('');
      setPPrice('');
      setVariants([]);
      fetchData();
    } else {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    document.cookie = "vlk_admin_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push('/login?logout=success');
  };

  const deleteProduct = async (id: string) => {
    if(!confirm("Archive deletion permanent. Proceed?")) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  const getAnalytics = () => {
    if (!orders || orders.length === 0) return { topProduct: 'N/A', peakTime: 'N/A' };
    const counts: any = {};
    orders.forEach(o => counts[o.product_name] = (counts[o.product_name] || 0) + 1);
    const topProduct = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'N/A');
    const hours: any = Array(24).fill(0);
    orders.forEach(o => {
      if(o.created_at) hours[new Date(o.created_at).getHours()]++;
    });
    const peakHour = hours.indexOf(Math.max(...hours));
    return { topProduct, peakTime: `${peakHour}:00` };
  };

  const insights = getAnalytics();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#050505] text-[#D4AF37] font-mono pb-24 md:pb-0">
      <aside className="w-full md:w-64 border-b md:border-r border-white/5 flex md:flex-col p-6 md:p-8 md:fixed h-auto md:h-full bg-black z-20 justify-between items-center md:items-start">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white italic">VLK²</h1>
          <p className="text-[7px] md:text-[8px] uppercase tracking-widest opacity-40 hidden md:block">System Insights</p>
        </div>
        <nav className="hidden md:flex flex-col gap-8 mt-20">
          <button onClick={() => setActiveTab('DASHBOARD')} className={`text-left text-[10px] uppercase tracking-widest ${activeTab === 'DASHBOARD' ? 'text-white font-bold underline underline-offset-8' : 'opacity-30'}`}>01. Dashboard</button>
          <button onClick={() => setActiveTab('INVENTORY')} className={`text-left text-[10px] uppercase tracking-widest ${activeTab === 'INVENTORY' ? 'text-white font-bold underline underline-offset-8' : 'opacity-30'}`}>02. Inventory</button>
          <button onClick={handleLogout} className="mt-20 text-left text-[9px] uppercase tracking-widest text-red-500 hover:text-white border-t border-white/10 pt-4 transition-colors">Terminate Session</button>
        </nav>
      </aside>

      <main className="flex-1 md:ml-64 p-6 md:p-16">
         {activeTab === 'DASHBOARD' ? (
           <div className="animate-in fade-in">
             <h3 className="text-2xl md:text-3xl font-black text-white mb-8 md:mb-12 italic">Performance</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8">
               <div className="border border-[#D4AF37]/20 p-6 md:p-8 bg-black">
                 <p className="text-[8px] uppercase opacity-40 mb-1">Top Item</p>
                 <p className="text-lg md:text-xl font-black text-white truncate">{insights.topProduct}</p>
               </div>
               <div className="border border-[#D4AF37]/20 p-6 md:p-8 bg-black">
                 <p className="text-[8px] uppercase opacity-40 mb-1">Peak Time</p>
                 <p className="text-lg md:text-xl font-black text-white">{insights.peakTime}</p>
               </div>
               <div className="border border-[#D4AF37]/20 p-6 md:p-8 bg-black">
                 <p className="text-[8px] uppercase opacity-40 mb-1">Total Revenue</p>
                 <p className="text-lg md:text-xl font-black text-white">${orders.reduce((s,o)=>s+(o.amount||0),0)}</p>
               </div>
             </div>

             <div className="border border-white/5 bg-black overflow-x-auto">
               <table className="w-full text-left text-[8px] md:text-[9px] uppercase tracking-widest min-w-[500px]">
                 <thead className="opacity-40 border-b border-white/5 bg-white/5">
                   <tr><th className="p-4 md:p-6">Client</th><th className="p-4 md:p-6 text-center">Order Type</th><th className="p-4 md:p-6">Status</th><th className="p-4 md:p-6 text-right">Action</th></tr>
                 </thead>
                 <tbody>
                   {orders.map(o => (
                     <tr key={o.id} className="border-b border-white/5">
                       <td className="p-4 md:p-6 text-white truncate max-w-[100px]">{o.customer_email}</td>
                       <td className="p-4 md:p-6 text-[7px] text-center opacity-60 italic">{o.product_name}</td>
                       <td className="p-4 md:p-6">
                         <span className={`px-2 py-0.5 border text-[7px] ${o.status === 'pending' ? 'border-red-900 text-red-500' : 'border-green-900 text-green-500'}`}>{o.status}</span>
                       </td>
                       <td className="p-4 md:p-6 text-right">
                         <button onClick={() => setSelectedOrder(o)} className="text-[#D4AF37] underline">Receipt</button>
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
             <section className="bg-black border border-white/5 p-6 md:p-8">
              <h4 className="text-[9px] uppercase opacity-40 mb-4 font-bold italic">1. Collections</h4>
              <div className="flex flex-col md:flex-row gap-4">
                <input placeholder="New Name" value={newCatName} onChange={(e)=>setNewCatName(e.target.value)} className="flex-1 bg-transparent border-b border-white/10 py-2 text-[10px] text-white outline-none"/>
                <button onClick={addCatalogue} className="bg-[#D4AF37] text-black px-6 py-2 text-[9px] uppercase font-bold">Add</button>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <aside className="col-span-1 bg-black border border-white/5 p-6 md:p-8 space-y-6 h-fit">
                <h4 className="text-[9px] uppercase opacity-40 font-bold italic text-center text-white">2. New Archive Entry</h4>
                <div className="space-y-4">
                  <select value={catId} onChange={(e)=>setCatId(e.target.value)} className="w-full bg-zinc-900 p-3 text-[10px] text-white uppercase outline-none border border-white/5">
                    <option value="">Select Category</option>
                    {catalogues.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input placeholder="Product Name" value={pName} onChange={(e)=>setPName(e.target.value)} className="w-full bg-transparent border-b border-white/10 py-2 text-[10px] text-white outline-none"/>
                  <input placeholder="Price (USD)" value={pPrice} onChange={(e)=>setPPrice(e.target.value)} className="w-full bg-transparent border-b border-white/10 py-2 text-[10px] text-white outline-none"/>
                  
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <p className="text-[8px] uppercase opacity-40">Upload Colors from Local Drive:</p>
                    <input 
                      placeholder="Color Name (e.g. Red)" 
                      value={currentColorName} 
                      onChange={e=>setCurrentColorName(e.target.value)}
                      className="w-full bg-zinc-900 p-2 text-[10px] text-white outline-none"
                    />
                    <label className="block w-full text-center bg-white text-black py-2 text-[9px] font-black cursor-pointer hover:bg-[#D4AF37] transition-all">
                      {isUploading ? 'UPLOADING...' : 'SELECT FILE & UPLOAD'}
                      <input type="file" hidden onChange={handleFileUpload} accept="image/*" disabled={isUploading} />
                    </label>
                  </div>

                  {/* Upload Queue Preview */}
                  <div className="grid grid-cols-3 gap-2">
                    {variants.map((v, i) => (
                        <div key={i} className="aspect-square bg-zinc-900 relative border border-white/10">
                            <img src={v.url} className="w-full h-full object-cover grayscale" />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-[6px] text-white font-bold">{v.color}</span>
                            </div>
                        </div>
                    ))}
                  </div>

                  <button onClick={addProduct} className="w-full bg-[#D4AF37] text-black py-4 text-[10px] font-black uppercase hover:bg-white transition-all">Commit to Archive</button>
                </div>
              </aside>

              <section className="col-span-1 md:col-span-2 space-y-3">
                <h4 className="text-[9px] uppercase opacity-40 font-bold italic">Current Stock</h4>
                {products.map(p => (
                  <div key={p.id} className="border border-white/5 p-4 flex items-center justify-between bg-black/50 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-900 overflow-hidden border border-white/10">{p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"/>}</div>
                      <div>
                        <p className="text-[10px] font-bold text-white uppercase">{p.name}</p>
                        <p className="text-[8px] text-[#D4AF37] font-bold">${p.price}</p>
                      </div>
                    </div>
                    <button onClick={()=>deleteProduct(p.id)} className="text-red-900 text-[8px] border border-red-900/20 px-2 py-1 hover:bg-red-900 hover:text-white transition-all">Delete</button>
                  </div>
                ))}
              </section>
            </div>
           </div>
         )}
      </main>

      {selectedOrder && (
        <div className="fixed inset-0 z-[600] flex items-start justify-center bg-black/98 p-4 overflow-y-auto" onClick={() => setSelectedOrder(null)}>
          <div className="relative bg-[#f2f2f2] p-6 md:p-10 text-black w-full max-w-sm shadow-2xl font-mono mt-10 mb-20" onClick={e=>e.stopPropagation()}>
            <button onClick={() => setSelectedOrder(null)} className="absolute top-2 right-2 p-2 text-xs font-bold opacity-30">✕</button>
            <div className="text-center border-b border-dashed border-black/20 pb-6 mb-6">
              <h2 className="text-xl font-black uppercase italic">VLK²</h2>
              <p className="text-[8px] tracking-[0.3em]">Official Acquisition Record</p>
            </div>
            <div className="text-[9px] space-y-3 uppercase mb-8">
                <div className="flex justify-between"><span>Client:</span><span className="font-bold truncate max-w-[150px]">{selectedOrder.customer_email}</span></div>
                <div className="flex justify-between"><span>Protocol:</span><span className="font-bold">{selectedOrder.product_name}</span></div>
                <div className="flex justify-between"><span>Method:</span><span className="font-bold">{selectedOrder.payment_method}</span></div>
                <div className="flex justify-between pt-4 border-t border-black/10"><span>Total:</span><span className="font-black text-lg">${selectedOrder.amount}</span></div>
            </div>
            <div className="h-12 w-full bg-black flex items-end justify-around px-2 mb-6 text-white text-[5px] overflow-hidden">
                 {/* Decorative Barcode */}
                 {[...Array(40)].map((_, i) => (
                   <div key={i} className="bg-white" style={{ width: i % 3 === 0 ? '2px' : '1px', height: `${Math.random() * 50 + 50}%` }} />
                 ))}
            </div>
            <button onClick={() => window.print()} className="w-full py-4 bg-black text-white text-[9px] font-black uppercase">Print Manifest</button>
          </div>
        </div>
      )}
    </div>
  );
}