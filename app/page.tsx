'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [activeCatalogue, setActiveCatalogue] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState(''); 
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'NONE' | 'MPESA' | 'VISA'>('NONE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('catalogues').select('*, products(*)');
      if (data) setCatalogues(data);
    }
    fetchData();
  }, []);

  const openProduct = (p: any) => {
    setSelectedProduct(p);
    setActiveImage(p.image_url);
    setSelectedColor(p.variants?.[0]?.color || 'OG');
    setSelectedSize('');
  };

  const addToCart = () => {
    if (!selectedSize) return alert("PLEASE SELECT A SIZE");
    const item = { ...selectedProduct, selectedSize, selectedColor, activeImage };
    setCart((prev) => [...prev, item]);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const handleFinalOrder = async () => {
    if (!email || selectedMethod === 'NONE') return alert("MISSING INFO");
    setLoading(true);
    const { error } = await supabase.from('orders').insert(
      cart.map(item => ({
        customer_email: email,
        product_name: `${item.name} (${item.selectedSize})`,
        amount: item.price,
        payment_method: selectedMethod,
        status: 'pending'
      }))
    );
    if (!error) {
      alert("ACQUISITION LOGGED. CHECK EMAIL.");
      setCart([]);
      setIsCartOpen(false);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen text-white font-sans selection:bg-pink-500 relative">
      <div className="fixed inset-0 -z-20 bg-black" />
      <div className="fixed inset-0 -z-10 opacity-30 bg-cover bg-center grayscale pointer-events-none" 
           style={{ backgroundImage: "url('/hero-bg.jpg')" }} />

      {/* TOP NAV */}
      <nav className="fixed top-0 w-full z-[100] px-6 py-6 flex justify-between items-center bg-black/60 backdrop-blur-md">
         <div className="flex items-center gap-6">
            <div className="w-10 h-10 rounded-full border border-pink-500 flex items-center justify-center font-black text-pink-500 text-[10px] cursor-pointer" 
                 onClick={() => {setActiveCatalogue(null); setSelectedProduct(null);}}>BP</div>
            <input type="text" placeholder="SEARCH" className="bg-transparent border-b border-white/10 outline-none text-[10px] tracking-widest w-24 md:w-40 focus:border-pink-500 transition-all" onChange={(e) => setSearchQuery(e.target.value)} />
         </div>
         <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2">
            <span className="text-[11px] font-black tracking-widest uppercase">BAG</span>
            <span className="bg-pink-500 text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{cart.length}</span>
         </button>
      </nav>

      <div className="flex pt-28 min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 p-10 space-y-4 text-[10px] font-black uppercase tracking-[0.2em] fixed h-full opacity-60">
          {['NEW', 'T-SHIRTS', 'SWEATSHIRTS', 'JACKETS', 'BOTTOMS'].map(cat => (
            <button key={cat} className="text-left hover:text-pink-500 transition-all">{cat}</button>
          ))}
        </aside>

        <div className="flex-1 lg:ml-64 px-6 md:px-10 pb-20">
          {/* 1. CATALOGUE SELECTION */}
          {!activeCatalogue && !selectedProduct ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {catalogues.map((cat) => (
                <div key={cat.id} onClick={() => setActiveCatalogue(cat)} className="group h-[400px] border border-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-pink-500/40 transition-all bg-white/[0.02] rounded-3xl relative overflow-hidden">
                  <h2 className="text-xl uppercase tracking-[0.5em] font-black z-10 group-hover:scale-110 transition-transform">{cat.name}</h2>
                  <p className="mt-4 text-[8px] tracking-[0.4em] opacity-40 uppercase z-10">Enter Archive</p>
                </div>
              ))}
            </div>
          ) : activeCatalogue && !selectedProduct ? (
            /* 2. PRODUCT GRID (RELATIVE SIZING) */
            <div className="animate-in fade-in duration-700">
              <button onClick={() => setActiveCatalogue(null)} className="mb-10 text-[9px] uppercase tracking-widest opacity-40 hover:opacity-100">← Back</button>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {activeCatalogue.products?.map((p: any) => (
                  <div key={p.id} onClick={() => openProduct(p)} className="cursor-pointer group flex flex-col items-center">
                    <div className="w-full aspect-[4/5] bg-white/[0.03] rounded-3xl border border-white/5 flex items-center justify-center p-8 group-hover:bg-white/[0.06] transition-all overflow-hidden">
                      <img src={p.image_url} className="max-h-full max-w-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <h3 className="mt-6 text-[11px] font-black uppercase tracking-widest text-center">{p.name}</h3>
                    <p className="mt-1 text-[13px] font-bold opacity-50">£{p.price}.00</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 3. PRODUCT DETAIL (FIXED IMAGE SIZES) */
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 animate-in slide-in-from-bottom-4">
              <div className="xl:col-span-1 flex flex-col gap-3">
                 <div className="w-full aspect-[4/5] bg-white/5 rounded-xl border border-white/10 p-2 flex items-center justify-center">
                    <img src={activeImage} className="max-h-full object-contain" />
                 </div>
              </div>

              <div className="xl:col-span-6">
                <div className="w-full aspect-[4/5] bg-white/[0.03] rounded-[40px] border border-white/10 flex items-center justify-center p-12 relative overflow-hidden">
                   <img src={activeImage} className="max-h-full max-w-full object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)]" />
                </div>
              </div>

              <div className="xl:col-span-5 space-y-10">
                <header>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none italic">{selectedProduct.name}</h1>
                  <p className="text-2xl font-bold mt-4">£{selectedProduct.price}.00</p>
                </header>

                <div className="space-y-4">
                  <p className="text-[10px] font-black tracking-widest text-pink-500 uppercase">Size</p>
                  <div className="grid grid-cols-5 gap-2 w-fit">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                      <button key={s} onClick={() => setSelectedSize(s)} className={`w-14 h-14 border flex items-center justify-center text-[11px] font-black transition-all relative overflow-hidden ${selectedSize === s ? 'border-pink-500 bg-pink-500 text-black' : 'border-white/10 text-white/40 hover:border-white/40'}`}>
                        {selectedSize !== s && <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20"><div className="w-[120%] h-[1px] bg-pink-500 -rotate-45" /></div>}
                        <span className="relative z-10">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={addToCart} className="w-full py-5 border-2 border-red-900/40 text-red-600 font-black text-[12px] tracking-[0.5em] hover:bg-red-900 hover:text-white transition-all uppercase">
                  {selectedSize ? 'ADD TO BAG' : 'SELECT SIZE'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CART DRAWER & PAYMENT */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0a0a0a] h-full p-10 border-l border-white/10 flex flex-col">
            <h2 className="text-[12px] font-black tracking-[0.5em] mb-12 uppercase italic">Your Archive</h2>
            <div className="flex-1 overflow-y-auto space-y-6">
              {cart.map((item, i) => (
                <div key={i} className="flex gap-4 items-center border-b border-white/5 pb-4">
                  <div className="w-16 h-20 bg-white/5 rounded-lg flex items-center justify-center p-2"><img src={item.activeImage} className="max-h-full object-contain" /></div>
                  <div className="flex-1"><p className="text-[10px] font-black uppercase">{item.name}</p><p className="text-[9px] opacity-40 uppercase">{item.selectedSize}</p></div>
                  <p className="text-[12px] font-bold">£{item.price}</p>
                </div>
              ))}
            </div>
            <div className="pt-8 space-y-4">
              <input placeholder="EMAIL ADDRESS" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-transparent border-b border-white/10 py-4 outline-none text-[11px] text-white focus:border-pink-500" />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setSelectedMethod('MPESA')} className={`py-4 text-[9px] border uppercase font-black transition-all ${selectedMethod === 'MPESA' ? 'border-pink-500 text-pink-500' : 'border-white/5 opacity-40'}`}>M-Pesa</button>
                <button onClick={() => setSelectedMethod('VISA')} className={`py-4 text-[9px] border uppercase font-black transition-all ${selectedMethod === 'VISA' ? 'border-pink-500 text-pink-500' : 'border-white/5 opacity-40'}`}>Card</button>
              </div>
              <button disabled={loading} onClick={handleFinalOrder} className="w-full py-5 bg-pink-500 text-black font-black text-[11px] tracking-[0.3em] uppercase hover:bg-white transition-all">
                {loading ? 'LOGGING...' : 'CHECKOUT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}