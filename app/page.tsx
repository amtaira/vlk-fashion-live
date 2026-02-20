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
  };

  return (
    <main className="min-h-screen bg-black text-[#D4AF37] font-mono selection:bg-[#D4AF37] selection:text-black">
      {/* PERSISTENT BACKGROUND IMAGE FROM YOUR PREVIOUS CODE */}
      <div className="fixed inset-0 -z-10 opacity-20 bg-cover bg-center grayscale pointer-events-none" style={{ backgroundImage: "url('/hero-bg.jpg')" }} />

      {/* HEADER NAV */}
      <nav className="fixed top-0 w-full z-[100] p-6 flex justify-between items-center bg-black/80 backdrop-blur-md">
         <div className="text-2xl font-black italic cursor-pointer" onClick={() => setSelectedProduct(null)}>VLK²</div>
         <div className="flex gap-6 items-center text-[10px] uppercase font-bold">
            <span className="cursor-pointer opacity-60 hover:opacity-100">Search</span>
            <span className="bg-[#D4AF37] text-black px-4 py-1">Cart (0)</span>
         </div>
      </nav>

      <div className="flex pt-24">
        {/* LEFT SIDEBAR: CATEGORIES (Matches Screenshot) */}
        <aside className="hidden lg:flex flex-col w-64 p-10 space-y-4 text-[11px] font-bold uppercase tracking-widest fixed h-full">
          <img src="/logo-white.png" className="w-24 mb-10 brightness-0 invert" alt="Logo" />
          {['NEW', 'COMBOS', 'T-SHIRTS', 'TOPS / JERSEYS', 'SWEATSHIRTS', 'JACKETS', 'KNITWEAR', 'BOTTOMS', 'SHORTS'].map(cat => (
            <button key={cat} className="text-left hover:text-white transition-colors">{cat}</button>
          ))}
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 lg:ml-64 p-6 md:p-10">
          {!selectedProduct ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {catalogues.flatMap(c => c.products || []).map((p: any) => (
                <div key={p.id} onClick={() => openProduct(p)} className="cursor-pointer group">
                  <div className="aspect-square bg-white/5 border border-white/5 flex items-center justify-center p-4">
                    <img src={p.image_url} className="max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-widest">{p.name}</p>
                  <p className="text-[10px] opacity-60">${p.price}</p>
                </div>
              ))}
            </div>
          ) : (
            /* PRODUCT DETAIL VIEW (EXACT CORTEIZ LAYOUT) */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-in fade-in duration-500">
              
              {/* CENTER: IMAGE VIEWER */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square flex items-center justify-center relative bg-white/5">
                  <img src={activeImage} className="max-h-[80%] object-contain" alt="Main" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl cursor-pointer">›</div>
                </div>
                <div className="flex gap-4 mt-6">
                   <img src={activeImage} className="w-20 h-20 object-cover border border-[#D4AF37]" />
                </div>
              </div>

              {/* RIGHT: DETAILS & CONTROLS */}
              <div className="space-y-10">
                <header>
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
                    {selectedProduct.name} <br/>
                    <span className="text-[#D4AF37] opacity-60">[{selectedColor}]</span>
                  </h1>
                  <p className="text-2xl font-bold mt-2">£{selectedProduct.price}.00</p>
                </header>

                {/* COLOUR SWATCHES */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black tracking-widest">COLOUR</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedProduct.variants?.map((v: any) => (
                      <button 
                        key={v.color} 
                        onClick={() => { setSelectedColor(v.color); setActiveImage(v.url); }}
                        className={`w-14 h-14 border ${selectedColor === v.color ? 'border-[#D4AF37]' : 'border-white/10 opacity-40'}`}
                      >
                        <img src={v.url} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* SIZE GRID (Diagonal Box Style) */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black tracking-widest">SIZE</p>
                  <div className="grid grid-cols-5 border border-white/10 max-w-sm">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                      <button 
                        key={s} 
                        onClick={() => setSelectedSize(s)}
                        className={`h-14 flex items-center justify-center text-[11px] font-black border-r last:border-r-0 border-white/10 transition-all ${selectedSize === s ? 'bg-[#D4AF37] text-black' : 'hover:bg-white/5'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DYNAMIC BUTTON */}
                <button className={`w-full max-w-sm py-4 border font-black text-[11px] tracking-[0.3em] transition-all ${selectedSize ? 'bg-[#D4AF37] border-[#D4AF37] text-black' : 'border-red-900 text-red-600'}`}>
                  {selectedSize ? 'ADD TO ARCHIVE' : 'SELECT SIZE'}
                </button>

                {/* SPECS LIST */}
                <div className="text-[10px] space-y-2 uppercase tracking-widest leading-loose opacity-70 pt-10 border-t border-white/5">
                  <p>• Premium Heavyweight Cotton.</p>
                  <p>• High-Density Print Details.</p>
                  <p className="text-red-500 font-bold">• TRUE TO SIZE - BOXY FIT.</p>
                  <div className="pt-4 flex gap-6 underline">
                    <span className="cursor-pointer">Size Guide</span>
                    <span className="cursor-pointer">Shipping</span>
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