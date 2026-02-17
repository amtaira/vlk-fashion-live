'use client';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [activeCatalogue, setActiveCatalogue] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShipping, setShowShipping] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  
  // Selection States
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('catalogues').select('*, products(*)');
      if (data) setCatalogues(data);
    }
    fetchData();
  }, []);

  const addToCart = () => {
    if (!selectedSize || !selectedColor) return alert("SELECT SIZE + COLOR");
    setCart([...cart, { ...selectedProduct, size: selectedSize, color: selectedColor }]);
    setSelectedProduct(null);
    setSelectedSize('');
    setSelectedColor('');
  };

  const allProducts = catalogues.flatMap(cat => cat.products || []);
  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-black text-[#D4AF37] font-mono selection:bg-[#D4AF37] selection:text-black">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black to-transparent">
        <div className="text-3xl font-black tracking-tighter italic text-white cursor-pointer" onClick={() => {setActiveCatalogue(null); setSelectedProduct(null);}}>VLK²</div>
        
        <div className="flex items-center gap-6">
          <div className="relative border-b border-[#D4AF37]/30 focus-within:border-[#D4AF37] transition-all">
            <input 
              type="text" 
              placeholder="SEARCH_ARCHIVE..." 
              className="bg-transparent border-none outline-none text-[10px] py-1 px-2 w-32 md:w-48 placeholder:text-[#D4AF37]/30"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => setShowShipping(true)} className="text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100">Shipping</button>
        </div>
      </nav>

      {/* SEARCH RESULTS / CATALOGUES */}
      <div className="pt-32 px-6 max-w-7xl mx-auto">
        {searchQuery ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {filteredProducts.map(p => (
              <div key={p.id} onClick={() => setSelectedProduct(p)} className="cursor-pointer group">
                <img src={p.image_url} className="w-full h-auto drop-shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-transform group-hover:scale-110" />
                <p className="mt-4 text-center text-[10px] font-bold uppercase">{p.name}</p>
              </div>
            ))}
          </div>
        ) : !activeCatalogue ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {catalogues.map(cat => (
              <div key={cat.id} onClick={() => setActiveCatalogue(cat)} className="h-[60vh] border border-[#D4AF37]/10 flex items-center justify-center cursor-pointer hover:bg-[#D4AF37]/5 transition-all">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">{cat.name}</h2>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            {activeCatalogue.products?.map((p: any) => (
              <div key={p.id} onClick={() => setSelectedProduct(p)} className="cursor-pointer group text-center">
                {/* Product Image - No Box (Requires Transparent PNG) */}
                <img src={p.image_url} alt="" className="w-full h-auto object-contain transition-all duration-500 group-hover:drop-shadow-[0_0_25px_rgba(212,175,55,0.3)]" />
                <h3 className="mt-6 text-[11px] font-black uppercase text-white tracking-[0.2em]">{p.name}</h3>
                <p className="text-[10px] opacity-60 mt-1">${p.price}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRODUCT MODAL (SIZE/COLOR PICKER) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6">
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex items-center justify-center">
              <img src={selectedProduct.image_url} className="max-h-[60vh] w-auto drop-shadow-[0_0_30px_rgba(212,175,55,0.2)]" />
            </div>
            <div className="flex flex-col justify-center">
              <button onClick={() => setSelectedProduct(null)} className="text-left text-[10px] mb-8 opacity-40 hover:opacity-100">← RETURN</button>
              <h2 className="text-3xl font-black text-white italic mb-2 uppercase">{selectedProduct.name}</h2>
              <p className="text-xl mb-10 opacity-80">${selectedProduct.price}</p>
              
              <div className="space-y-8">
                <div>
                  <p className="text-[9px] uppercase tracking-widest mb-4 opacity-40">Select Color</p>
                  <div className="flex gap-4">
                    {['BLACK', 'GOLD', 'CREAM'].map(c => (
                      <button 
                        key={c} onClick={() => setSelectedColor(c)}
                        className={`px-4 py-2 text-[10px] border transition-all ${selectedColor === c ? 'border-[#D4AF37] bg-[#D4AF37] text-black' : 'border-white/10 text-white'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-widest mb-4 opacity-40">Select Size</p>
                  <div className="flex gap-4">
                    {['S', 'M', 'L', 'XL'].map(s => (
                      <button 
                        key={s} onClick={() => setSelectedSize(s)}
                        className={`w-10 h-10 text-[10px] border transition-all ${selectedSize === s ? 'border-[#D4AF37] bg-[#D4AF37] text-black' : 'border-white/10 text-white'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={addToCart}
                  className="w-full py-5 bg-[#D4AF37] text-black font-black uppercase tracking-[0.4em] text-[11px] hover:bg-white transition-all"
                >
                  ADD TO ARCHIVE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHIPPING POLICY VIEW */}
      {showShipping && (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-6 md:p-20 overflow-y-auto">
          <div className="max-w-2xl w-full">
            <button onClick={() => setShowShipping(false)} className="text-[10px] tracking-[0.5em] mb-12 opacity-40 hover:opacity-100">← BACK_TO_SHOP</button>
            <h1 className="text-3xl font-black italic mb-12 text-white border-b border-[#D4AF37]/20 pb-4">SHIPPING_POLICY</h1>
            <div className="text-[11px] leading-loose tracking-[0.1em] space-y-6 text-[#D4AF37]/80 uppercase">
              <p>UK DOMESTIC ORDERS SHIP WITHIN 5-10 WORKING DAYS</p>
              <p>INTERNATIONAL ORDERS 5-15 WORKING DAYS</p>
              <p className="text-white font-bold underline underline-offset-8">UNLESS A PRE-ORDER SHIP DATE IS GIVEN</p>
              <p>IT'S THE CUSTOMER'S RESPONSIBILITY TO PAY IMPORT TAXES</p>
              <p>REGULATIONS FOR IMPORT DUTIES AND TAXES MAY VARY AND WE ARE UNABLE TO CONTROL NOR PREDICT THEIR AMOUNT</p>
              <p>IF YOU REFUSE A SHIPMENT FROM US, YOU ARE RESPONSIBLE FOR THE ORIGINAL SHIPPING CHARGES AND THE COURIER COST</p>
              <p className="pt-10 opacity-40 lowercase italic">Please note that international shipments may take longer to be delivered due to the customs process in your country.</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}