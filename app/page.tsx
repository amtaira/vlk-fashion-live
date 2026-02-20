'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [activeCatalogue, setActiveCatalogue] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState('');

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
    setSelectedColor(p.variants?.[0]?.color || 'DEFAULT');
    setSelectedSize('');
  };

  return (
    <main className="min-h-screen bg-black text-[#D4AF37] font-mono selection:bg-[#D4AF37] selection:text-black">
      {/* GLOBAL HEADER */}
      <nav className="fixed top-0 w-full z-[100] p-6 flex justify-between items-center bg-black/90 backdrop-blur-sm">
         <div className="text-2xl font-black italic cursor-pointer" onClick={() => setSelectedProduct(null)}>VLK²</div>
         <div className="flex gap-8 items-center text-[11px] font-bold uppercase tracking-widest">
            <span className="cursor-pointer hover:text-white transition-colors">SEARCH</span>
            <span className="bg-[#D4AF37] text-black px-4 py-1 font-black cursor-pointer">CART (0)</span>
         </div>
      </nav>

      <div className="flex pt-28 min-h-screen">
        {/* LEFT SIDEBAR: CATEGORIES */}
        <aside className="hidden lg:flex flex-col w-64 p-10 space-y-5 text-[11px] font-bold uppercase tracking-[0.2em] fixed h-full border-r border-white/5">
          <div className="mb-10 w-24 h-24 bg-contain bg-no-repeat bg-center brightness-0 invert opacity-80" style={{ backgroundImage: "url('/logo-white.png')" }} />
          {['NEW', 'COMBOS', 'T-SHIRTS', 'TOPS / JERSEYS', 'SWEATSHIRTS', 'JACKETS', 'KNITWEAR', 'BOTTOMS', 'SHORTS'].map(cat => (
            <button key={cat} className="text-left hover:text-white hover:translate-x-1 transition-all">{cat}</button>
          ))}
        </aside>

        {/* MAIN DISPLAY AREA */}
        <div className="flex-1 lg:ml-64 p-6 md:p-10">
          {!selectedProduct ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-700">
              {catalogues.flatMap(c => c.products || []).map((p: any) => (
                <div key={p.id} onClick={() => openProduct(p)} className="cursor-pointer group">
                  <div className="aspect-square bg-[#0c0c0c] border border-white/5 flex items-center justify-center p-6 mb-4 overflow-hidden">
                    <img src={p.image_url} className="max-h-full object-contain grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest leading-none">{p.name}</h3>
                  <p className="text-[11px] mt-2 font-bold opacity-60">${p.price}.00</p>
                </div>
              ))}
            </div>
          ) : (
            /* EXACT CORTEIZ PRODUCT PAGE LAYOUT */
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* CENTER COLUMN: MAIN IMAGE */}
              <div className="xl:col-span-7 flex flex-col items-center">
                <div className="w-full aspect-square flex items-center justify-center relative bg-white/[0.02] border border-white/5">
                  <img src={activeImage} className="max-h-[85%] object-contain" alt="Selected View" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl font-light cursor-pointer opacity-40 hover:opacity-100 transition-opacity">›</div>
                </div>
                {/* Detail Thumbnails */}
                <div className="flex gap-4 mt-8">
                   <div className="w-20 h-20 border border-[#D4AF37] p-1 bg-white/5">
                     <img src={activeImage} className="w-full h-full object-contain" />
                   </div>
                </div>
              </div>

              {/* RIGHT COLUMN: CONTROLS */}
              <div className="xl:col-span-5 space-y-10 xl:pl-10">
                <header className="space-y-2">
                  <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-[0.9]">
                    {selectedProduct.name} <br/>
                    <span className="text-[#D4AF37] opacity-60">[{selectedColor}]</span>
                  </h1>
                  <p className="text-2xl font-bold pt-2">£{selectedProduct.price}.00</p>
                </header>

                {/* COLOUR SWATCHES GRID */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black tracking-[0.3em] uppercase">COLOUR</p>
                  <div className="grid grid-cols-5 md:grid-cols-7 gap-1">
                    {selectedProduct.variants?.map((v: any) => (
                      <button 
                        key={v.color} 
                        onClick={() => { setSelectedColor(v.color); setActiveImage(v.url); }}
                        className={`aspect-square border transition-all relative ${
                          selectedColor === v.color ? 'border-[#D4AF37] scale-100' : 'border-white/10 opacity-40 hover:opacity-80'
                        }`}
                      >
                        <img src={v.url} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* SIZE GRID (Interlocking boxes like screenshot) */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black tracking-[0.3em] uppercase">SIZE</p>
                  <div className="grid grid-cols-5 border border-white/10 overflow-hidden">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((s, idx) => (
                      <button 
                        key={s} 
                        onClick={() => setSelectedSize(s)}
                        className={`h-16 flex items-center justify-center text-[12px] font-black border-r border-white/10 last:border-r-0 transition-all relative ${
                          selectedSize === s ? 'bg-[#D4AF37] text-black' : 'hover:bg-white/5 text-white/40'
                        }`}
                      >
                        {/* Diagonal strike for sold out style */}
                        <span className={`absolute inset-0 border-t border-white/5 origin-top-left rotate-[35deg] pointer-events-none ${selectedSize === s ? 'hidden' : ''}`}></span>
                        <span className="relative z-10">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ACTION BUTTON (Dynamic State) */}
                <button className={`w-full py-5 border font-black text-[12px] tracking-[0.5em] transition-all duration-300 ${
                  selectedSize 
                  ? 'bg-[#D4AF37] border-[#D4AF37] text-black scale-[1.02]' 
                  : 'border-red-900/40 text-red-700 hover:bg-red-900/10'
                }`}>
                  {selectedSize ? 'ADD TO ARCHIVE' : 'SELECT SIZE'}
                </button>

                {/* PRODUCT SPECS (Bullet points from screenshot) */}
                <div className="text-[11px] space-y-3 uppercase tracking-[0.15em] leading-relaxed opacity-80 pt-10 border-t border-white/5">
                  <p>• Heavyweight 100% Cotton construction.</p>
                  <p>• Custom VLK² hardware and zipper detail.</p>
                  <p className="text-red-600 font-bold">• TRUE TO SIZE - BOXY RELAXED FIT.</p>
                  <div className="pt-6 flex gap-8 underline decoration-1 underline-offset-4 font-bold cursor-pointer">
                    <span>SIZE GUIDE</span>
                    <span>SHIPPING POLICY</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}