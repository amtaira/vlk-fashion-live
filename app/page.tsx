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

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('catalogues').select('*, products(*)');
      if (data) setCatalogues(data);
    }
    fetchData();
  }, []);

  const navigate = (newView: ViewState, cat: any = null, prod: any = null) => {
    setView(newView);
    setActiveCat(cat);
    setSelectedProduct(prod);
    if (prod) setActiveImage(prod.image_url);
    window.scrollTo(0, 0);
  };

  const handleOrderSubmission = async (method: string) => {
    const orderData = {
      items: cart,
      total: cart.reduce((acc, curr) => acc + Number(curr.price), 0),
      payment_method: method,
      status: 'SEND_TO_ADMIN'
    };
    const { error } = await supabase.from('orders').insert([orderData]);
    if (!error) {
      alert("ORDER SENT TO ADMIN FOR DELIVERY");
      setCart([]);
      setShowPaymentPrompt(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-mono selection:bg-pink-500">
      
      {/* BACKGROUND FOR LANDING PAGE ONLY */}
      {view === 'CATALOGUE' && (
        <div className="fixed inset-0 -z-10 opacity-30 bg-cover bg-center grayscale" 
             style={{ backgroundImage: "url('/hero-bg.jpg')" }} />
      )}

      {/* HEADER */}
      <nav className="fixed top-0 w-full z-[100] px-10 py-8 flex justify-between items-center">
        <div className="font-black text-2xl tracking-tighter cursor-pointer" onClick={() => navigate('CATALOGUE')}>
          VLK²
        </div>
        <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2">
          <span className="text-[11px] font-black tracking-widest uppercase">BAG ({cart.length})</span>
        </button>
      </nav>

      {/* PERSISTENT SIDEBAR (Shift Catalogues & Socials) */}
      <aside className="fixed left-0 top-0 h-full w-56 border-r border-white/5 pt-32 px-8 z-40 hidden lg:block">
        <div className="space-y-8">
          <div>
            <p className="text-[10px] opacity-30 uppercase mb-4 tracking-widest">Catalogues</p>
            <div className="flex flex-col gap-3">
              {catalogues.map(cat => (
                <button key={cat.id} onClick={() => navigate('GRID', cat)}
                  className={`text-left text-[12px] uppercase tracking-tighter hover:text-pink-500 transition-all ${activeCat?.id === cat.id ? 'text-pink-500 italic font-bold' : 'opacity-60'}`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-10 border-t border-white/5">
            <p className="text-[10px] opacity-30 uppercase mb-4 tracking-widest">Socials</p>
            <div className="flex flex-col gap-3 text-[11px] uppercase">
              <a href="#" className="hover:text-pink-500">Instagram</a>
              <a href="#" className="hover:text-pink-500">X / Twitter</a>
              <a href="#" className="hover:text-pink-500">TikTok</a>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="lg:pl-56 pt-32 px-6 md:px-10 pb-20">
        
        {/* VIEW 1: CATALOGUE (Dialog Boxes Style) */}
        {view === 'CATALOGUE' && (
          <div className="flex flex-wrap gap-6 justify-center mt-10">
            {catalogues.map(cat => (
              <div key={cat.id} onClick={() => navigate('GRID', cat)}
                className="w-full max-w-sm aspect-video border-2 border-white bg-black/80 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:text-black transition-all p-6 text-center shadow-[10px_10px_0px_#ec4899]">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">{cat.name}</h2>
                <div className="mt-4 px-4 py-1 border border-current text-[10px] font-bold uppercase">Open Folder</div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: PRODUCT GRID */}
        {view === 'GRID' && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
            {activeCat?.products?.map((p: any) => (
              <div key={p.id} onClick={() => navigate('DETAIL', activeCat, p)} className="cursor-pointer group">
                <div className="aspect-[4/5] bg-zinc-900 flex items-center justify-center p-4">
                  <img src={p.image_url} className="max-h-full object-contain" />
                </div>
                <h3 className="mt-4 text-[11px] font-black uppercase italic">{p.name}</h3>
                <p className="text-sm opacity-60">£{p.price}.00</p>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 3: DETAIL (Matches First Photo) */}
        {view === 'DETAIL' && selectedProduct && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-start">
            
            {/* LEFT: IMAGE & VIEWS */}
            <div className="space-y-8">
              <div className="aspect-[4/5] bg-zinc-900 flex items-center justify-center relative group">
                <img src={activeImage} className="w-full h-full object-contain p-10" />
              </div>
              {/* Image Views Selector */}
              <div className="flex gap-4">
                {selectedProduct.variants?.map((v: any, i: number) => (
                  <button key={i} onClick={() => setActiveImage(v.url)} 
                    className={`w-20 h-24 border-2 p-1 bg-zinc-900 ${activeImage === v.url ? 'border-pink-500' : 'border-transparent opacity-40'}`}>
                    <img src={v.url} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: DETAILS SIDEBAR */}
            <div className="space-y-10 sticky top-32">
              <div className="space-y-2">
                <h1 className="text-6xl font-black uppercase italic leading-none tracking-tighter">
                  {selectedProduct.name}
                </h1>
                <p className="text-3xl font-bold">£{selectedProduct.price}.00</p>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] uppercase font-black opacity-30 tracking-widest">Select Size</p>
                <div className="grid grid-cols-5 border border-white/20">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`py-4 text-[11px] font-black border-r border-white/20 last:border-0 hover:bg-white hover:text-black transition-all ${selectedSize === s ? 'bg-pink-500 text-black' : ''}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => {
                  if(!selectedSize) return alert("SELECT SIZE");
                  setCart([...cart, {...selectedProduct, selectedSize, activeImage}]);
                  setIsCartOpen(true);
                }}
                className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-sm hover:bg-pink-500 transition-all"
              >
                Add to Bag
              </button>

              <div className="pt-10 border-t border-white/10 space-y-4 text-[11px] uppercase opacity-60 leading-relaxed font-bold">
                <p>• {selectedProduct.description || "Heavyweight Premium Cotton"}</p>
                <p>• Signature VLK² Graphics</p>
                <p className="text-pink-500">• Boxy Fit - True to size</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PAYMENT PROMPT MODAL */}
      {showPaymentPrompt && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-md border-2 border-white bg-black p-10 space-y-6 shadow-[10px_10px_0px_#ec4899]">
            <h2 className="text-xl font-black uppercase italic">Payment Method</h2>
            <div className="grid gap-4">
              <button onClick={() => handleOrderSubmission('VISA')} className="w-full py-4 border border-white hover:bg-white hover:text-black font-black uppercase text-xs">Visa Card</button>
              <button onClick={() => handleOrderSubmission('MPESA')} className="w-full py-4 border border-white hover:bg-white hover:text-black font-black uppercase text-xs">M-Pesa Paybill</button>
            </div>
            <button onClick={() => setShowPaymentPrompt(false)} className="w-full text-[10px] opacity-40 uppercase">Back</button>
          </div>
        </div>
      )}

      {/* BAG DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/80" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-black border-l border-white/10 h-full p-10 flex flex-col">
            <h2 className="text-[14px] font-black uppercase italic mb-10">Current Bag</h2>
            <div className="flex-1 overflow-y-auto space-y-4">
              {cart.map((item, i) => (
                <div key={i} className="flex gap-4 items-center border-b border-white/5 pb-4">
                  <img src={item.activeImage} className="w-16 h-20 object-contain" />
                  <div className="flex-1 text-[10px] font-black uppercase">
                    <p>{item.name}</p>
                    <p className="text-pink-500">{item.selectedSize}</p>
                  </div>
                  <p className="font-bold">£{item.price}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setShowPaymentPrompt(true)} className="w-full py-5 bg-pink-500 text-black font-black uppercase mt-6">Checkout</button>
          </div>
        </div>
      )}
    </main>
  );
}