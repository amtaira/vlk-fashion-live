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
  const [selectedSize, setSelectedSize] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handlePopState = (event: any) => {
      if (event.state) {
        setView(event.state.view);
        setActiveCat(event.state.cat);
        setSelectedProduct(event.state.prod);
        if (event.state.prod) setActiveImage(event.state.prod.image_url);
      } else {
        setView('CATALOGUE');
        setActiveCat(null);
        setSelectedProduct(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newView: ViewState, cat: any = null, prod: any = null) => {
    setView(newView);
    setActiveCat(cat);
    setSelectedProduct(prod);
    if (prod) setActiveImage(prod.image_url);
    window.history.pushState({ view: newView, cat, prod }, "");
  };

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('catalogues').select('*, products(*)');
      if (data) setCatalogues(data);
    }
    fetchData();
  }, []);

  const handleFinalPayment = async (method: string) => {
    setIsProcessing(true);
    const orderData = {
      items: cart,
      total: cart.reduce((acc, curr) => acc + Number(curr.price), 0),
      payment_method: method,
      status: 'pending_admin_approval',
      created_at: new Date()
    };
    const { error } = await supabase.from('orders').insert([orderData]);
    if (!error) {
      alert(`VLK²: Order sent to Admin via ${method}!`);
      setCart([]);
      setShowPaymentPrompt(false);
      setIsCartOpen(false);
    }
    setIsProcessing(false);
  };

  return (
    <main className="min-h-screen bg-black text-white font-mono selection:bg-pink-500">
      {/* BACKGROUND IMAGE (Dialogue View Only) */}
      {view === 'CATALOGUE' && (
        <div className="fixed inset-0 -z-10 opacity-30 bg-cover bg-center grayscale" 
             style={{ backgroundImage: "url('/hero-bg.jpg')" }} />
      )}

      {/* 1. PERSISTENT SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-48 border-r border-white/5 z-50 pt-32 px-6 hidden lg:flex flex-col">
        <p className="text-[10px] font-black opacity-30 mb-8 tracking-[0.3em] uppercase underline">Archives</p>
        <div className="flex flex-col gap-4 flex-1">
          {catalogues.map(cat => (
            <button key={cat.id} onClick={() => navigate('GRID', cat)}
              className={`text-left text-[11px] uppercase tracking-widest hover:text-pink-500 transition-colors ${activeCat?.id === cat.id ? 'text-pink-500 font-bold' : 'opacity-60'}`}>
              {cat.name}
            </button>
          ))}
        </div>
        <div className="pb-10 space-y-4">
          <p className="text-[9px] font-black opacity-20 uppercase tracking-widest">Connect</p>
          <div className="flex flex-col gap-2 text-[10px] uppercase font-bold">
            <a href="#" className="hover:text-pink-500">Instagram</a>
            <a href="#" className="hover:text-pink-500">Twitter/X</a>
          </div>
        </div>
      </aside>

      {/* 2. HEADER */}
      <nav className="fixed top-0 w-full z-[100] px-10 py-8 flex justify-between items-center bg-black/50 backdrop-blur-md">
        <div className="font-black text-white text-2xl tracking-tighter cursor-pointer hover:italic" onClick={() => navigate('CATALOGUE')}>VLK²</div>
        <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 group">
          <span className="text-[11px] font-black tracking-[0.3em]">BAG ({cart.length})</span>
        </button>
      </nav>

      {/* 3. MAIN CONTENT */}
      <div className="lg:pl-48 pt-32 px-6 md:px-10 pb-20">
        
        {/* VIEW: CATALOGUE (DIALOGUE BOXES) */}
        {view === 'CATALOGUE' && (
          <div className="flex flex-wrap gap-8 justify-center items-center mt-20 max-w-5xl mx-auto">
            {catalogues.map(cat => (
              <div key={cat.id} onClick={() => navigate('GRID', cat)} 
                   className="w-full max-w-xs border-2 border-white bg-black/90 p-10 cursor-pointer hover:bg-white hover:text-black transition-all group shadow-[8px_8px_0px_#ec4899]">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter group-hover:scale-105 transition-transform">{cat.name}</h2>
                <div className="mt-4 text-[10px] font-bold border border-current inline-block px-2 py-1">OPEN FOLDER</div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: GRID (PRODUCT LIST) */}
        {view === 'GRID' && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {activeCat?.products?.map((p: any) => (
              <div key={p.id} onClick={() => navigate('DETAIL', activeCat, p)} className="cursor-pointer group">
                <div className="aspect-[4/5] bg-zinc-900/50 flex items-center justify-center overflow-hidden border border-white/5">
                  <img src={p.image_url} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform" />
                </div>
                <div className="mt-4 flex justify-between items-start">
                  <p className="text-[10px] font-black uppercase tracking-widest max-w-[70%]">{p.name}</p>
                  <p className="text-[10px] font-bold opacity-60">£{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: DETAIL (RELATIVE LAYOUT) */}
        {view === 'DETAIL' && selectedProduct && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* LEFT: IMAGE COLUMN (Relative Size) */}
            <div className="flex flex-col gap-6">
              <div className="relative aspect-square bg-zinc-900/30 border border-white/5 flex items-center justify-center max-h-[60vh]">
                <img src={activeImage} className="max-h-full max-w-full object-contain p-6" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {selectedProduct.variants?.map((v: any, idx: number) => (
                  <button key={idx} onClick={() => setActiveImage(v.url)} 
                          className={`aspect-square border p-1 bg-zinc-900 ${activeImage === v.url ? 'border-pink-500' : 'border-white/5 opacity-50'}`}>
                    <img src={v.url} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: INFO COLUMN */}
            <div className="space-y-10">
              <div className="space-y-4">
                <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">{selectedProduct.name}</h1>
                <p className="text-2xl font-bold opacity-80">£{selectedProduct.price}.00</p>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">Select Size</p>
                <div className="grid grid-cols-5 border border-white/10">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} 
                      className={`py-4 text-[11px] font-black border-r border-white/10 last:border-0 transition-all ${selectedSize === s ? 'bg-white text-black' : 'hover:bg-white/5'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => {
                  if(!selectedSize) return alert("CHOOSE SIZE");
                  setCart([...cart, {...selectedProduct, selectedSize, activeImage}]);
                  setIsCartOpen(true);
                }}
                className="w-full py-6 bg-pink-500 text-black font-black uppercase tracking-[0.3em] hover:bg-white transition-all text-sm"
              >
                Add to Bag
              </button>

              <div className="pt-10 border-t border-white/5 text-[11px] leading-relaxed opacity-40 uppercase space-y-4 font-bold">
                <p>• {selectedProduct.description || "440GSM Heavyweight Luxury Cotton"}</p>
                <p>• Intricate Puff-Print Detailing</p>
                <p className="text-pink-500">• Boxy Relaxed Fit - True to size</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. PAYMENT MODAL */}
      {showPaymentPrompt && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
          <div className="relative w-full max-w-sm border-2 border-white p-10 space-y-8 bg-black">
            <h2 className="text-2xl font-black uppercase italic mb-8 underline">Payment Method</h2>
            <div className="space-y-3">
              <button onClick={() => handleFinalPayment('VISA')} className="w-full p-4 border border-white/20 hover:bg-white hover:text-black font-bold uppercase text-xs">Visa / Card</button>
              <button onClick={() => handleFinalPayment('M-PESA')} className="w-full p-4 border border-white/20 hover:bg-white hover:text-black font-bold uppercase text-xs text-green-500">M-Pesa Paybill</button>
            </div>
            <button onClick={() => setShowPaymentPrompt(false)} className="w-full text-[10px] opacity-30 uppercase">Cancel</button>
          </div>
        </div>
      )}

      {/* 5. CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/80" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-black border-l border-white/10 h-full p-10 flex flex-col">
            <h2 className="text-[14px] font-black tracking-[0.5em] uppercase italic mb-10 underline">The Bag</h2>
            <div className="flex-1 overflow-y-auto space-y-6">
              {cart.map((item, i) => (
                <div key={i} className="flex gap-4 border-b border-white/5 pb-4">
                  <img src={item.activeImage} className="w-16 h-20 object-contain bg-zinc-900" />
                  <div className="flex-1 text-[10px] uppercase font-black">
                    <p>{item.name}</p>
                    <p className="text-pink-500 mt-1">{item.selectedSize}</p>
                    <p className="mt-2 opacity-60">£{item.price}.00</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-10 space-y-4">
              <div className="flex justify-between font-black text-xl">
                <span>TOTAL</span>
                <span>£{cart.reduce((acc, curr) => acc + Number(curr.price), 0)}</span>
              </div>
              <button onClick={() => setShowPaymentPrompt(true)} className="w-full py-5 bg-pink-500 text-black font-black uppercase tracking-widest text-sm">Proceed to Payment</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}