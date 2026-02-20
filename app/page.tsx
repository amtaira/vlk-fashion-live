'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [activeCatalogue, setActiveCatalogue] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState(''); 
  
  const [notification, setNotification] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'NONE' | 'MPESA' | 'VISA'>('NONE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('catalogues').select('*, products(*)');
      if (data) setCatalogues(data);
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
    if (!selectedSize || !selectedColor) return alert("SELECT SIZE + COLOR");
    const finalProduct = { 
      ...selectedProduct, 
      name: `${selectedProduct.name} (${selectedColor}/${selectedSize})`,
      image_url: activeImage 
    };
    setCart((prev) => [...prev, finalProduct]);
    setNotification(`${selectedProduct.name} ARCHIVED`);
    setSelectedProduct(null);
    setTimeout(() => setNotification(null), 3000);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const allProducts = catalogues.flatMap(cat => cat.products || []);
  const filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleFinalOrder = async () => {
    if (!email || selectedMethod === 'NONE') return alert("Email and Payment Method Required.");
    setLoading(true);
    const { error } = await supabase.from('orders').insert(
      cart.map(item => ({
        customer_email: email,
        product_name: item.name,
        amount: item.price,
        payment_method: selectedMethod,
        status: 'pending'
      }))
    );
    if (!error) {
      alert(`ACQUISITION LOGGED via ${selectedMethod}.`);
      setCart([]); setIsCartOpen(false);
    } else { alert("Error: " + error.message); }
    setLoading(false);
  };

  return (
    <main className="relative min-h-screen text-[#D4AF37] font-mono">
      <div className="fixed inset-0 -z-10 bg-black" />
      
      {/* NOTIFICATION */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-[#D4AF37] text-black px-6 py-3 text-[9px] font-black uppercase tracking-[0.3em]">
          {notification}
        </div>
      )}

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 md:p-10 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="text-xl md:text-2xl font-black text-white italic cursor-pointer" onClick={() => {setActiveCatalogue(null); setSearchQuery('');}}>VLK²</div>
        <div className="flex items-center gap-4">
          <input type="text" placeholder="SEARCH_" className="bg-transparent border-b border-[#D4AF37]/20 outline-none text-[10px] py-1 w-24 md:w-40 text-white" onChange={(e) => setSearchQuery(e.target.value)} />
          <button onClick={() => setIsCartOpen(true)} className="bg-[#D4AF37] text-black px-4 py-2 text-[8px] font-black uppercase tracking-widest">ARCHIVE ({cart.length})</button>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        {activeCatalogue ? (
          <div className="animate-in fade-in">
            <button onClick={() => setActiveCatalogue(null)} className="mb-8 text-[8px] opacity-40 hover:opacity-100 uppercase tracking-widest">← Back</button>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
              {activeCatalogue.products?.map((item: any) => (
                <div key={item.id} className="group cursor-pointer" onClick={() => handleProductClick(item)}>
                  <div className="aspect-[4/5] bg-zinc-900 overflow-hidden border border-white/5">
                    <img src={item.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                  </div>
                  <h3 className="text-[10px] uppercase font-black mt-6 text-white">{item.name}</h3>
                  <p className="text-[12px] opacity-60 mt-1">${item.price}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {catalogues.map((cat) => (
              <div key={cat.id} onClick={() => setActiveCatalogue(cat)} className="h-[400px] border border-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37]/40 transition-all bg-zinc-900/20 group">
                <h2 className="text-2xl uppercase tracking-[0.5em] text-white font-bold group-hover:scale-110 transition-all">{cat.name}</h2>
                <p className="mt-4 text-[8px] tracking-[0.4em] opacity-30 uppercase">Enter Archive</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CORTEIZ-STYLE PRODUCT POPUP */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[150] bg-black/98 flex items-center justify-center p-6 overflow-y-auto">
          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 py-10">
            {/* LARGE IMAGE BOX */}
            <div className="flex items-center justify-center bg-zinc-900/50 border border-white/5 aspect-square relative">
              <img src={activeImage} className="max-h-[70vh] w-auto object-contain animate-in fade-in duration-500" />
            </div>

            {/* PRODUCT CONTROLS */}
            <div className="flex flex-col justify-center space-y-8">
              <button onClick={() => setSelectedProduct(null)} className="text-[10px] opacity-40 hover:opacity-100 tracking-[0.4em]">← RETURN</button>
              <div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{selectedProduct.name}</h2>
                <p className="text-xl text-[#D4AF37] font-bold mt-2">${selectedProduct.price}</p>
              </div>

              {/* SELECT COLOR (Thumbnails) */}
              <div className="space-y-4">
                <p className="text-[9px] uppercase tracking-widest opacity-40">Active Style: {selectedColor}</p>
                <div className="flex flex-wrap gap-3">
                  {selectedProduct.variants?.map((v: any) => (
                    <button 
                      key={v.color} 
                      onClick={() => { setSelectedColor(v.color); setActiveImage(v.url); }} 
                      className={`w-14 h-14 border-2 p-0.5 transition-all ${selectedColor === v.color ? 'border-[#D4AF37] scale-110' : 'border-white/10 opacity-40'}`}
                    >
                      <img src={v.url} className="w-full h-full object-cover" title={v.color} />
                    </button>
                  ))}
                </div>
              </div>

              {/* SELECT SIZE */}
              <div className="space-y-4">
                <p className="text-[9px] uppercase tracking-widest opacity-40">Select Size</p>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL'].map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`w-12 h-12 text-[10px] border transition-all ${selectedSize === s ? 'border-[#D4AF37] bg-[#D4AF37] text-black' : 'border-white/10 text-white'}`}>{s}</button>
                  ))}
                </div>
              </div>

              <button onClick={addToCart} className="w-full py-5 bg-[#D4AF37] text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-all active:scale-95">ADD TO ARCHIVE</button>
            </div>
          </div>
        </div>
      )}

      {/* ... (Cart Drawer and Footer stay the same as your code) */}
    </main>
  );
}