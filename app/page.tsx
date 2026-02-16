'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation'; // Correct import for App Router

export default function Home() {
  const router = useRouter();
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [activeCatalogue, setActiveCatalogue] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
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

  const addToCart = (product: any) => {
    setCart((prev) => [...prev, product]);
    setNotification(`${product.name} ADDED`);
    setTimeout(() => setNotification(null), 3000);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

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
    <main className="relative min-h-screen text-[#a67c52] font-mono selection:bg-[#a67c52] selection:text-black bg-black">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-black" />
      
      {/* FEEDBACK NOTIFICATION */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-[#a67c52] text-black px-6 py-3 text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl animate-in slide-in-from-top-5 duration-300">
          {notification}
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 md:p-10 bg-gradient-to-b from-black to-transparent">
        <div className="text-xl md:text-2xl font-black tracking-tighter cursor-pointer text-white italic" onClick={() => setActiveCatalogue(null)}>VLK²</div>
        <button onClick={() => setIsCartOpen(true)} className="bg-[#a67c52] text-black px-4 md:px-6 py-2 text-[8px] md:text-[10px] font-black tracking-[0.2em] uppercase hover:bg-white transition-all">
          ARCHIVE ({cart.length})
        </button>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-32 md:pt-48 pb-10">
        {!activeCatalogue ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
            {catalogues.map((cat) => (
              <div key={cat.id} onClick={() => setActiveCatalogue(cat)} className="group border border-white/5 h-[300px] md:h-[500px] flex flex-col items-center justify-center cursor-pointer hover:border-[#a67c52]/40 transition-all bg-black/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#a67c52]/0 group-hover:bg-[#a67c52]/5 transition-all" />
                <h2 className="text-lg md:text-2xl uppercase tracking-[0.6em] text-white group-hover:tracking-[0.8em] transition-all font-bold z-10 px-4 text-center">{cat.name}</h2>
                <p className="mt-4 text-[7px] md:text-[8px] tracking-[0.5em] opacity-30 uppercase z-10">Access Collection</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
            <button onClick={() => setActiveCatalogue(null)} className="mb-8 text-[8px] md:text-[9px] uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-opacity">← Back to Collections</button>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
              {activeCatalogue.products?.map((item: any) => (
                <div key={item.id} className="bg-[#050505] p-6 md:p-10 group hover:bg-white/[0.01] transition-colors">
                  <div className="aspect-[3/4] bg-zinc-900 mb-6 md:mb-8 overflow-hidden border border-white/5">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />}
                  </div>
                  <div className="text-center">
                    <h3 className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-white font-bold mb-2">{item.name}</h3>
                    <p className="text-sm font-light mb-6 md:mb-8 opacity-60">${item.price}</p>
                    <button onClick={() => addToCart(item)} className="w-full py-4 border border-[#a67c52]/20 text-[8px] uppercase tracking-[0.4em] hover:bg-[#a67c52] hover:text-black transition-all">Select Piece</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- ADMIN ACCESS FOOTER --- */}
      <footer className="relative z-20 w-full py-20 border-t border-[#a67c52]/10 mt-20 flex flex-col items-center justify-center bg-black">
         <p className="text-[7px] tracking-[1em] text-[#a67c52] opacity-30 uppercase mb-6">Internal Operations Only</p>
         <button 
           type="button"
           onClick={() => router.push('/login')}
           className="px-8 py-3 border border-[#a67c52] text-[#a67c52] text-[9px] font-bold uppercase tracking-[0.4em] hover:bg-[#a67c52] hover:text-black transition-all"
         >
           Initialize Admin Session
         </button>
         <p className="mt-8 text-[6px] text-white/10 uppercase tracking-widest">© 2026 VLK² Global Archive</p>
      </footer>

      {/* CHECKOUT SYSTEM */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/90 md:backdrop-blur-md" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full md:max-w-lg bg-[#050505] border-l border-[#a67c52]/20 p-6 md:p-12 overflow-y-auto h-full">
            <header className="flex justify-between items-center mb-8 md:mb-12">
              <h2 className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] text-white font-bold">Consolidated Archive</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-[14px] md:text-[8px] uppercase tracking-widest opacity-30 hover:opacity-100 p-2">✕</button>
            </header>
            
            {cart.length === 0 ? (
              <p className="text-[9px] opacity-30 uppercase tracking-widest text-center py-20">Archive is empty.</p>
            ) : (
              <div className="space-y-8 pb-20">
                <div className="space-y-4 border-b border-white/5 pb-8">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-[9px] md:text-[10px] uppercase tracking-widest">
                      <span className="text-white/80 truncate pr-4">{item.name}</span>
                      <div className="flex gap-4 items-center flex-shrink-0">
                        <span className="font-bold text-white">${item.price}</span>
                        <button onClick={() => removeFromCart(i)} className="text-red-900 text-[8px]">Remove</button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between text-[#a67c52] font-black text-xl pt-6">
                    <span className="tracking-tighter italic">TOTAL</span>
                    <span>${total}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-[8px] uppercase tracking-[0.4em] opacity-40">Protocol Details</p>
                  <input placeholder="EMAIL ADDRESS" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-transparent border-b border-white/10 py-4 outline-none text-[10px] text-white focus:border-[#a67c52]" />
                  
                  <div className="grid grid-cols-1 gap-2">
                    <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setSelectedMethod('MPESA')} className={`py-4 text-[8px] border uppercase tracking-widest transition-all font-bold ${selectedMethod === 'MPESA' ? 'border-green-500 text-green-500 bg-green-500/5' : 'border-white/5 opacity-40'}`}>M-Pesa</button>
                        <button type="button" onClick={() => setSelectedMethod('VISA')} className={`py-4 text-[8px] border uppercase tracking-widest transition-all font-bold ${selectedMethod === 'VISA' ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-white/5 opacity-40'}`}>Card</button>
                    </div>
                    <button type="button" onClick={() => setSelectedMethod('PAYBILL')} className={`py-4 text-[8px] border uppercase tracking-widest transition-all font-bold ${selectedMethod === 'PAYBILL' ? 'border-[#a67c52] text-[#a67c52] bg-[#a67c52]/5' : 'border-white/5 opacity-40'}`}>Paybill (Manual)</button>
                  </div>

                  {selectedMethod === 'MPESA' && (
                    <input placeholder="254..." value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full bg-transparent border-b border-green-500/40 py-4 text-[10px] text-white outline-none" />
                  )}

                  {selectedMethod !== 'NONE' && (
                    <button 
                      disabled={loading}
                      onClick={handleFinalOrder}
                      className="w-full py-5 bg-[#a67c52] text-black font-black text-[10px] uppercase tracking-[0.5em] hover:bg-white transition-all mt-6"
                    >
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