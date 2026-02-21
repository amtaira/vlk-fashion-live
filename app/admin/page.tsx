'use client';
export const dynamic = 'force-dynamic'; 

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminPortal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INVENTORY' | 'ORDERS'>('ORDERS');
  const [products, setProducts] = useState<any[]>([]);
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Edit States
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCatalogue, setEditingCatalogue] = useState<any>(null);

  // Form States
  const [newCatName, setNewCatName] = useState('');
  const [catId, setCatId] = useState('');
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [variants, setVariants] = useState<{color: string, url: string}[]>([]);
  const [currentColorName, setCurrentColorName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => { 
    fetchData(); 
    // Listen for new orders in real-time
    const channel = supabase.channel('realtime_orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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

  // Handle Logic for Save/Edit
  const handleSaveProduct = async () => {
    if(!pName || !pPrice || !catId || variants.length === 0) return alert("Missing Info");
    
    const productData = {
      name: pName,
      price: parseFloat(pPrice),
      catalogue_id: catId,
      image_url: variants[0].url,
      variants: variants,
      active: true
    };

    if (editingProduct) {
      await supabase.from('products').update(productData).eq('id', editingProduct.id);
    } else {
      await supabase.from('products').insert([productData]);
    }
    
    cancelEdit();
    fetchData();
  };

  const startEditProduct = (p: any) => {
    setEditingProduct(p);
    setPName(p.name);
    setPPrice(p.price.toString());
    setCatId(p.catalogue_id);
    setVariants(p.variants || []);
    setActiveTab('INVENTORY');
  };

  const handleSaveCatalogue = async () => {
    if(!newCatName) return;
    if (editingCatalogue) {
      await supabase.from('catalogues').update({ name: newCatName }).eq('id', editingCatalogue.id);
    } else {
      await supabase.from('catalogues').insert([{ name: newCatName }]);
    }
    setNewCatName('');
    setEditingCatalogue(null);
    fetchData();
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setPName('');
    setPPrice('');
    setVariants([]);
    setCatId('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      if (!currentColorName) return alert("Enter color name first");
      setIsUploading(true);
      const file = e.target.files[0];
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
      setVariants([...variants, { color: currentColorName.toUpperCase(), url: publicUrl }]);
      setCurrentColorName('');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "vlk_admin_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push('/login');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-white font-sans relative">
      {/* BACKGROUND AS CUSTOMER SIDE */}
      <div className="fixed inset-0 -z-10 bg-black" />
      <div className="fixed inset-0 -z-10 opacity-20 bg-cover bg-center grayscale pointer-events-none" 
           style={{ backgroundImage: "url('/hero-bg.jpg')" }} />

      {/* ASIDE NAVIGATION */}
      <aside className="w-full md:w-64 border-b md:border-r border-white/10 flex md:flex-col p-8 md:fixed h-auto md:h-full bg-black/60 backdrop-blur-xl z-20">
        <div className="mb-12">
          <h1 className="text-2xl font-black text-pink-500 italic">VLK²</h1>
          <p className="text-[8px] uppercase tracking-[0.4em] opacity-40">Administrative Terminal</p>
        </div>
        <nav className="flex md:flex-col gap-6 flex-1">
          <button onClick={() => setActiveTab('ORDERS')} className={`text-left text-[10px] uppercase tracking-widest ${activeTab === 'ORDERS' ? 'text-pink-500 font-bold' : 'opacity-40'}`}>01. Orders ({orders.length})</button>
          <button onClick={() => setActiveTab('INVENTORY')} className={`text-left text-[10px] uppercase tracking-widest ${activeTab === 'INVENTORY' ? 'text-pink-500 font-bold' : 'opacity-40'}`}>02. Inventory</button>
          <button onClick={() => setActiveTab('DASHBOARD')} className={`text-left text-[10px] uppercase tracking-widest ${activeTab === 'DASHBOARD' ? 'text-pink-500 font-bold' : 'opacity-40'}`}>03. Analytics</button>
          <button onClick={handleLogout} className="md:mt-auto text-left text-[9px] uppercase tracking-widest text-red-500">Terminate</button>
        </nav>
      </aside>

      <main className="flex-1 md:ml-64 p-6 md:p-16">
        {/* ORDERS DASHBOARD */}
        {activeTab === 'ORDERS' && (
          <div className="animate-in fade-in space-y-8">
            <h3 className="text-4xl font-black italic uppercase">Live Orders</h3>
            <div className="grid grid-cols-1 gap-4">
              {orders.map(o => (
                <div key={o.id} className="bg-white/5 border border-white/10 p-6 flex justify-between items-center hover:bg-white/10 transition-all group">
                  <div>
                    <p className="text-[10px] opacity-40 uppercase tracking-tighter">Order ID: {o.id.slice(0,8)}</p>
                    <h4 className="font-bold text-lg">£{o.total}.00</h4>
                    <p className="text-[10px] text-pink-500 font-black">{o.items?.length || 0} ITEMS IN SHIPMENT</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase opacity-60 mb-2">{new Date(o.created_at).toLocaleString()}</p>
                    <button onClick={() => setSelectedOrder(o)} className="bg-white text-black text-[9px] font-black px-4 py-2 uppercase hover:bg-pink-500">View Manifest</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INVENTORY & EDITING */}
        {activeTab === 'INVENTORY' && (
          <div className="animate-in slide-in-from-bottom-4 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* FORM SECTION */}
              <section className="space-y-8 bg-black/40 p-8 border border-white/5">
                <header className="flex justify-between items-center">
                   <h4 className="text-xl font-black italic uppercase">{editingProduct ? 'Edit Product' : 'New Entry'}</h4>
                   {editingProduct && <button onClick={cancelEdit} className="text-[10px] text-red-500 underline">Cancel Edit</button>}
                </header>
                
                <div className="space-y-4">
                  <select value={catId} onChange={(e)=>setCatId(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 text-[11px] uppercase outline-none text-white">
                    <option value="">Select Category</option>
                    {catalogues.map(c => <option key={c.id} value={c.id} className="bg-black">{c.name}</option>)}
                  </select>
                  <input placeholder="Product Name" value={pName} onChange={(e)=>setPName(e.target.value)} className="w-full bg-transparent border-b border-white/10 p-4 text-[11px] text-white outline-none focus:border-pink-500"/>
                  <input placeholder="Price (GBP)" value={pPrice} onChange={(e)=>setPPrice(e.target.value)} className="w-full bg-transparent border-b border-white/10 p-4 text-[11px] text-white outline-none focus:border-pink-500"/>
                  
                  <div className="pt-4 space-y-3">
                    <p className="text-[9px] font-black opacity-40 uppercase">Variant Configuration</p>
                    <div className="flex gap-2">
                      <input placeholder="Color Name" value={currentColorName} onChange={e=>setCurrentColorName(e.target.value)} className="flex-1 bg-white/5 border border-white/10 p-3 text-[10px] outline-none"/>
                      <label className="bg-white text-black px-4 py-2 text-[10px] font-black cursor-pointer flex items-center">
                        {isUploading ? '...' : 'UPLOAD'}
                        <input type="file" hidden onChange={handleFileUpload} accept="image/*" disabled={isUploading} />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {variants.map((v, i) => (
                      <div key={i} className="w-16 h-20 bg-white/5 border border-white/10 relative group">
                        <img src={v.url} className="w-full h-full object-contain p-1 grayscale" />
                        <button onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[8px] flex items-center justify-center">✕</button>
                      </div>
                    ))}
                  </div>

                  <button onClick={handleSaveProduct} className="w-full bg-pink-500 text-black py-4 text-[11px] font-black uppercase hover:bg-white transition-all">
                    {editingProduct ? 'Update Archive' : 'Commit to Archive'}
                  </button>
                </div>
              </section>

              {/* LISTING SECTION */}
              <section className="space-y-4">
                 <h4 className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-6">Current Stock</h4>
                 <div className="space-y-2 h-[600px] overflow-y-auto pr-2">
                    {products.map(p => (
                      <div key={p.id} className="bg-white/5 border border-white/5 p-4 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                           <img src={p.image_url} className="w-10 h-12 object-contain grayscale group-hover:grayscale-0 transition-all"/>
                           <div>
                             <p className="text-[10px] font-black uppercase">{p.name}</p>
                             <p className="text-[9px] text-pink-500">£{p.price}</p>
                           </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                           <button onClick={() => startEditProduct(p)} className="text-[8px] border border-white/20 px-3 py-1 hover:bg-white hover:text-black">EDIT</button>
                           <button onClick={() => { if(confirm("Delete?")) supabase.from('products').delete().eq('id', p.id).then(()=>fetchData())}} className="text-[8px] border border-red-500/20 text-red-500 px-3 py-1 hover:bg-red-500 hover:text-white">DEL</button>
                        </div>
                      </div>
                    ))}
                 </div>
              </section>
            </div>
            
            {/* COLLECTIONS MANAGEMENT */}
            <section className="bg-black/40 p-8 border border-white/5">
                <h4 className="text-[10px] font-black opacity-40 uppercase mb-6 tracking-widest">Collections Management</h4>
                <div className="flex gap-4 mb-8">
                   <input placeholder={editingCatalogue ? "Edit Collection Name" : "New Collection Name"} value={newCatName} onChange={(e)=>setNewCatName(e.target.value)} className="flex-1 bg-transparent border-b border-white/10 py-2 text-[11px] text-white outline-none"/>
                   <button onClick={handleSaveCatalogue} className="bg-white text-black px-8 py-2 text-[10px] font-black uppercase">{editingCatalogue ? 'Update' : 'Add'}</button>
                   {editingCatalogue && <button onClick={() => {setEditingCatalogue(null); setNewCatName('')}} className="text-[10px] opacity-40 uppercase">Cancel</button>}
                </div>
                <div className="flex flex-wrap gap-2">
                   {catalogues.map(c => (
                     <div key={c.id} className="border border-white/10 px-4 py-2 flex items-center gap-4 hover:border-pink-500 transition-all">
                        <span className="text-[10px] font-bold uppercase">{c.name}</span>
                        <div className="flex gap-2">
                           <button onClick={() => {setEditingCatalogue(c); setNewCatName(c.name)}} className="text-[8px] opacity-40 hover:text-white">Edit</button>
                           <button onClick={() => { if(confirm("Delete?")) supabase.from('catalogues').delete().eq('id', c.id).then(()=>fetchData())}} className="text-[8px] text-red-500 opacity-40 hover:opacity-100">✕</button>
                        </div>
                     </div>
                   ))}
                </div>
            </section>
          </div>
        )}
      </main>

      {/* RECEIPT / MANIFEST MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/95 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white text-black p-8 w-full max-w-sm font-mono" onClick={e=>e.stopPropagation()}>
            <div className="text-center border-b border-dashed border-black/20 pb-4 mb-4">
              <h2 className="text-2xl font-black italic">VLK²</h2>
              <p className="text-[8px] uppercase">Official Acquisition Record</p>
            </div>
            <div className="space-y-2 text-[9px] uppercase mb-6">
              <div className="flex justify-between"><span>Status:</span><span className="font-bold">PAID</span></div>
              <div className="flex justify-between"><span>Method:</span><span className="font-bold">{selectedOrder.payment_info?.method}</span></div>
              <div className="flex justify-between border-t border-black/10 pt-2"><span>Total:</span><span className="font-black">£{selectedOrder.total}.00</span></div>
            </div>
            <div className="border-t border-dashed border-black/20 pt-4 space-y-3">
               {selectedOrder.items?.map((item: any, i: number) => (
                 <div key={i} className="flex justify-between text-[8px] uppercase">
                    <span>{item.name} ({item.selectedSize})</span>
                    <span>£{item.price}</span>
                 </div>
               ))}
            </div>
            <button onClick={() => window.print()} className="w-full mt-8 py-3 bg-black text-white text-[10px] font-black uppercase">Print Manifest</button>
          </div>
        </div>
      )}
    </div>
  );
}