'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('products').select('*');
      if (data) setProducts(data);
    }
    fetchData();
  }, []);

  const openProduct = (p: any) => {
    setSelectedProduct(p);
    setActiveImage(p.image_url);
    setSelectedColor(p.variants?.[0]?.color || 'OG');
    setSelectedSize('');
  };

  return (
    <main className="min-h-screen text-white font-sans selection:bg-pink-500 relative">
      
      {/* 1. THE BACKGROUND IMAGE (Replacing the white) */}
      <div className="fixed inset-0 -z-20 bg-black" />
      <div 
        className="fixed inset-0 -z-10 opacity-40 bg-cover bg-center grayscale pointer-events-none" 
        style={{ backgroundImage: "url('/hero-bg.jpg')" }} 
      />

      {/* 2. TOP NAV (Broken Planet Style) */}
      <nav className="fixed top-0 w-full z-[100] px-10 py-6 flex justify-between items-center bg-black/40 backdrop-blur-sm border-b border-white/5">
         <div className="flex items-center gap-8">
            <div className="w-10 h-10 rounded-full border border-pink-500 flex items-center justify-center font-black text-pink-500 text-xs">BP</div>
            <div className="hidden md:block border-b border-white/20 px-2 py-1">
                <input type="text" placeholder="SEARCH" className="bg-transparent outline-none text-[10px] tracking-widest uppercase w-32 placeholder:text-white/30" />
            </div>
         </div>
         <div className="flex items-center gap-6">
            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-3">
                <span className="text-[11px] font-black tracking-widest">BAG</span>
                <span className="bg-pink-500 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold">{cart.length}</span>
            </button>
         </div>
      </nav>

      {/* 3. LAYOUT CONTAINER */}
      <div className="flex pt-28">
        
        {/* LEFT COLUMN: NAVIGATION */}
        <aside className="hidden lg:flex flex-col w-64 p-10 space-y-4 text-[11px] font-black uppercase tracking-[0.2em] fixed h-full text-white/60">
          {['NEW', 'COMBOS', 'T-SHIRTS', 'TOPS / JERSEYS', 'SWEATSHIRTS', 'JACKETS', 'KNITWEAR', 'BOTTOMS', 'SHORTS'].map(cat => (
            <button key={cat} className="text-left hover:text-pink-500 transition-colors">{cat}</button>
          ))}
          {/* Mobile Menu Icon (Bottom Left as per image) */}
          <div className="pt-20">
             <div className="space-y-1 w-8">
                <div className="h-[2px] bg-white"></div>
                <div className="h-[2px] bg-white"></div>
                <div className="h-[2px] bg-white"></div>
             </div>
          </div>
        </aside>

        {/* MAIN AREA */}
        <div className="flex-1 lg:ml-64 px-10">
          {!selectedProduct ? (
            /* PRODUCT GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {products.map((p) => (
                <div key={p.id} onClick={() => openProduct(p)} className="cursor-pointer group flex flex-col items-center">
                  <div className="w-full aspect-square flex items-center justify-center p-4 rounded-3xl group-hover:bg-white/5 transition-all">
                    <img src={p.image_url} className="max-h-[85%] object-contain drop-shadow-2xl" />
                  </div>
                  <h3 className="mt-6 text-[12px] font-black uppercase tracking-widest">{p.name}</h3>
                  <p className="mt-1 text-[14px] font-bold opacity-60">£{p.price}.00</p>
                </div>
              ))}
            </div>
          ) : (
            /* PRODUCT DETAIL VIEW (EXACT MATCH TO IMAGE) */
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 animate-in slide-in-from-bottom-2 duration-500">
              
              {/* Detail Thumbnails Column (Left of Main Image) */}
              <div className="xl:col-span-1 flex flex-col gap-4">
                 <div className="w-20 h-24 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center p-2">
                    <img src={activeImage} className="max-h-full object-contain" />
                 </div>
              </div>

              {/* CENTER: LARGE PRODUCT VIEW */}
              <div className="xl:col-span-6 flex flex-col items-center">
                <div className="w-full aspect-[4/5] bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                   <img src={activeImage} className="max-h-[90%] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
                   <div className="absolute right-6 top-1/2 text-2xl opacity-40 hover:opacity-100 cursor-pointer">›</div>
                   <div className="absolute bottom-6 text-[10px] font-black tracking-widest uppercase opacity-40">Selected View</div>
                </div>
              </div>

              {/* RIGHT: CONTROLS */}
              <div className="xl:col-span-5 space-y-12">
                <header>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.85]">
                    {selectedProduct.name} <br/>
                    <span className="text-pink-500 text-3xl">[{selectedColor}]</span>
                  </h1>
                  <p className="text-2xl font-bold mt-6">£{selectedProduct.price}.00</p>
                  <button className="mt-4 px-6 py-2 border border-white/20 text-[10px] font-black tracking-[0.3em] hover:bg-white hover:text-black transition-all">ADD TO BAG</button>
                </header>

                {/* SIZE GRID (The Pink Strikethrough Style) */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black tracking-[0.4em] text-pink-500">SIZE</p>
                  <div className="grid grid-cols-4 gap-3 w-fit">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                      <button 
                        key={s} 
                        onClick={() => setSelectedSize(s)}
                        className={`w-16 h-16 flex items-center justify-center text-[12px] font-black border transition-all relative overflow-hidden ${
                          selectedSize === s 
                          ? 'border-pink-500 bg-pink-500/10 text-white' 
                          : 'border-white/10 text-white/40 hover:border-white/40'
                        }`}
                      >
                        {/* THE PINK STRIKETHROUGH (Only on non-selected) */}
                        {selectedSize !== s && (
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-[120%] h-[2px] bg-pink-500/40 -rotate-[45deg]"></div>
                           </div>
                        )}
                        <span className="relative z-10">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* COLOR LIST */}
                <div className="space-y-4">
                   <p className="text-[10px] font-black tracking-[0.4em] text-pink-500">COLOUR</p>
                   <div className="flex gap-2">
                     {selectedProduct.variants?.map((v: any) => (
                        <div 
                          key={v.color}
                          onClick={() => { setActiveImage(v.url); setSelectedColor(v.color); }}
                          className={`w-12 h-12 rounded-lg border-2 cursor-pointer transition-all ${selectedColor === v.color ? 'border-pink-500' : 'border-white/10 opacity-40 hover:opacity-100'}`}
                        >
                           <img src={v.url} className="w-full h-full object-cover rounded-md" />
                        </div>
                     ))}
                   </div>
                </div>

                {/* SPECS */}
                <div className="pt-10 border-t border-white/10 space-y-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
                   <p>• 440GSM HEAVYWEIGHT COTTON</p>
                   <p>• PUFF PRINT DETAIL ON CHEST</p>
                   <p className="text-pink-500">• TRUE TO SIZE - BOXY FIT</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}