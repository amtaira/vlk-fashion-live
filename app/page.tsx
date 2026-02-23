'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type ViewState = 'HOME' | 'CATALOGUE' | 'GRID' | 'DETAIL' | 'SIGNUP' | 'SIZE_GUIDE' | 'SUSTAINABILITY' | 'FOUNDATION' | 'SHIPMENT' | 'COOKIE';

export default function Home() {
  const [view, setView] = useState<ViewState>('HOME');
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [bgVideo, setBgVideo] = useState('');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'NONE' | 'MPESA_STK' | 'MPESA_PAYBILL' | 'VISA'>('NONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. DATA FETCHING
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

  // 2. BROWSER NAVIGATION LOGIC (RESTORED)
  useEffect(() => {
    window.history.replaceState({ view: 'HOME', cat: null, prod: null }, "");
    const handlePopState = (event: any) => {
      if (event.state) {
        setView(event.state.view || 'HOME');
        setActiveCat(event.state.cat || null);
        setSelectedProduct(event.state.prod || null);
        if (event.state.prod) setActiveImage(event.state.prod.image_url);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newView: ViewState, cat: any = null, prod: any = null) => {
    setView(newView);
    setActiveCat(cat);
    setSelectedProduct(prod);
    setIsMenuOpen(false);
    if (prod) {
      setActiveImage(prod.image_url);
      setSelectedColor(prod.variants?.[0]?.color || 'OG');
    }
    // Update browser history so back button works
    window.history.pushState({ view: newView, cat, prod }, "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToBag = () => {
    if (!selectedSize) return alert("SELECT SIZE");
    const newItem = { ...selectedProduct, selectedSize, activeImage, selectedColor, cartId: Math.random() };
    setCart([...cart, newItem]);
    setSelectedSize('');
    setIsCartOpen(true);
  };

  const submitOrder = async () => {
    setIsProcessing(true);
    // Logic to save order to Supabase
    const { error } = await supabase.from('orders').insert([{
      items: cart,
      total: cart.reduce((acc, curr) => acc + Number(curr.price), 0),
      payment_method: paymentMethod,
      customer_phone: phoneNumber,
      status: 'pending'
    }]);
    if (!error) {
      alert("VLK²: ORDER RECEIVED. Processing payment...");
      setCart([]);
      setShowPaymentModal(false);
      setIsCartOpen(false);
    }
    setIsProcessing(false);
  };

  return (
    <main className="min-h-screen text-white relative overflow-x-hidden font-sans">
      {/* PERSISTENT BACKGROUND VIDEO */}
      <div className="fixed inset-0 -z-20 bg-black" />
      <video src={bgVideo || "/hero-bg.mp4"} autoPlay loop muted playsInline 
             className="fixed inset-0 -z-10 w-full h-full object-cover opacity-30 grayscale pointer-events-none" />

      {/* NAV */}
      <nav className="fixed top-0 w-full z-[100] px-6 py-8 flex justify-between items-center mix-blend-difference">
        <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-4 group">
          <div className="space-y-1.5"><div className="w-6 h-0.5 bg-white"/><div className="w-4 h-0.5 bg-white"/></div>
          <span className="text-[10px] font-black tracking-widest uppercase">Menu</span>
        </button>
        <div className="font-black text-2xl tracking-tighter cursor-pointer" onClick={() => navigate('HOME')}>VLKLUKKS²</div>
        <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2">
          <span className="bg-pink-500 text-black text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold">{cart.length}</span>
        </button>
      </nav>

      {/* SIDEBAR MENU */}
      <div className={`fixed inset-0 z-[150] transition-transform duration-500 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
        <div className="relative w-80 h-full bg-black border-r border-white/10 p-10 flex flex-col justify-center space-y-6">
          {['Products', 'Size Guide', 'Sustainability', 'Foundation', 'Shipment Policy'].map((item) => (
            <button key={item} onClick={() => navigate(item.toUpperCase().replace(' ', '_') as ViewState)} className="text-2xl font-black uppercase italic text-left hover:text-pink-500 transition-all">{item}</button>
          ))}
        </div>
      </div>

      <div className="pt-32 px-6 pb-20 relative z-10">
        {view === 'HOME' && (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
            <h1 className="text-8xl font-black uppercase italic tracking-tighter">VLKLUKKS</h1>
            <button onClick={() => navigate('CATALOGUE')} className="px-10 py-4 border border-white hover:bg-pink-500 hover:border-pink-500 transition-all uppercase font-black text-xs tracking-[0.4em]">Shop With Us</button>
          </div>
        )}

        {view === 'CATALOGUE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {catalogues.map(cat => (
              <div key={cat.id} onClick={() => navigate('GRID', cat)} className="h-96 border border-white/10 rounded-3xl flex items-center justify-center cursor-pointer hover:bg-white/5 transition-all group">
                <h2 className="text-3xl font-black uppercase tracking-widest group-hover:text-pink-500">{cat.name}</h2>
              </div>
            ))}
          </div>
        )}

        {view === 'GRID' && (
          <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-3 gap-10">
            {activeCat?.products?.map((p: any) => (
              <div key={p.id} onClick={() => navigate('DETAIL', activeCat, p)} className="cursor-pointer group text-center">
                <img src={p.image_url} className="aspect-[3/4] object-contain mb-4 group-hover:scale-105 transition-transform" />
                <h3 className="font-black uppercase text-[10px] tracking-widest">{p.name}</h3>
                <p className="text-pink-500 font-bold">£{p.price}.00</p>
              </div>
            ))}
          </div>
        )}

        {view === 'DETAIL' && selectedProduct && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            <img src={activeImage} className="w-full h-auto object-contain rounded-3xl bg-white/5" />
            <div className="space-y-8">
              <h1 className="text-6xl font-black uppercase italic">{selectedProduct.name}</h1>
              <p className="text-3xl font-bold text-pink-500">£{selectedProduct.price}.00</p>
              <div className="space-y-4">
                <p className="text-xs font-black uppercase opacity-50">Select Size</p>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL'].map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`w-12 h-12 border ${selectedSize === s ? 'bg-pink-500 text-black border-pink-500' : 'border-white/20'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <button onClick={addToBag} className="w-full py-5 bg-white text-black font-black uppercase tracking-widest hover:bg-pink-500 transition-all">Add to Bag</button>
            </div>
          </div>
        )}
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setShowPaymentModal(false)} />
          <div className="relative w-full max-w-lg bg-black border border-white/10 p-8 rounded-3xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-black uppercase italic mb-6">Secure Checkout</h2>
            
            {/* Tab Selectors */}
            <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
              {['MPESA_STK', 'MPESA_PAYBILL', 'VISA'].map((m) => (
                <button key={m} onClick={() => setPaymentMethod(m as any)} className={`text-[10px] font-black px-4 py-2 rounded-full border ${paymentMethod === m ? 'bg-pink-500 text-black border-pink-500' : 'border-white/10 opacity-50'}`}>
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>

            {paymentMethod === 'MPESA_STK' && (
              <div className="space-y-4">
                <p className="text-[10px] opacity-60">Enter phone to receive STK Push prompt on your device.</p>
                <input type="text" placeholder="2547..." className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                <button onClick={submitOrder} className="w-full py-4 bg-green-600 font-black uppercase rounded-xl">Send Prompt</button>
              </div>
            )}

            {paymentMethod === 'MPESA_PAYBILL' && (
              <div className="space-y-4 text-center p-6 bg-white/5 rounded-2xl">
                <p className="text-xs font-black text-pink-500 uppercase">Manual Paybill Instructions</p>
                <div className="text-left space-y-2 text-sm">
                  <p>1. Go to M-PESA Menu</p>
                  <p>2. Lipa na M-PESA &gt; Paybill</p>
                  <p>3. Business No: <span className="font-black text-white">0795151303</span></p>
                  <p>4. Account No: <span className="font-black text-white">247247</span></p>
                  <p>5. Enter Amount & PIN</p>
                </div>
                <button onClick={submitOrder} className="w-full py-4 bg-white text-black font-black uppercase rounded-xl mt-4">I Have Paid</button>
              </div>
            )}

            {paymentMethod === 'VISA' && (
              <div className="space-y-4">
                <input type="text" placeholder="CARD NUMBER" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none" />
                <div className="flex gap-4">
                  <input type="text" placeholder="MM/YY" className="w-1/2 bg-white/5 border border-white/10 p-4 rounded-xl outline-none" />
                  <input type="text" placeholder="CVC" className="w-1/2 bg-white/5 border border-white/10 p-4 rounded-xl outline-none" />
                </div>
                <button onClick={submitOrder} className="w-full py-4 bg-blue-600 font-black uppercase rounded-xl">Pay Now</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/80" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-black border-l border-white/10 h-full p-8 flex flex-col">
            <h2 className="font-black uppercase tracking-widest mb-10">Your Bag</h2>
            <div className="flex-1 overflow-y-auto space-y-6">
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-4 items-center">
                  <img src={item.activeImage} className="w-16 h-20 object-cover rounded" />
                  <div className="flex-1 text-[10px] font-black uppercase">
                    <p>{item.name}</p>
                    <p className="text-pink-500">{item.selectedSize}</p>
                  </div>
                  <p className="font-bold">£{item.price}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setShowPaymentModal(true)} className="w-full py-5 bg-pink-500 text-black font-black uppercase mt-4">Proceed to Payment</button>
          </div>
        </div>
      )}
    </main>
  );
}