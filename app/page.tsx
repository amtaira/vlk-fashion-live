'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type ViewState = 'HOME' | 'CATALOGUE' | 'GRID' | 'DETAIL' | 'SUCCESS' | 'SIZE_GUIDE' | 'SUSTAINABILITY' | 'FOUNDATION' | 'SHIPMENT' | 'COOKIE';

export default function Home() {
  const [view, setView] = useState<ViewState>('HOME');
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [bgVideo, setBgVideo] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'NONE' | 'MPESA_STK' | 'MPESA_PAYBILL' | 'VISA'>('NONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // 1. ROBUST HISTORY LISTENER
  useEffect(() => {
    const handlePopState = (event: any) => {
      if (event.state) {
        setView(event.state.view || 'HOME');
        setActiveCat(event.state.cat || null);
        setSelectedProduct(event.state.prod || null);
      } else {
        setView('HOME');
        setActiveCat(null);
        setSelectedProduct(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    if (!window.history.state) {
      window.history.replaceState({ view: 'HOME', cat: null, prod: null }, "");
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const { data: catData } = await supabase.from('catalogues').select('*, products(*)');
      if (catData) setCatalogues(catData);
      const { data: settings } = await supabase.from('site_settings').select('value').eq('key', 'bg_video').maybeSingle();
      if (settings) setBgVideo(settings.value);
    }
    fetchData();
    const savedCart = localStorage.getItem('vlk_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('vlk_cart', JSON.stringify(cart));
  }, [cart]);

  const navigate = (newView: ViewState, cat: any = null, prod: any = null) => {
    setView(newView);
    setActiveCat(cat);
    setSelectedProduct(prod);
    setIsMenuOpen(false);
    if (prod) setActiveImage(prod.image_url);
    
    window.history.pushState({ view: newView, cat, prod }, "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateQuantity = (cartId: number, delta: number) => {
    setCart(cart.map(item => item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const removeFromCart = (cartId: number) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const addToBag = () => {
    if (!selectedSize) return alert("SELECT SIZE");
    const existing = cart.find(i => i.id === selectedProduct.id && i.selectedSize === selectedSize);
    if (existing) {
      updateQuantity(existing.cartId, 1);
    } else {
      const newItem = { ...selectedProduct, selectedSize, activeImage, quantity: 1, cartId: Math.random() };
      setCart([...cart, newItem]);
    }
    setSelectedSize('');
    setIsCartOpen(true);
  };

  const submitOrder = async () => {
    const { error } = await supabase.from('orders').insert([{
      items: cart,
      total: cart.reduce((acc, curr) => acc + (Number(curr.price) * curr.quantity), 0),
      payment_method: paymentMethod,
      customer_phone: phoneNumber,
      status: 'pending'
    }]);
    if (!error) {
      setCart([]);
      setShowPaymentModal(false);
      navigate('SUCCESS');
    }
  };

  const PolicyPage = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="max-w-4xl mx-auto pt-32 px-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="text-5xl font-black italic uppercase tracking-tighter text-red-600 mb-8 border-b border-white/10 pb-4">{title}</h2>
      <div className="text-lg leading-relaxed text-white/80 space-y-6 font-medium uppercase tracking-tight">
        {children}
      </div>
      <button onClick={() => navigate('HOME')} className="mt-12 px-8 py-3 border border-white/20 hover:bg-white hover:text-black transition-all font-black uppercase text-xs">Return Home</button>
    </div>
  );

  return (
    <main className="min-h-screen text-white relative overflow-x-hidden font-sans">
      {/* Hidden SEO Header for Googlebot */}
      <h1 className="sr-only">VLK | Visual Lukks Official Digital Terminal</h1>

      <div className="fixed inset-0 -z-30 bg-black" />
      <video src={bgVideo || "/hero-bg.mp4"} autoPlay loop muted playsInline className="fixed inset-0 -z-25 w-full h-full object-cover opacity-60 pointer-events-none" />

      <div className="fixed bottom-8 left-8 z-[100] mix-blend-difference pointer-events-none">
        <img src="/vlogo.png" alt="VLK Branding" className="w-16 h-auto opacity-80" />
      </div>

      <nav className="fixed top-0 w-full z-[100] px-6 py-8 flex justify-between items-center mix-blend-difference">
        <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-4 group cursor-pointer">
          <div className="space-y-1.5"><div className="w-6 h-0.5 bg-white"/><div className="w-4 h-0.5 bg-white"/></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Menu</span>
        </button>
        <img src="/logo1.png" alt="VLK Visual Lukks" className="h-8 cursor-pointer" onClick={() => navigate('HOME')} />
        <button onClick={() => setIsCartOpen(true)} className="relative cursor-pointer">
          <span className="bg-red-600 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
        </button>
      </nav>

      {/* MENU */}
      <div className={`fixed inset-0 z-[150] transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
        <div className={`relative w-80 h-full bg-black/40 backdrop-blur-xl border-r border-white/10 p-10 flex flex-col justify-center space-y-8 transition-transform duration-500 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {['CATALOGUE', 'SIZE_GUIDE', 'SUSTAINABILITY', 'FOUNDATION', 'SHIPMENT', 'COOKIE'].map((id) => (
            <button key={id} onClick={() => navigate(id as ViewState)} className="text-2xl font-black uppercase italic text-left hover:text-red-600 transition-colors">
              {id.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        {view === 'HOME' && (
          <div className="min-h-screen flex flex-col items-center justify-center transform -translate-y-10">
            <button onClick={() => navigate('CATALOGUE')} className="px-12 py-4 border border-white hover:bg-red-600 hover:border-red-600 transition-all uppercase font-black text-xs tracking-[0.4em]">Shop With Us</button>
          </div>
        )}

        {view === 'SUCCESS' && (
          <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 border-4 border-red-600 rounded-full flex items-center justify-center mb-8 animate-bounce">
              <span className="text-4xl">✓</span>
            </div>
            <h2 className="text-6xl font-black italic uppercase mb-4">Order Received</h2>
            <p className="max-w-md opacity-70 uppercase font-bold text-sm tracking-widest">Your order is being processed. Our admin will verify your payment details shortly. Check your phone for notification.</p>
            <button onClick={() => navigate('HOME')} className="mt-10 px-10 py-4 bg-white text-black font-black uppercase tracking-tighter">Back to Home</button>
          </div>
        )}

        {view === 'SHIPMENT' && (
          <PolicyPage title="Shipment Policy">
            <p>VLK² Logistics ensures worldwide shipping within 7-14 business days.</p>
            <p>Domestic orders (Kenya) are processed within 24-48 hours via our dedicated courier partners.</p>
            <p>Tracking numbers are shared via SMS/Email immediately upon dispatch.</p>
          </PolicyPage>
        )}

        {view === 'SUSTAINABILITY' && (
          <PolicyPage title="Sustainability">
            <p>We are committed to zero-waste production. Every VLK piece is crafted from 100% heavy-weight organic cotton and recycled fibers.</p>
            <p>Our packaging is 100% biodegradable, aligning with our vision of high-end fashion that respects the earth.</p>
          </PolicyPage>
        )}

        {view === 'SIZE_GUIDE' && (
          <PolicyPage title="Size Guide">
            <p>Our silhouettes are cut for an 'Urban Oversize' fit.</p>
            <table className="w-full border border-white/10 text-xs mt-4">
              <thead><tr className="bg-white/5 font-black uppercase text-left"><th className="p-2">Size</th><th className="p-2">Chest (in)</th><th className="p-2">Length (in)</th></tr></thead>
              <tbody className="text-left">
                <tr className="border-b border-white/5"><td className="p-2">S</td><td className="p-2">44</td><td className="p-2">28</td></tr>
                <tr className="border-b border-white/5"><td className="p-2">M</td><td className="p-2">46</td><td className="p-2">29</td></tr>
                <tr className="border-b border-white/5"><td className="p-2">L</td><td className="p-2">48</td><td className="p-2">30</td></tr>
                <tr className="border-b border-white/5"><td className="p-2">XL</td><td className="p-2">50</td><td className="p-2">31</td></tr>
              </tbody>
            </table>
          </PolicyPage>
        )}

        {view === 'CATALOGUE' && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 pt-40 px-6">
            {catalogues.map(cat => (
              <div key={cat.id} onClick={() => navigate('GRID', cat)} className="h-96 border border-white/10 rounded-3xl flex items-center justify-center cursor-pointer hover:bg-white/5 transition-all overflow-hidden relative">
                <h2 className="text-3xl font-black uppercase z-10">{cat.name}</h2>
              </div>
            ))}
          </div>
        )}
        
        {view === 'GRID' && (
          <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-3 gap-10 mt-40 px-6">
            {activeCat?.products?.map((p: any) => (
              <div key={p.id} onClick={() => navigate('DETAIL', activeCat, p)} className="cursor-pointer bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <img src={p.image_url} alt={`${p.name} - VLK Exclusive`} className="aspect-[3/4] object-contain mb-4" />
                <h3 className="font-black uppercase text-[10px] tracking-widest">{p.name}</h3>
                <p className="text-red-600 font-bold">£{p.price}.00</p>
              </div>
            ))}
          </div>
        )}

        {view === 'DETAIL' && selectedProduct && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 bg-black/60 p-10 rounded-[40px] border border-white/10 backdrop-blur-xl mt-40 mx-6">
            <img src={activeImage} alt={`VLK ${selectedProduct.name}`} className="w-full h-auto object-contain rounded-3xl" />
            <div className="space-y-8">
              <h2 className="text-6xl font-black uppercase italic tracking-tighter">{selectedProduct.name}</h2>
              <p className="text-3xl font-bold text-red-600">£{selectedProduct.price}.00</p>
              <div className="flex gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)} className={`w-12 h-12 border font-black ${selectedSize === s ? 'bg-red-600 border-red-600' : 'border-white/20'}`}>{s}</button>
                ))}
              </div>
              <button onClick={addToBag} className="w-full py-5 bg-white text-black font-black uppercase">Add to Bag</button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS (PAYMENT & CART) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/80" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-black border-l border-white/10 h-full p-8 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-black uppercase text-red-600">Your Bag</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-[10px] uppercase opacity-50">Continue Shopping</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6">
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-4 items-center border-b border-white/5 pb-4">
                  <img src={item.activeImage} className="w-16 h-20 object-cover" alt={item.name} />
                  <div className="flex-1 text-[10px] font-black uppercase">
                    <p>{item.name}</p>
                    <p className="text-red-600">{item.selectedSize}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQuantity(item.cartId, -1)} className="w-5 h-5 border border-white/20 flex items-center justify-center">-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartId, 1)} className="w-5 h-5 border border-white/20 flex items-center justify-center">+</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold mb-2">£{item.price * item.quantity}</p>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-600 text-[10px]">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-white/10">
              <div className="flex justify-between font-black uppercase mb-4"><span>Total</span><span>£{cart.reduce((a, b) => a + (b.price * b.quantity), 0)}</span></div>
              <button onClick={() => { setShowPaymentModal(true); setIsCartOpen(false); }} className="w-full py-5 bg-red-600 font-black uppercase">Proceed to Payment</button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setShowPaymentModal(false)} />
          <div className="relative w-full max-w-lg bg-black border border-white/10 p-8 rounded-3xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black uppercase italic">Checkout</h2>
              <button onClick={() => { setShowPaymentModal(false); setIsCartOpen(true); }} className="text-red-600 text-[10px] font-black uppercase underline">Back to Bag</button>
            </div>
            <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
              {['MPESA_STK', 'MPESA_PAYBILL', 'VISA'].map((m) => (
                <button key={m} onClick={() => setPaymentMethod(m as any)} className={`text-[10px] font-black px-4 py-2 rounded-full border ${paymentMethod === m ? 'bg-red-600 border-red-600' : 'border-white/10 opacity-50'}`}>
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
            {paymentMethod === 'MPESA_STK' && (
              <div className="space-y-4">
                <input type="text" placeholder="2547XXXXXXXX" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                <button onClick={submitOrder} className="w-full py-4 bg-red-600 text-white font-black uppercase rounded-xl">Send Prompt</button>
              </div>
            )}
            {paymentMethod === 'MPESA_PAYBILL' && (
              <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="opacity-60 uppercase text-xs">Business No</span><span className="font-black text-red-600">247247</span></div>
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="opacity-60 uppercase text-xs">Account No</span><span className="font-black text-red-600">0795151303</span></div>
                <button onClick={submitOrder} className="w-full py-4 bg-red-600 mt-4 font-black uppercase">Confirm Payment</button>
              </div>
            )}
            {paymentMethod === 'VISA' && (
              <div className="space-y-4">
                <input type="text" placeholder="Card Number" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                   <input type="text" placeholder="MM/YY" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                   <input type="text" placeholder="CVV" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
                </div>
                <button onClick={submitOrder} className="w-full py-4 bg-red-600 text-white font-black uppercase rounded-xl">Complete with Visa</button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="py-10 text-center opacity-20 text-[8px] uppercase tracking-[0.5em] font-black">
        © 2026 VLK / Visual Lukks Official Archive
      </footer>
    </main>
  );
}