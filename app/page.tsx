'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type ViewState = 'CATALOGUE' | 'GRID' | 'DETAIL';

export default function Home() {
  const [view, setView] = useState<ViewState>('CATALOGUE');
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  // 1. SYNC BROWSER BACK/FORWARD ARROWS
  useEffect(() => {
    const handlePopState = (event: any) => {
      if (event.state) {
        setView(event.state.view);
        setActiveCat(event.state.cat);
        setSelectedProduct(event.state.prod);
        if (event.state.prod) {
          setActiveImage(event.state.prod.image_url);
        }
      } else {
        setView('CATALOGUE');
        setActiveCat(null);
        setSelectedProduct(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Custom Navigation function that pushes to Browser History
  const navigate = (newView: ViewState, cat: any = null, prod: any = null) => {
    setView(newView);
    setActiveCat(cat);
    setSelectedProduct(prod);
    if (prod) {
      setActiveImage(prod.image_url);
      setSelectedColor(prod.variants?.[0]?.color || 'OG');
    }
    window.history.pushState({ view: newView, cat, prod }, "");
  };

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('catalogues').select('*, products(*)');
      if (data) setCatalogues(data);
    }
    fetchData();
  }, []);

  const addToBag = () => {
    if (!selectedSize) return alert("SELECT SIZE");
    setCart([...cart, { ...selectedProduct, selectedSize, activeImage }]);
    setSelectedSize('');
    setIsCartOpen(true);
  };

  return (
    <main className="min-h-screen text-white relative overflow-x-hidden">
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-black" />
      <div className="fixed inset-0 -z-10 opacity-30 bg-cover bg-center grayscale pointer-events-none" 
           style={{ backgroundImage: "url('/hero-bg.jpg')" }} />

      {/* FIXED HEADER */}
      <nav className="fixed top-0 w-full z-[100] px-10 py-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="font-black text-pink-500 border border-pink-500 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-pink-500 hover:text-black transition-all" 
             onClick={() => navigate('CATALOGUE')}>BP</div>
        
        <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 group bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
          <span className="text-[11px] font-black tracking-[0.3em]">BAG</span>
          <span className="bg-pink-500 text-black text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold transition-transform group-hover:scale-110">
            {cart.length}
          </span>
        </button>
      </nav>

      <div className="pt-32 px-6 md:px-10 pb-20">
        
        {/* VIEW 1: CATALOGUE LIST */}
        {view === 'CATALOGUE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto animate-in fade-in duration-500">
            {catalogues.map(cat => (
              <div key={cat.id} onClick={() => navigate('GRID', cat)} 
                   className="h-96 border border-white/10 rounded-[40px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group relative overflow-hidden">
                <h2 className="text-3xl font-black tracking-[0.4em] uppercase group-hover:text-pink-500 transition-colors z-10">{cat.name}</h2>
                <div className="mt-4 h-[1px] w-12 bg-pink-500 transition-all group-hover:w-24 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: PRODUCT GRID */}
        {view === 'GRID' && (
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            <button onClick={() => window.history.back()} className="mb-10 text-[10px] font-black opacity-40 hover:opacity-100 uppercase tracking-widest flex items-center gap-2">
              <span className="text-lg">←</span> Return to Archive
            </button>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {activeCat?.products?.map((p: any) => (
                <div key={p.id} onClick={() => navigate('DETAIL', activeCat, p)} className="cursor-pointer group text-center">
                  <div className="aspect-[4/5] flex items-center justify-center transition-all duration-500 group-hover:scale-105">
                    <img src={p.image_url} className="max-h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]" />
                  </div>
                  <h3 className="mt-8 text-[11px] font-black uppercase tracking-widest opacity-80 group-hover:opacity-100 group-hover:text-pink-500">{p.name}</h3>
                  <p className="text-white font-bold mt-2 text-sm">£{p.price}.00</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: PRODUCT DETAIL (FLOATING SIDE-BY-SIDE) */}
        {view === 'DETAIL' && selectedProduct && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 animate-in slide-in-from-bottom-8 duration-700">
            
            {/* LARGE FLOATING IMAGE */}
            <div className="flex items-center justify-center min-h-[50vh]">
               <img src={activeImage} className="w-full max-h-[75vh] object-contain drop-shadow-[0_40px_100px_rgba(0,0,0,0.8)] transition-all duration-700 hover:scale-110" />
            </div>
             
            {/* SIDE DESCRIPTIONS */}
            <div className="flex flex-col justify-center space-y-10">
                <header className="space-y-4">
                   <h1 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter italic leading-[0.8]">{selectedProduct.name}</h1>
                   <div className="flex items-center gap-6">
                      <p className="text-4xl font-bold text-pink-500">£{selectedProduct.price}.00</p>
                      <span className="text-[10px] border border-white/20 px-3 py-1 rounded-full opacity-40 uppercase font-black tracking-widest">In Stock</span>
                   </div>
                </header>

                {/* COLORS */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Style: {selectedColor}</p>
                  <div className="flex gap-3">
                    {selectedProduct.variants?.map((v: any) => (
                      <button key={v.color} onClick={() => {setActiveImage(v.url); setSelectedColor(v.color);}} 
                              className={`w-14 h-14 border-2 p-1 transition-all ${selectedColor === v.color ? 'border-pink-500' : 'border-white/10 opacity-50 hover:opacity-100'}`}>
                        <img src={v.url} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* SIZES */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-pink-500 tracking-[0.4em] uppercase">Select Size</p>
                  <div className="flex flex-wrap gap-2">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                      <button key={s} onClick={() => setSelectedSize(s)} 
                              className={`w-14 h-14 border flex items-center justify-center text-[11px] font-black transition-all relative ${selectedSize === s ? 'border-pink-500 bg-pink-500 text-black' : 'border-white/10 text-white/40 hover:border-white'}`}>
                        {selectedSize !== s && <div className="absolute inset-0 flex items-center justify-center opacity-20"><div className="w-full h-[1px] bg-pink-500 -rotate-45" /></div>}
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={addToBag} className="w-full py-6 bg-white text-black font-black text-[12px] tracking-[0.5em] hover:bg-pink-500 transition-all uppercase shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                  Add to Bag
                </button>

                <div className="pt-10 border-t border-white/5 space-y-4 opacity-30 text-[10px] font-black uppercase tracking-[0.2em]">
                   <p>• 450GSM Luxury Weight Cotton</p>
                   <p>• Intricate Puff-Print Detailing</p>
                   <p className="text-pink-500">• Boxy Relaxed Fit - True to size</p>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* MULTI-ITEM DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-black border-l border-white/10 h-full p-10 flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-[14px] font-black tracking-[0.5em] uppercase italic">The Bag</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-white/40 hover:text-white uppercase text-[10px] font-black">Close</button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-8 pr-2">
              {cart.map((item, i) => (
                <div key={i} className="flex gap-6 items-center border-b border-white/5 pb-6">
                  <div className="w-20 h-24 bg-white/5 flex items-center justify-center rounded-xl p-2">
                    <img src={item.activeImage || item.image_url} className="max-h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black uppercase tracking-widest">{item.name}</p>
                    <p className="text-[9px] text-pink-500 font-bold uppercase mt-1">Size: {item.selectedSize}</p>
                    <p className="text-sm font-bold mt-2">£{item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-10 space-y-4">
              <div className="flex justify-between font-black text-2xl border-t border-white/10 pt-6">
                <span className="text-[10px] tracking-widest opacity-40">TOTAL</span>
                <span className="text-pink-500">£{cart.reduce((acc, curr) => acc + Number(curr.price), 0)}.00</span>
              </div>
              <button className="w-full py-5 bg-pink-500 text-black font-black tracking-widest uppercase hover:bg-white transition-all shadow-[0_10px_30px_rgba(236,72,153,0.3)]">
                Checkout
              </button>
              <button onClick={() => setIsCartOpen(false)} className="w-full py-4 text-[9px] font-black tracking-[0.3em] opacity-40 uppercase hover:opacity-100">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}