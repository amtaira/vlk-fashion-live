'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type ViewState = 'CATALOGUE' | 'GRID' | 'DETAIL';

export default function Home() {
  const [view, setView] = useState<ViewState>('CATALOGUE');
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  // 1. SYNC BROWSER BACK BUTTON
  useEffect(() => {
    const handlePopState = (event: any) => {
      if (event.state) {
        setView(event.state.view);
        if (event.state.cat) setActiveCat(event.state.cat);
        if (event.state.prod) setSelectedProduct(event.state.prod);
      } else {
        setView('CATALOGUE');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newView: ViewState, cat: any = null, prod: any = null) => {
    setView(newView);
    setActiveCat(cat);
    setSelectedProduct(prod);
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
    setCart([...cart, { ...selectedProduct, selectedSize }]);
    setSelectedSize('');
    setIsCartOpen(true); // Shows the cart but lets them keep shopping
  };

  return (
    <main className="min-h-screen text-white relative overflow-x-hidden">
      {/* BACKGROUND: No frames, just the body content over your image */}
      <div className="fixed inset-0 -z-10 bg-black" />
      <div className="fixed inset-0 -z-10 opacity-30 bg-cover bg-center grayscale pointer-events-none" 
           style={{ backgroundImage: "url('/hero-bg.jpg')" }} />

      {/* HEADER */}
      <nav className="fixed top-0 w-full z-[100] px-10 py-8 flex justify-between items-center">
        <div className="font-black text-pink-500 border border-pink-500 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer" 
             onClick={() => navigate('CATALOGUE')}>BP</div>
        
        <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 group">
          <span className="text-[11px] font-black tracking-[0.3em]">BAG</span>
          <span className="bg-pink-500 text-black text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold transition-transform group-hover:scale-110">
            {cart.length}
          </span>
        </button>
      </nav>

      <div className="pt-32 px-10 pb-20">
        
        {/* VIEW 1: CATALOGUE LIST */}
        {view === 'CATALOGUE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {catalogues.map(cat => (
              <div key={cat.id} onClick={() => navigate('GRID', cat)} 
                   className="h-80 border border-white/10 rounded-[40px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group">
                <h2 className="text-2xl font-black tracking-[0.4em] uppercase group-hover:text-pink-500 transition-colors">{cat.name}</h2>
                <div className="mt-4 h-[1px] w-12 bg-pink-500 transition-all group-hover:w-24" />
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: PRODUCT GRID */}
        {view === 'GRID' && (
          <div className="max-w-7xl mx-auto">
            <button onClick={() => window.history.back()} className="mb-10 text-[10px] font-black opacity-40 hover:opacity-100 uppercase tracking-widest">← Return</button>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
              {activeCat?.products?.map((p: any) => (
                <div key={p.id} onClick={() => navigate('DETAIL', activeCat, p)} className="cursor-pointer group">
                  {/* Image Background removed - just the product floating */}
                  <div className="aspect-[4/5] flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                    <img src={p.image_url} className="max-h-full object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.5)]" />
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="text-[11px] font-black uppercase tracking-widest">{p.name}</h3>
                    <p className="text-pink-500 font-bold mt-2">£{p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: PRODUCT DETAIL */}
        {view === 'DETAIL' && selectedProduct && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20">
             <div className="lg:col-span-7 flex items-center justify-center">
                <img src={selectedProduct.image_url} className="w-full max-h-[70vh] object-contain drop-shadow-[0_50px_80px_rgba(0,0,0,0.6)]" />
             </div>
             
             <div className="lg:col-span-5 flex flex-col justify-center space-y-10">
                <header>
                   <h1 className="text-6xl font-black uppercase tracking-tighter italic">{selectedProduct.name}</h1>
                   <p className="text-3xl font-bold mt-4">£{selectedProduct.price}.00</p>
                </header>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-pink-500 tracking-[0.4em]">SELECT SIZE</p>
                  <div className="flex gap-3">
                    {['S', 'M', 'L', 'XL'].map(s => (
                      <button key={s} onClick={() => setSelectedSize(s)} 
                              className={`w-16 h-16 border-2 font-black transition-all relative ${selectedSize === s ? 'border-pink-500 bg-pink-500 text-black' : 'border-white/10 text-white/40'}`}>
                        {selectedSize !== s && <div className="absolute inset-0 flex items-center justify-center opacity-20"><div className="w-full h-[1px] bg-pink-500 -rotate-45" /></div>}
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={addToBag} className="w-full py-6 bg-white text-black font-black text-[12px] tracking-[0.5em] hover:bg-pink-500 transition-all uppercase">
                  Add to Bag
                </button>
             </div>
          </div>
        )}
      </div>

      {/* MULTI-ITEM CART (DRAWER) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-black border-l border-white/10 h-full p-10 flex flex-col">
            <h2 className="text-[14px] font-black tracking-[0.5em] uppercase italic mb-10">Current Bag</h2>
            
            <div className="flex-1 overflow-y-auto space-y-6">
              {cart.map((item, i) => (
                <div key={i} className="flex gap-4 items-center border-b border-white/5 pb-4">
                  <img src={item.image_url} className="w-16 h-16 object-contain" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase">{item.name}</p>
                    <p className="text-[9px] text-pink-500 uppercase">{item.selectedSize}</p>
                  </div>
                  <p className="font-bold">£{item.price}</p>
                </div>
              ))}
            </div>

            <div className="pt-10 space-y-4">
              <div className="flex justify-between font-black text-xl border-t border-white/10 pt-4">
                <span>TOTAL</span>
                <span>£{cart.reduce((acc, curr) => acc + Number(curr.price), 0)}</span>
              </div>
              <button className="w-full py-5 bg-pink-500 text-black font-black tracking-widest uppercase hover:bg-white transition-all">
                Proceed to Payment
              </button>
              <button onClick={() => setIsCartOpen(false)} className="w-full py-4 text-[10px] font-black tracking-widest opacity-40 uppercase">
                Keep Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}