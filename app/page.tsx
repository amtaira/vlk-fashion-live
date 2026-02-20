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
  
  // Payment States
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
    if (!selectedSize) return alert("PLEASE SELECT A SIZE");
    setCart([...cart, { ...selectedProduct, selectedSize, activeImage, selectedColor }]);
    setIsCartOpen(true);
  };

  // Logic to send order to Admin
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
      alert(`Order sent to Admin via ${method}! Check your delivery status soon.`);
      setCart([]);
      setShowPaymentPrompt(false);
      setIsCartOpen(false);
    } else {
      alert("Error sending order to admin.");
    }
    setIsProcessing(false);
  };

  return (
    <main className="min-h-screen bg-black text-white font-mono selection:bg-pink-500">
      {/* 1. PERSISTENT CATEGORY SIDEBAR (LEFT) */}
      <aside className="fixed left-0 top-0 h-full w-48 border-r border-white/5 z-50 pt-32 px-6 hidden lg:block">
        <p className="text-[10px] font-black opacity-30 mb-8 tracking-[0.3em] uppercase">Archive</p>
        <div className="flex flex-col gap-4">
          {catalogues.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => navigate('GRID', cat)}
              className={`text-left text-[11px] uppercase tracking-widest hover:text-pink-500 transition-colors ${activeCat?.id === cat.id ? 'text-pink-500 font-bold' : 'opacity-60'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </aside>

      {/* 2. HEADER */}
      <nav className="fixed top-0 w-full z-[100] px-10 py-8 flex justify-between items-center bg-black/50 backdrop-blur-md">
        <div className="font-black text-pink-500 text-xl cursor-pointer" onClick={() => navigate('CATALOGUE')}>RTW</div>
        <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2">
          <span className="text-[11px] font-black tracking-[0.3em]">BAG ({cart.length})</span>
        </button>
      </nav>

      {/* 3. MAIN CONTENT (Offset for Sidebar) */}
      <div className="lg:pl-48 pt-32 px-6 md:px-10 pb-20">
        
        {view === 'CATALOGUE' && (
          <div className="max-w-4xl mx-auto space-y-4">
            {catalogues.map(cat => (
              <div key={cat.id} onClick={() => navigate('GRID', cat)} className="group cursor-pointer border-b border-white/5 py-10 flex justify-between items-center hover:px-4 transition-all">
                <h2 className="text-4xl font-black uppercase italic group-hover:text-pink-500">{cat.name}</h2>
                <span className="opacity-20 group-hover:opacity-100 transition-opacity">VIEW ALL →</span>
              </div>
            ))}
          </div>
        )}

        {view === 'GRID' && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-500">
            {activeCat?.products?.map((p: any) => (
              <div key={p.id} onClick={() => navigate('DETAIL', activeCat, p)} className="cursor-pointer group">
                <div className="aspect-[4/5] bg-[#0a0a0a] flex items-center justify-center overflow-hidden border border-white/5">
                  <img src={p.image_url} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform" />
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-60">{p.name}</p>
                <p className="text-sm font-bold">£{p.price}.00</p>
              </div>
            ))}
          </div>
        )}

        {view === 'DETAIL' && selectedProduct && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-12">
            
            {/* CENTER: IMAGE GALLERY */}
            <div className="xl:col-span-7 space-y-6">
              <div className="aspect-[4/5] bg-[#0a0a0a] border border-white/5 flex items-center justify-center overflow-hidden">
                <img src={activeImage} className="w-full h-full object-contain p-8" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {/* Variant Views */}
                {selectedProduct.variants?.map((v: any, idx: number) => (
                  <button key={idx} onClick={() => {setActiveImage(v.url); setSelectedColor(v.color);}} className={`aspect-square border p-1 ${activeImage === v.url ? 'border-pink-500' : 'border-white/5'}`}>
                    <img src={v.url} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: FIXED CONTROLS */}
            <div className="xl:col-span-5 space-y-10">
              <div className="space-y-2">
                <h1 className="text-5xl font-black uppercase italic leading-none">{selectedProduct.name}</h1>
                <p className="text-2xl font-bold opacity-60 italic">£{selectedProduct.price}.00</p>
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

              <button onClick={addToBag} className="w-full py-6 bg-pink-500 text-black font-black uppercase tracking-[0.3em] hover:bg-white transition-all">
                Add to Bag
              </button>

              <div className="pt-10 border-t border-white/5 text-[11px] leading-relaxed opacity-40 uppercase space-y-4">
                <p>• {selectedProduct.description || "Premium Heavyweight Cotton"}</p>
                <p>• Signature Branding throughout</p>
                <p>• Ships worldwide</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. PAYMENT MODAL PROMPT */}
      {showPaymentPrompt && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowPaymentPrompt(false)} />
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 p-10 animate-in zoom-in-95">
            <h2 className="text-2xl font-black uppercase italic italic mb-8">Secure Checkout</h2>
            
            <div className="space-y-3">
              <button 
                disabled={isProcessing}
                onClick={() => handleFinalPayment('VISA')}
                className="w-full p-5 border border-white/10 flex justify-between items-center hover:bg-white hover:text-black transition-all group"
              >
                <span className="font-bold text-xs tracking-widest uppercase">Visa / Card</span>
                <span className="text-[10px] opacity-40">Credit/Debit</span>
              </button>

              <button 
                disabled={isProcessing}
                onClick={() => handleFinalPayment('M-PESA PAYBILL')}
                className="w-full p-5 border border-white/10 flex justify-between items-center hover:bg-[#2fb344] hover:text-white transition-all group"
              >
                <span className="font-bold text-xs tracking-widest uppercase">M-Pesa Paybill</span>
                <span className="text-[10px] font-black">400200</span>
              </button>
            </div>

            <button onClick={() => setShowPaymentPrompt(false)} className="w-full mt-8 text-[10px] opacity-30 uppercase font-black hover:opacity-100">Cancel</button>
          </div>
        </div>
      )}

      {/* 5. BAG DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/80" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-black border-l border-white/10 h-full p-10 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-[14px] font-black tracking-[0.5em] uppercase italic">The Bag</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-[10px] opacity-40">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6">
              {cart.map((item, i) => (
                <div key={i} className="flex gap-4 border-b border-white/5 pb-4">
                  <img src={item.activeImage} className="w-16 h-20 object-contain bg-white/5" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase">{item.name}</p>
                    <p className="text-[9px] text-pink-500 uppercase mt-1">{item.selectedSize} / {item.selectedColor}</p>
                    <p className="font-bold text-xs mt-2">£{item.price}.00</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-10 border-t border-white/10 space-y-4">
              <div className="flex justify-between font-black text-xl">
                <span>TOTAL</span>
                <span>£{cart.reduce((acc, curr) => acc + Number(curr.price), 0)}</span>
              </div>
              <button onClick={() => setShowPaymentPrompt(true)} className="w-full py-5 bg-pink-500 text-black font-black uppercase tracking-widest hover:bg-white transition-all">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}