// Location: app/page.tsx
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
    const savedCart = localStorage.getItem('onr_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('onr_cart', JSON.stringify(cart));
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
    if (!selectedSize) return alert("SELECT SILHOUETTE DIMENSION");
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
      <h2 className="text-5xl font-black italic uppercase tracking-tighter text-[#929982] mb-8 border-b border-white/10 pb-4">{title}</h2>
      <div className="text-sm md:text-base leading-relaxed text-neutral-300 space-y-6 font-medium uppercase tracking-wider">
        {children}
      </div>
      <button onClick={() => navigate('HOME')} className="mt-12 px-8 py-3 border border-[#929982]/40 text-[#929982] hover:bg-[#929982] hover:text-[#141612] transition-all font-black uppercase text-xs tracking-widest cursor-pointer">Return Home</button>
    </div>
  );

  return (
    <main className="min-h-screen text-[#eaece6] relative overflow-x-hidden font-sans selection:bg-[#929982] selection:text-[#141612]">
      {/* Hidden SEO Header for Googlebot */}
      <h1 className="sr-only">Outfit Not Random Official Digital Terminal</h1>

      {/* Brand Identity Background System */}
      <div className="fixed inset-0 -z-30 bg-[#141612]" />
      <video src={bgVideo || "/hero-bg.mp4"} autoPlay loop muted playsInline className="fixed inset-0 -z-25 w-full h-full object-cover opacity-25 pointer-events-none filter grayscale contrast-125" />

      {/* Floating Identity Mark */}
      <div className="fixed bottom-8 left-8 z-[100] mix-blend-difference pointer-events-none">
        <img src="/vlogo.png" alt="ONR Branding Matrix" className="w-12 h-auto opacity-40" />
      </div>

      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-[100] px-6 py-8 flex justify-between items-center mix-blend-difference">
        <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-4 group cursor-pointer bg-transparent border-none outline-none">
          <div className="space-y-1.5"><div className="w-6 h-0.5 bg-white group-hover:bg-[#929982] transition-colors"/><div className="w-4 h-0.5 bg-white group-hover:bg-[#929982] transition-colors"/></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white group-hover:text-[#929982] transition-colors">Menu</span>
        </button>
        
        <button onClick={() => navigate('HOME')} className="text-base md:text-xl font-black uppercase tracking-[0.3em] text-white hover:text-[#929982] transition-colors bg-transparent border-none outline-none cursor-pointer">
          ONR
        </button>

        <button onClick={() => setIsCartOpen(true)} className="relative cursor-pointer bg-transparent border-none outline-none flex items-center justify-center group">
          <span className="text-[10px] font-black uppercase tracking-widest mr-2 text-white group-hover:text-[#929982] transition-colors hidden md:inline">Bag</span>
          <span className="bg-[#929982] text-[#141612] text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-black group-hover:bg-white transition-colors">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
        </button>
      </nav>

      {/* SIDEBAR NAVIGATION MENU */}
      <div className={`fixed inset-0 z-[150] transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
        <div className={`relative w-80 h-full bg-[#1b1e18]/95 border-r border-white/5 p-10 flex flex-col justify-center space-y-6 transition-transform duration-500 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-8 left-10 text-[9px] font-black tracking-widest text-[#929982]/60 uppercase">Navigation Nodes</div>
          {['CATALOGUE', 'SIZE_GUIDE', 'SUSTAINABILITY', 'FOUNDATION', 'SHIPMENT', 'COOKIE'].map((id) => (
            <button key={id} onClick={() => navigate(id as ViewState)} className="text-2xl font-black uppercase italic text-left hover:text-[#929982] hover:translate-x-2 transition-all bg-transparent border-none cursor-pointer text-[#eaece6]">
              {id.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT ARCHIVE ROUTER */}
      <div className="relative z-10">
        
        {/* VIEW: HOME */}
        {view === 'HOME' && (
          <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <div className="text-center mb-8 space-y-2">
              <div className="text-[10px] tracking-[0.6em] text-[#929982] font-black uppercase">Outfit Not Random</div>
              <div className="text-xs tracking-[0.3em] text-neutral-400 font-medium uppercase">Intentional Architecture Blueprint</div>
            </div>
            <button onClick={() => navigate('CATALOGUE')} className="px-14 py-4 border border-[#929982] bg-[#1c1f19]/40 backdrop-blur-sm hover:bg-[#929982] hover:text-[#141612] transition-all uppercase font-black text-xs tracking-[0.5em] text-[#929982] cursor-pointer z-20 relative rounded-none shadow-2xl">
              Shop With Us
            </button>
          </div>
        )}

        {/* VIEW: SUCCESS */}
        {view === 'SUCCESS' && (
          <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 border-2 border-[#929982] rounded-full flex items-center justify-center mb-8 animate-pulse">
              <span className="text-2xl text-[#929982]">✓</span>
            </div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 text-white">Order Registered</h2>
            <p className="max-w-md opacity-70 uppercase font-bold text-xs tracking-[0.2em] leading-relaxed text-neutral-300">
              Your architectural curation deployment is pending baseline processing. Our network administrator will audit your payload shortly.
            </p>
            <button onClick={() => navigate('HOME')} className="mt-10 px-10 py-4 bg-[#929982] text-[#141612] font-black uppercase tracking-widest text-xs cursor-pointer border-none hover:bg-white transition-colors">Back to Terminal Home</button>
          </div>
        )}

        {/* VIEW: SHIPMENT */}
        {view === 'SHIPMENT' && (
          <PolicyPage title="Shipment Logistics">
            <p>Outfit Not Random architectural structures are processed inside clean environments and dispatched systematically.</p>
            <p>Domestic drop networks within Kenya interface transit paradigms within 24–48 hours via premium private couriers.</p>
            <p>Global cross-border distribution channels are maintained within 7–14 standard structural intervals.</p>
          </PolicyPage>
        )}

        {/* VIEW: SUSTAINABILITY */}
        {view === 'SUSTAINABILITY' && (
          <PolicyPage title="Eco Blueprint Balance">
            <p>Production execution matrices prioritize complete calculated elimination of texturing waste materials.</p>
            <p>Every single construction setup utilizes 100% pure organic cotton configurations harvested alongside low-impact processing.</p>
            <p>Packaging layers are strictly bio-derived, maintaining modern systemic integration standard alignments.</p>
          </PolicyPage>
        )}

        {/* VIEW: FOUNDATION */}
        {view === 'FOUNDATION' && (
          <PolicyPage title="The ONR Foundation">
            <p>Outfit Not Random operates as an architectural clothing design collective centered around structure, intention, and balance.</p>
            <p>We reject the chaotic noise of fast fashion cycles. Our garments are structured blueprints engineered for permanent residence within architectural wardrobes.</p>
          </PolicyPage>
        )}

        {/* VIEW: COOKIE */}
        {view === 'COOKIE' && (
          <PolicyPage title="Data Architecture Nodes">
            <p>This digital terminal implements essential analytical nodes to securely cache checkout profiles and maintain your product bag configuration layout.</p>
            <p>No arbitrary monitoring tracking models are active. All baseline user tokens are managed completely locally within isolated device parameters.</p>
          </PolicyPage>
        )}

        {/* VIEW: SIZE GUIDE */}
        {view === 'SIZE_GUIDE' && (
          <PolicyPage title="Dimensional Contours">
            <p>Silhouettes cut across specific urban oversized engineering models.</p>
            <table className="w-full border border-white/5 text-xs mt-6 uppercase tracking-wider">
              <thead>
                <tr className="bg-[#1b1e18] font-black text-[#929982] border-b border-white/10">
                  <th className="p-3">Designation</th>
                  <th className="p-3">Chest Parameter (in)</th>
                  <th className="p-3">Vertical Profile (in)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#141612]/40">
                <tr><td className="p-3 font-black">S</td><td className="p-3 opacity-80">44</td><td className="p-3 opacity-80">28</td></tr>
                <tr><td className="p-3 font-black">M</td><td className="p-3 opacity-80">46</td><td className="p-3 opacity-80">29</td></tr>
                <tr><td className="p-3 font-black">L</td><td className="p-3 opacity-80">48</td><td className="p-3 opacity-80">30</td></tr>
                <tr><td className="p-3 font-black">XL</td><td className="p-3 opacity-80">50</td><td className="p-3 opacity-80">31</td></tr>
              </tbody>
            </table>
          </PolicyPage>
        )}

        {/* VIEW: CATALOGUE */}
        {view === 'CATALOGUE' && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 pt-40 px-6 pb-24">
            {catalogues.map(cat => (
              <div key={cat.id} onClick={() => navigate('GRID', cat)} className="h-80 border border-white/5 bg-[#1b1e18]/60 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#929982]/40 hover:bg-[#1b1e18]/90 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#929982]/5 rounded-bl-full group-hover:bg-[#929982]/10 transition-colors" />
                <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-white group-hover:text-[#929982] transition-colors">{cat.name}</h2>
                <span className="text-[9px] uppercase tracking-widest text-neutral-500 mt-2">View Technical Matrix</span>
              </div>
            ))}
          </div>
        )}
        
        {/* VIEW: GRID */}
        {view === 'GRID' && (
          <div className="max-w-6xl mx-auto pt-40 px-6 pb-24">
            <div className="mb-12 border-b border-white/5 pb-4 flex justify-between items-end">
              <h2 className="text-2xl font-black uppercase tracking-widest text-[#929982] italic">{activeCat?.name}</h2>
              <button onClick={() => navigate('CATALOGUE')} className="text-[10px] font-bold uppercase text-neutral-400 hover:text-white underline tracking-widest bg-transparent border-none cursor-pointer">All Catalues</button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {activeCat?.products?.map((p: any) => (
                <div key={p.id} onClick={() => navigate('DETAIL', activeCat, p)} className="cursor-pointer bg-[#1b1e18]/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm hover:border-[#929982]/30 transition-all duration-300 flex flex-col group">
                  <div className="bg-[#141612]/80 rounded-xl p-4 mb-4 aspect-[3/4] flex items-center justify-center overflow-hidden">
                    <img src={p.image_url} alt={`${p.name} - Outfit Not Random Architectural Core`} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-black uppercase text-[11px] tracking-widest text-neutral-200 group-hover:text-[#929982] transition-colors">{p.name}</h3>
                  <p className="text-[#929982] font-black text-sm mt-1">Ksh {p.price}.00</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: DETAIL */}
        {view === 'DETAIL' && selectedProduct && (
          <div className="max-w-5xl mx-auto bg-[#1b1e18]/80 p-6 md:p-12 rounded-[32px] border border-white/5 backdrop-blur-xl mt-40 mx-4 md:mx-6 mb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="bg-[#141612]/90 p-6 rounded-2xl border border-white/5 flex items-center justify-center aspect-[4/5]">
              <img src={activeImage} alt={`Blueprint Structural View - ${selectedProduct.name}`} className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col justify-center space-y-6">
              <div>
                <span className="text-[9px] uppercase tracking-[0.4em] text-[#929982] font-bold">Silhouette Design</span>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white mt-1">{selectedProduct.name}</h2>
              </div>
              <p className="text-2xl font-black text-[#929982]">Ksh {selectedProduct.price}.00</p>
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Dimension Allocation</div>
                <div className="flex flex-wrap gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`w-11 h-11 border text-xs font-black transition-all bg-transparent cursor-pointer rounded-lg ${selectedSize === s ? 'bg-[#929982] border-[#929982] text-[#141612]' : 'border-white/10 text-white hover:border-[#929982]'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <button onClick={addToBag} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs cursor-pointer rounded-xl hover:bg-[#929982] hover:text-[#141612] transition-colors border-none shadow-xl pt-4">Add to Structural Bag</button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER LAYER INTERACTION MODALS */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-[#141612] border-l border-white/5 h-full p-8 flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
              <h2 className="font-black uppercase tracking-widest text-xs text-[#929982]">Allocated Inventory</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-[9px] uppercase tracking-widest text-neutral-400 hover:text-white bg-transparent border-none cursor-pointer">Exit Node</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-4 items-center border-b border-white/5 pb-4">
                  <div className="w-16 h-20 bg-[#1b1e18] rounded-lg p-2 border border-white/5 flex items-center justify-center shrink-0">
                    <img src={item.activeImage} className="max-w-full max-h-full object-contain" alt={item.name} />
                  </div>
                  <div className="flex-1 text-[11px] font-black uppercase tracking-wider space-y-1">
                    <p className="text-white truncate max-w-[180px]">{item.name}</p>
                    <p className="text-[#929982] text-[10px]">Dimension: {item.selectedSize}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.cartId, -1)} className="w-5 h-5 border border-white/10 flex items-center justify-center text-white bg-transparent rounded cursor-pointer">-</button>
                      <span className="px-1 text-xs text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartId, 1)} className="w-5 h-5 border border-white/10 flex items-center justify-center text-white bg-transparent rounded cursor-pointer">+</button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-xs text-white">Ksh {item.price * item.quantity}</p>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-neutral-500 hover:text-red-400 text-[9px] font-bold tracking-widest bg-transparent border-none cursor-pointer mt-2 uppercase">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-white/10 mt-4 space-y-4">
              <div className="flex justify-between font-black uppercase text-xs tracking-widest text-neutral-300"><span>Accumulated Sum</span><span className="text-white text-sm">Ksh {cart.reduce((a, b) => a + (b.price * b.quantity), 0)}.00</span></div>
              <button onClick={() => { setShowPaymentModal(true); setIsCartOpen(false); }} className="w-full py-4 bg-[#929982] text-[#141612] font-black uppercase tracking-widest text-xs rounded-xl cursor-pointer border-none hover:bg-white transition-colors">Initialize Settlement</button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
          <div className="relative w-full max-w-md bg-[#1b1e18] border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-[#929982]">Settlement Terminal</h2>
              <button onClick={() => { setShowPaymentModal(false); setIsCartOpen(true); }} className="text-neutral-400 hover:text-white text-[9px] font-black uppercase tracking-widest underline bg-transparent border-none cursor-pointer">Return to Inventory</button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-6 bg-[#141612] p-1.5 rounded-xl border border-white/5">
              {['MPESA_STK', 'MPESA_PAYBILL', 'VISA'].map((m) => (
                <button key={m} onClick={() => setPaymentMethod(m as any)} className={`text-[9px] font-black px-3 py-2 rounded-lg border transition-all flex-1 text-center cursor-pointer ${paymentMethod === m ? 'bg-[#929982] border-[#929982] text-[#141612]' : 'border-transparent opacity-40 text-white hover:opacity-75'}`}>
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
            {paymentMethod === 'NONE' && (
              <div className="text-center py-8 text-xs font-black uppercase tracking-widest text-neutral-500">Select Gateway Node</div>
            )}
            {paymentMethod === 'MPESA_STK' && (
              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">M-Pesa Express Payload</div>
                <input type="text" placeholder="2547XXXXXXXX" className="w-full bg-[#141612] border border-white/10 p-4 rounded-xl outline-none text-white font-mono text-sm focus:border-[#929982] transition-colors" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                <button onClick={submitOrder} className="w-full py-4 bg-[#929982] text-[#141612] font-black uppercase text-xs tracking-widest rounded-xl border-none cursor-pointer hover:bg-white transition-colors">Send STK Push Request</button>
              </div>
            )}
            {paymentMethod === 'MPESA_PAYBILL' && (
              <div className="space-y-4">
                <div className="bg-[#141612] p-4 rounded-xl border border-white/5 space-y-3 font-mono text-xs uppercase tracking-wider">
                  <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-neutral-500">Business Number</span><span className="font-black text-[#929982]">247247</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-neutral-500">Account Reference</span><span className="font-black text-[#929982]">0795151303</span></div>
                </div>
                <button onClick={submitOrder} className="w-full py-4 bg-[#929982] text-[#141612] font-black uppercase text-xs tracking-widest rounded-xl border-none cursor-pointer hover:bg-white transition-colors">Confirm Paybill Deposit</button>
              </div>
            )}
            {paymentMethod === 'VISA' && (
              <div className="space-y-3">
                <div className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Merchant Routing Layer</div>
                <input type="text" placeholder="Card Number string" className="w-full bg-[#141612] border border-white/10 p-4 rounded-xl outline-none text-white font-mono text-xs focus:border-[#929982]" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                   <input type="text" placeholder="MM/YY" className="w-full bg-[#141612] border border-white/10 p-4 rounded-xl outline-none text-white font-mono text-xs focus:border-[#929982]" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                   <input type="text" placeholder="CVV security" className="w-full bg-[#141612] border border-white/10 p-4 rounded-xl outline-none text-white font-mono text-xs focus:border-[#929982]" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
                </div>
                <button onClick={submitOrder} className="w-full py-4 bg-[#929982] text-[#141612] font-black uppercase text-xs tracking-widest rounded-xl border-none cursor-pointer hover:bg-white transition-colors">Authorize Secure Visa Node</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER METADATA MARK */}
      <footer className="py-12 text-center opacity-30 text-[8px] uppercase tracking-[0.6em] font-black text-neutral-400">
        © 2026 Outfit Not Random / Architectural Production Engine
      </footer>
    </main>
  );
}