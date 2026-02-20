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
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);

  // Fetch Data
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
    if (prod) {
      setActiveImage(prod.image_url);
      setSelectedColor(prod.variants?.[0]?.color || 'DEFAULT');
    }
  };

  const addToBag = () => {
    if (!selectedSize) return alert("PLEASE SELECT A SIZE");
    setCart([...cart, { ...selectedProduct, selectedSize, activeImage }]);
    setIsCartOpen(true);
  };

  return (
    <main className="min-h-screen bg-black text-[#D4AF37] font-mono selection:bg-[#D4AF37] selection:text-black">
      
      {/* 1. TOP NAV (Global) */}
      <nav className="fixed top-0 w-full z-[100] px-10 py-6 flex justify-between items-center bg-black/50 backdrop-blur-md">
        <div className="text-2xl font-black cursor-pointer" onClick={() => setView('CATALOGUE')}>VLK²</div>
        <div className="flex gap-8 items-center">
          <span className="text-[10px] tracking-widest uppercase cursor-pointer opacity-60 hover:opacity-100">Search</span>
          <button onClick={() => setIsCartOpen(true)} className="bg-[#D4AF37] text-black px-4 py-1 text-[11px] font-bold uppercase tracking-tighter">
            Cart ({cart.length})
          </button>
        </div>
      </nav>

      <div className="flex pt-32 px-10">
        
        {/* 2. LEFT SIDE NAVIGATION (Persistent Categories) */}
        <aside className="w-48 hidden lg:block space-y-4 sticky top-32 h-fit">
          {catalogues.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => navigate('GRID', cat)}
              className={`block text-[11px] uppercase tracking-[0.2em] hover:text-white transition-all ${activeCat?.id === cat.id ? 'text-white font-bold' : 'opacity-40'}`}
            >
              {cat.name}
            </button>
          ))}
        </aside>

        {/* 3. MAIN CONTENT AREA */}
        <section className="flex-1">
          
          {/* VIEW: PRODUCT DETAIL */}
          {view === 'DETAIL' && selectedProduct && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-20">
              
              {/* LEFT: IMAGES */}
              <div className="space-y-10">
                <div className="aspect-[4/5] bg-[#111] flex items-center justify-center overflow-hidden border border-white/5">
                  <img src={activeImage} className="w-full h-full object-contain p-10" alt="Product View" />
                </div>
                {/* Thumbnails (Different Views) */}
                <div className="flex gap-4 justify-center">
                  {selectedProduct.variants?.map((v: any, i: number) => (
                    <img 
                      key={i} 
                      src={v.url} 
                      onClick={() => {setActiveImage(v.url); setSelectedColor(v.color);}}
                      className={`w-20 h-24 object-cover cursor-pointer border p-1 ${activeImage === v.url ? 'border-[#D4AF37]' : 'border-white/10 opacity-40'}`} 
                    />
                  ))}
                </div>
              </div>

              {/* RIGHT: DETAILS */}
              <div className="space-y-12">
                <div className="space-y-2">
                  <h1 className="text-5xl font-black uppercase italic leading-none">{selectedProduct.name}</h1>
                  <p className="text-2xl font-bold">£{selectedProduct.price}.00</p>
                </div>

                {/* Colour Selection */}
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-widest opacity-60">Colour</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.variants?.map((v: any) => (
                      <button 
                        key={v.color}
                        onClick={() => {setActiveImage(v.url); setSelectedColor(v.color);}}
                        className={`w-12 h-12 border p-1 transition-all ${selectedColor === v.color ? 'border-[#D4AF37]' : 'border-white/5 opacity-40'}`}
                      >
                        <img src={v.url} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-widest opacity-60">Size</p>
                  <div className="grid grid-cols-5 gap-0 border border-white/10">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-4 text-xs font-bold border-r border-white/10 last:border-0 transition-all ${selectedSize === size ? 'bg-[#D4AF37] text-black' : 'hover:bg-white/5'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={addToBag}
                  className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] hover:bg-[#D4AF37] transition-all"
                >
                  Add to Bag
                </button>

                <div className="pt-10 border-t border-white/5 space-y-4 text-[11px] opacity-80 leading-loose">
                   <p>• 440GSM 100% COTTON FLEECE</p>
                   <p>• PUFF PRINT DETAILING THROUGHOUT</p>
                   <p className="text-white">• TRUE TO SIZE - BOXY RELAXED FIT</p>
                </div>
              </div>
            </div>
          )}

          {/* (Grid and Catalogue views would follow same logic) */}
        </section>
      </div>

      {/* 4. PAYMENT & CHECKOUT PROMPT */}
      {showPaymentPrompt && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setShowPaymentPrompt(false)} />
          <div className="relative w-full max-w-lg bg-[#111] border border-white/10 p-10 space-y-8">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Secure Checkout</h2>
            
            <div className="space-y-4">
              <p className="text-[10px] uppercase opacity-40">Choose Payment Method</p>
              
              {/* Visa Option */}
              <button className="w-full p-6 border border-white/10 flex justify-between items-center hover:bg-white hover:text-black transition-all group">
                <span className="font-bold tracking-widest">VISA / MASTERCARD</span>
                <div className="flex gap-2">
                  <div className="w-8 h-5 bg-blue-600 rounded-sm" />
                  <div className="w-8 h-5 bg-orange-500 rounded-sm" />
                </div>
              </button>

              {/* M-Pesa / Paybill Option */}
              <button className="w-full p-6 border border-white/10 flex justify-between items-center hover:bg-[#2fb344] hover:text-white transition-all">
                <span className="font-bold tracking-widest">LIPA NA M-PESA</span>
                <span className="text-[10px] font-black">PAYBILL: 400200</span>
              </button>
            </div>

            <div className="pt-6 border-t border-white/5">
              <button 
                onClick={handleOrderSubmission}
                className="w-full py-5 bg-[#D4AF37] text-black font-black uppercase tracking-widest"
              >
                Complete Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}