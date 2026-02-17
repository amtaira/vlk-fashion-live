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
  
  // Selection States for Corteiz-style sizing
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  
  // Feedback States
  const [notification, setNotification] = useState<string | null>(null);
  
  // Payment States
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'NONE' | 'MPESA' | 'VISA' | 'PAYBILL'>('NONE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('catalogues').select('*, products(*)');
      if (data) setCatalogues(data);
    }
    fetchData();
  }, []);

  // Updated to handle specific Corteiz size/color choices
  const addToCart = () => {
    if (!selectedSize || !selectedColor) return alert("SELECT SIZE + COLOR");
    
    const finalProduct = { 
      ...selectedProduct, 
      name: `${selectedProduct.name} (${selectedColor}/${selectedSize})`
    };
    
    setCart((prev) => [...prev, finalProduct]);
    setNotification(`${selectedProduct.name} ARCHIVED`);
    setSelectedProduct(null);
    setSelectedSize('');
    setSelectedColor('');
    setTimeout(() => setNotification(null), 3000);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // Search Logic
  const allProducts = catalogues.flatMap(cat => cat.products || []);
  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFinalOrder = async () => {
    if (!email) return alert("Email Required.");
    if (selectedMethod === 'MPESA' && !phone) return alert("Phone Required.");
    
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
      setCart([]);
      setIsCartOpen(false);
      setSelectedMethod('NONE');
    } else {
      alert("System Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <main className="relative min-h-screen text-[#D4AF37] font-mono selection:bg-[#D4AF37] selection:text-black">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-black" />
      <div className="fixed inset-0 -z-10 opacity-30 bg-cover bg-center grayscale pointer-events-none" style={{ backgroundImage: "url('/hero-bg.jpg')" }} />

      {/* FEEDBACK NOTIFICATION */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-[#D4AF37] text-black px-6 py-3 text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl">
          {notification}
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 md:p-10 bg-gradient-to-b from-black to-transparent">
        <div className="text-xl md:text-2xl font-black tracking-tighter cursor-pointer text-white italic" onClick={() => {setActiveCatalogue(null); setSearchQuery('');}}>VLK²</div>
        
        <div className="flex items-center gap-4 md:gap-8">
          {/* SEARCH FIELD */}
          <input 
            type="text" 
            placeholder="SEARCH_" 
            className="bg-transparent border-b border-[#D4AF37]/20 outline-none text-[10px] py-1 w-20 md:w-40 focus:border-[#D4AF37] transition-all text-white placeholder:text-[#D4AF37]/30"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={() => setShowShipping(true)} className="text-[8px] md:text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100">Shipping</button>
          <button onClick={() => setIsCartOpen(true)} className="bg-[#D4AF37] text-black px-4 md:px-6 py-2 text-[8px] md:text-[10px] font-black tracking-[0.2em] uppercase hover:bg-white transition-all">
            ARCHIVE ({cart.length})
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-32 md:pt-48 pb-10">
        {searchQuery ? (
          /* SEARCH VIEW */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-in fade-in duration-500">
            {filteredProducts.map(p => (
              <div key={p.id} onClick={() => setSelectedProduct(p)} className="cursor-pointer group text-center">
                <img src={p.image_url} className="w-full h-auto drop-shadow-[0_0_15px_rgba(212,175,55,0.15)] group-hover:scale-105 transition-all" />
                <p className="mt-4 text-[10px] font-bold uppercase text-white tracking-widest">{p.name}</p>
              </div>
            ))}
          </div>
        ) : !activeCatalogue ? (
          /* COLLECTIONS VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
            {catalogues.map((cat) => (
              <div key={cat.id} onClick={() => setActiveCatalogue(cat)} className="group border border-white/5 h-[300px] md:h-[500px] flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37]/40 transition-all bg-black/40 relative overflow-hidden">
                <h2 className="text-lg md:text-2xl uppercase tracking-[0.6em] text-white group-hover:tracking-[0.8em] transition-all font-bold z-10">{cat.name}</h2>
                <p className="mt-4 text-[7px] md:text-[8px] tracking-[0.5em] opacity-30 uppercase z-10 text-[#D4AF37]">Access Collection</p>
              </div>
            ))}
          </div>
        ) : (
          /* PRODUCTS VIEW */
          <div className="animate-in fade-in duration-700">
            <button onClick={() => setActiveCatalogue(null)} className="mb-8 text-[8px] md:text-[9px] uppercase tracking-[0.4em] opacity-40 hover:opacity-100">← Back to Collections</button>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
              {activeCatalogue.products?.map((item: any) => (
                <div key={item.id} className="p-4 group text-center cursor-pointer" onClick={() => setSelectedProduct(item)}>
                   <img src={item.image_url} alt={item.name} className="w-full h-auto object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-500" />
                   <h3 className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-white font-black mt-6">{item.name}</h3>
                   <p className="text-sm font-light mt-2 opacity-60 text-[#D4AF37]">${item.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PRODUCT PICKER MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[150] bg-black/95 flex items-center justify-center p-6">
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex items-center justify-center">
              <img src={selectedProduct.image_url} className="max-h-[50vh] w-auto drop-shadow-[0_0_30px_rgba(212,175,55,0.2)]" />
            </div>
            <div className="flex flex-col justify-center">
              <button onClick={() => setSelectedProduct(null)} className="text-left text-[10px] mb-8 opacity-40 hover:opacity-100 tracking-widest">← RETURN</button>
              <h2 className="text-3xl font-black text-white italic mb-2 uppercase">{selectedProduct.name}</h2>
              <p className="text-xl mb-10 text-[#D4AF37] font-bold">${selectedProduct.price}</p>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[9px] uppercase tracking-widest mb-3 opacity-40">Color</p>
                  <div className="flex gap-2">
                    {['BLACK', 'GOLD', 'CREAM'].map(c => (
                      <button key={c} onClick={() => setSelectedColor(c)} className={`px-4 py-2 text-[9px] border ${selectedColor === c ? 'border-[#D4AF37] bg-[#D4AF37] text-black' : 'border-white/10 text-white'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest mb-3 opacity-40">Size</p>
                  <div className="flex gap-2">
                    {['S', 'M', 'L', 'XL'].map(s => (
                      <button key={s} onClick={() => setSelectedSize(s)} className={`w-10 h-10 text-[9px] border ${selectedSize === s ? 'border-[#D4AF37] bg-[#D4AF37] text-black' : 'border-white/10 text-white'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <button onClick={addToCart} className="w-full py-5 bg-[#D4AF37] text-black font-black uppercase tracking-[0.4em] text-[10px] hover:bg-white transition-all mt-4">ADD TO ARCHIVE</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHIPPING POLICY VIEW */}
      {showShipping && (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-8 overflow-y-auto">
          <div className="max-w-2xl w-full">
            <button onClick={() => setShowShipping(false)} className="text-[10px] tracking-[0.5em] mb-12 opacity-40 hover:opacity-100">← BACK_TO_SHOP</button>
            <h1 className="text-2xl font-black italic mb-10 text-white border-b border-[#D4AF37]/20 pb-4">SHIPPING_POLICY</h1>
            <div className="text-[10px] md:text-[11px] leading-loose tracking-[0.1em] space-y-6 text-[#D4AF37]/90 uppercase">
              <p>UK DOMESTIC ORDERS SHIP WITHIN 5-10 WORKING DAYS</p>
              <p>INTERNATIONAL ORDERS 5-15 WORKING DAYS</p>
              <p className="text-white underline underline-offset-8">UNLESS A PRE-ORDER SHIP DATE IS GIVEN</p>
              <p>IT'S THE CUSTOMER'S RESPONSIBILITY TO PAY IMPORT TAXES</p>
              <p>IF YOU REFUSE A SHIPMENT FROM US, YOU ARE RESPONSIBLE FOR THE ORIGINAL SHIPPING CHARGES AND THE COURIER COST</p>
              <p className="pt-10 opacity-40 lowercase italic">International shipments may take longer due to customs processes.</p>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="relative z-20 w-full py-20 border-t border-[#D4AF37]/10 mt-20 flex flex-col items-center justify-center bg-black">
         <button onClick={() => router.push('/login')} className="px-8 py-3 border border-[#D4AF37] text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.4em] hover:bg-[#D4AF37] hover:text-black transition-all">Initialize Admin Session</button>
         <p className="mt-8 text-[6px] text-white/10 uppercase tracking-widest">© 2026 VLK² Global Archive</p>
      </footer>

      {/* CHECKOUT SYSTEM */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/90 md:backdrop-blur-md" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full md:max-w-lg bg-[#050505] border-l border-[#D4AF37]/20 p-6 md:p-12 overflow-y-auto">
            <header className="flex justify-between items-center mb-12">
              <h2 className="text-[10px] uppercase tracking-[0.5em] text-white font-black">Consolidated Archive</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-white opacity-30 hover:opacity-100">✕</button>
            </header>
            
            {cart.length === 0 ? (
              <p className="text-[9px] opacity-30 uppercase tracking-widest text-center py-20">Archive is empty.</p>
            ) : (
              <div className="space-y-8">
                <div className="space-y-4 border-b border-white/5 pb-8">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-[9px] uppercase tracking-widest">
                      <span className="text-white/80 truncate pr-4">{item.name}</span>
                      <div className="flex gap-4 items-center flex-shrink-0">
                        <span className="font-bold text-[#D4AF37]">${item.price}</span>
                        <button onClick={() => removeFromCart(i)} className="text-red-900 text-[8px]">Remove</button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between text-[#D4AF37] font-black text-2xl pt-6">
                    <span className="italic">TOTAL</span>
                    <span>${total}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <input placeholder="EMAIL ADDRESS" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-transparent border-b border-white/10 py-4 outline-none text-[10px] text-white focus:border-[#D4AF37]" />
                  <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setSelectedMethod('MPESA')} className={`py-4 text-[8px] border uppercase tracking-widest font-bold ${selectedMethod === 'MPESA' ? 'border-green-500 text-green-500 bg-green-500/5' : 'border-white/5 opacity-40'}`}>M-Pesa</button>
                      <button onClick={() => setSelectedMethod('VISA')} className={`py-4 text-[8px] border uppercase tracking-widest font-bold ${selectedMethod === 'VISA' ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-white/5 opacity-40'}`}>Card</button>
                  </div>
                  <button onClick={() => setSelectedMethod('PAYBILL')} className={`w-full py-4 text-[8px] border uppercase tracking-widest font-bold ${selectedMethod === 'PAYBILL' ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5' : 'border-white/5 opacity-40'}`}>Paybill (Manual)</button>

                  {selectedMethod === 'MPESA' && (
                    <input placeholder="254..." value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full bg-transparent border-b border-green-500/40 py-4 text-[10px] text-white outline-none" />
                  )}

                  {selectedMethod === 'PAYBILL' && (
                    <div className="p-6 bg-white/[0.02] border border-[#D4AF37]/20 text-center uppercase tracking-widest text-[9px]">
                      <p className="text-white font-black">BUSINESS: 247247</p>
                      <p className="text-white font-black mt-2">ACC: 0795151303</p>
                    </div>
                  )}

                  {selectedMethod !== 'NONE' && (
                    <button disabled={loading} onClick={handleFinalOrder} className="w-full py-5 bg-[#D4AF37] text-black font-black text-[10px] uppercase tracking-[0.5em] hover:bg-white transition-all mt-6">
                      {loading ? 'PROCESSING...' : 'COMPLETE ACQUISITION'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}