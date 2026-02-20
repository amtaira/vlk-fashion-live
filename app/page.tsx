'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState(''); 
  
  const [email, setEmail] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'NONE' | 'MPESA' | 'VISA' | 'PAYBILL'>('NONE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // Direct fetch of all products (No catalogues step)
      const { data } = await supabase.from('products').select('*');
      if (data) setProducts(data);
    }
    fetchData();
  }, []);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setActiveImage(product.image_url);
    setSelectedColor(product.variants?.[0]?.color || '');
    setSelectedSize('');
  };

  const addToCart = () => {
    if (!selectedSize) return; // Simple check
    const item = { ...selectedProduct, selectedSize, selectedColor, activeImage };
    setCart((prev) => [...prev, item]);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-pink-500 selection:text-white">
      
      {/* BROKEN PLANET STYLE TOP NAV */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center px-6 py-4">
        {/* LOGO LEFT */}
        <div className="flex items-center gap-6">
           <div className="w-12 h-12 bg-contain bg-no-repeat cursor-pointer" 
                style={{ backgroundImage: "url('/logo-circle.png')" }} // Use your circle logo here
                onClick={() => setSelectedProduct(null)} />
        </div>

        {/* SEARCH & CART RIGHT */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center border-b border-white/20 pb-1">
            <span className="text-[10px] mr-2">🔍</span>
            <input 
              type="text" 
              placeholder="SEARCH" 
              className="bg-transparent outline-none text-[11px] tracking-widest w-32 uppercase"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="relative flex items-center gap-2 group"
          >
            <span className="text-[14px] font-black tracking-tighter">BAG</span>
            <span className="bg-pink-500 text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
              {cart.length}
            </span>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU ICON BOTTOM LEFT (Screenshot 315c97 style) */}
      <div className="fixed bottom-6 left-6 z-[100] cursor-pointer">
        <div className="space-y-1.5">
          <div className="w-8 h-[3px] bg-white"></div>
          <div className="w-8 h-[3px] bg-white"></div>
          <div className="w-8 h-[3px] bg-white"></div>
        </div>
      </div>

      <div className="flex pt-24 min-h-screen">
        
        {/* LEFT SIDEBAR (Hidden on mobile) */}
        <aside className="hidden lg:flex flex-col w-64 p-10 space-y-4 text-[11px] font-black uppercase tracking-widest fixed h-full">
          {['NEW', 'COMBOS', 'T-SHIRTS', 'TOPS / JERSEYS', 'SWEATSHIRTS', 'JACKETS', 'KNITWEAR', 'BOTTOMS', 'SHORTS'].map(cat => (
            <button key={cat} className="text-left hover:text-pink-500 transition-colors text-[#D4AF37]">{cat}</button>
          ))}
        </aside>

        {/* MAIN PRODUCT GRID */}
        <div className="flex-1 lg:ml-64 px-6 pb-20">
          {!selectedProduct ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-y-16 gap-x-8 animate-in fade-in duration-700">
              {filteredProducts.map((p) => (
                <div key={p.id} onClick={() => handleProductClick(p)} className="cursor-pointer group flex flex-col items-center">
                  <div className="w-full aspect-square flex items-center justify-center p-4">
                    <img src={p.image_url} className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <h3 className="mt-6 text-[13px] font-black uppercase tracking-[0.15em] text-center w-full px-4">{p.name}</h3>
                  <p className="mt-2 text-[15px] font-bold">£{p.price}.00</p>
                </div>
              ))}
            </div>
          ) : (
            /* BROKEN PLANET PRODUCT DETAIL VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-4 duration-500">
              {/* IMAGE COLUMN */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square flex items-center justify-center relative bg-white/[0.02]">
                  <img src={activeImage} className="max-h-full object-contain" alt="Main" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl cursor-pointer text-pink-500">›</div>
                </div>
                {/* Thumbnails */}
                <div className="flex gap-4 mt-6">
                   <img src={activeImage} className="w-16 h-16 object-cover border border-white/10" />
                </div>
              </div>

              {/* DETAILS COLUMN */}
              <div className="space-y-8 pt-4">
                <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest leading-tight">
                  {selectedProduct.name} <br/>
                  <span className="text-white/40">[{selectedColor}]</span>
                </h1>
                <p className="text-xl font-bold">£{selectedProduct.price}.00</p>

                {/* COLOR GRID */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black tracking-widest text-[#D4AF37]">COLOUR</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.variants?.map((v: any) => (
                      <button 
                        key={v.color} 
                        onClick={() => { setSelectedColor(v.color); setActiveImage(v.url); }}
                        className={`w-12 h-12 border-2 transition-all ${selectedColor === v.color ? 'border-pink-500' : 'border-white/10 opacity-40 hover:opacity-100'}`}
                      >
                        <img src={v.url} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* SIZE GRID (Diagonal Strikethrough style) */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black tracking-widest text-[#D4AF37]">SIZE</p>
                  <div className="grid grid-cols-5 border border-white/20 w-fit">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                      <button 
                        key={s} 
                        onClick={() => setSelectedSize(s)}
                        className={`w-14 h-14 flex items-center justify-center text-[12px] font-black border-r last:border-r-0 border-white/20 transition-all relative overflow-hidden ${
                          selectedSize === s ? 'bg-pink-500 text-white' : 'hover:bg-white/5 text-white/40'
                        }`}
                      >
                        {/* Diagonal Line for style */}
                        <div className="absolute inset-0 border-t border-white/10 origin-top-left rotate-[40deg] pointer-events-none" />
                        <span className="relative z-10">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={addToCart}
                  className="w-full py-4 border-2 border-red-900/50 text-red-600 font-black text-[12px] tracking-[0.4em] uppercase hover:bg-red-900 hover:text-white transition-all"
                >
                  {selectedSize ? 'ADD TO BAG' : 'SELECT SIZE'}
                </button>

                {/* SPECS */}
                <div className="text-[11px] space-y-3 uppercase tracking-widest leading-loose opacity-70 border-t border-white/10 pt-8">
                  <p>• Heavyweight GRS Certified Fabric.</p>
                  <p>• Puff Print Graphics.</p>
                  <p className="text-pink-500 font-bold">• TRUE TO SIZE - BOXY FIT.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADMIN LINK HIDDEN IN FOOTER */}
      <footer className="py-10 flex justify-center opacity-10 hover:opacity-100 transition-opacity">
        <button onClick={() => router.push('/login')} className="text-[8px] tracking-[1em]">SYSTEM_INIT</button>
      </footer>

      {/* DRAWER CART (RIGHT SIDE) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-[#111] h-full p-8 border-l border-white/10 flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-[14px] font-black tracking-[0.4em] uppercase">YOUR BAG</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-xl">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6">
              {cart.map((item, i) => (
                <div key={i} className="flex gap-4 items-center border-b border-white/5 pb-6">
                  <img src={item.activeImage} className="w-20 h-20 object-contain bg-white/5" />
                  <div className="flex-1">
                    <p className="text-[11px] font-black uppercase tracking-widest leading-tight">{item.name}</p>
                    <p className="text-[10px] opacity-40 mt-1">{item.selectedSize} / {item.selectedColor}</p>
                    <p className="text-[13px] font-bold mt-2">£{item.price}.00</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 space-y-4">
              <div className="flex justify-between text-xl font-black italic border-t border-white/20 pt-4">
                <span>TOTAL</span>
                <span>£{cart.reduce((s, i) => s + i.price, 0)}.00</span>
              </div>
              <button className="w-full py-5 bg-pink-500 text-white font-black uppercase tracking-[0.3em] text-[12px]">CHECKOUT</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}