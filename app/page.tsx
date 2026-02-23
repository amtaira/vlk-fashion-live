'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type ViewState = 'CATALOGUE' | 'GRID' | 'DETAIL';

export default function Home() {
  const [view, setView] = useState<ViewState>('CATALOGUE');
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [bgVideo, setBgVideo] = useState('');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'NONE' | 'MPESA' | 'VISA'>('NONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. FETCH DATA & SETTINGS
  useEffect(() => {
    async function fetchData() {
      // Get Products/Catalogues
      const { data: catData } = await supabase.from('catalogues').select('*, products(*)');
      if (catData) setCatalogues(catData);

      // Get Site Appearance (Background Video)
      const { data: settings } = await supabase.from('site_settings').select('value').eq('key', 'bg_video').maybeSingle();
      if (settings) setBgVideo(settings.value);
    }
    fetchData();

    // Load Cart
    const savedCart = localStorage.getItem('vlk_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // 2. SAVE CART TO LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem('vlk_cart', JSON.stringify(cart));
  }, [cart]);

  // NAVIGATION & POPSTATE
  useEffect(() => {
    window.history.replaceState({ view: 'CATALOGUE', cat: null, prod: null }, "");
    const handlePopState = (event: any) => {
      if (event.state) {
        setView(event.state.view || 'CATALOGUE');
        setActiveCat(event.state.cat || null);
        setSelectedProduct(event.state.prod || null);
        if (event.state.prod) setActiveImage(event.state.prod.image_url);
      } else {
        setView('CATALOGUE');
        setActiveCat(null);
        setSelectedProduct(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newView: ViewState, cat: any = null, prod: any = null) => {
    setView(newView);
    setActiveCat(cat);
    setSelectedProduct(prod);
    if (prod) {
      setActiveImage(prod.image_url);
      setSelectedColor(prod.variants?.[0]?.color || 'OG');
    }
    window.history.pushState({ view: newView, cat, prod }, "");
  };

  const addToBag = () => {
    if (!selectedSize) return alert("SELECT SIZE");
    const newItem = { ...selectedProduct, selectedSize, activeImage, selectedColor, cartId: Math.random() };
    setCart([...cart, newItem]);
    setSelectedSize('');
  };

  const removeFromCart = (cartId: number) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const submitOrder = async () => {
    setIsProcessing(true);
    const orderData = {
      items: cart,
      total: cart.reduce((acc, curr) => acc + Number(curr.price), 0),
      payment_info: paymentMethod === 'MPESA' ? { method: 'MPESA', phone: phoneNumber } : { method: 'VISA', card: '****' + cardDetails.number.slice(-4) },
      status: 'pending_admin_approval',
      created_at: new Date()
    };

    const { error } = await supabase.from('orders').insert([orderData]);

    if (!error) {
      alert("VLK²: Payment Confirmed. Order sent to Admin!");
      setCart([]);
      setShowPaymentModal(false);
      setIsCartOpen(false);
    } else {
      alert("Error sending order.");
    }
    setIsProcessing(false);
  };

  return (
    <main className="min-h-screen text-white relative overflow-x-hidden font-sans">
      {/* DYNAMIC BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-black" />
      {bgVideo ? (
        <video 
          src={bgVideo} 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="fixed inset-0 -z-10 w-full h-full object-cover opacity-20 grayscale pointer-events-none" 
        />
      ) : (
        <div className="fixed inset-0 -z-10 opacity-20 bg-cover bg-center grayscale pointer-events-none" 
             style={{ backgroundImage: "url('/hero-bg.jpg')" }} />
      )}

      {/* HEADER */}
      <nav className="fixed top-0 w-full z-[100] px-10 py-8 flex justify-between items-center">
        <div className="font-black text-pink-500 border border-pink-500 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-pink-500 hover:text-black transition-all" 
             onClick={() => navigate('CATALOGUE')}>VLK²</div>
        
        <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 group">
          <span className="text-[11px] font-black tracking-[0.3em]">BAG</span>
          <span className="bg-pink-500 text-black text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold">
            {cart.length}
          </span>
        </button>
      </nav>

      <div className="pt-32 px-6 md:px-10 pb-20">
        {/* VIEW 1: CATALOGUE */}
        {view === 'CATALOGUE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {catalogues.map(cat => (
              <div key={cat.id} onClick={() => navigate('GRID', cat)} 
                   className="h-96 border border-white/10 rounded-[40px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group">
                <h2 className="text-3xl font-black tracking-[0.4em] uppercase group-hover:text-pink-500 transition-colors">{cat.name}</h2>
                <div className="mt-4 h-[1px] w-12 bg-pink-500 transition-all group-hover:w-24" />
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: GRID */}
        {view === 'GRID' && (
          <div className="max-w-7xl mx-auto">
            <button onClick={() => window.history.back()} className="mb-10 text-[10px] font-black opacity-40 hover:opacity-100 uppercase tracking-widest flex items-center gap-2">
              ← Return
            </button>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {activeCat?.products?.map((p: any) => (
                <div key={p.id} onClick={() => navigate('DETAIL', activeCat, p)} className="cursor-pointer group text-center">
                  <div className="aspect-[4/5] flex items-center justify-center transition-all group-hover:scale-105">
                    <img src={p.image_url} className="max-h-full object-contain drop-shadow-2xl" />
                  </div>
                  <h3 className="mt-8 text-[11px] font-black uppercase tracking-widest">{p.name}</h3>
                  <p className="text-pink-500 font-bold mt-2 text-sm">£{p.price}.00</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: DETAIL */}
        {view === 'DETAIL' && selectedProduct && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-start">
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center justify-center min-h-[400px] lg:min-h-[600px]">
                <img src={activeImage} className="w-full max-h-[70vh] object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.7)]" />
              </div>
              <div className="flex justify-center gap-4">
                 {selectedProduct.variants?.map((v: any, idx: number) => (
                   <img key={idx} src={v.url} onClick={() => setActiveImage(v.url)} 
                        className={`w-20 h-24 object-contain cursor-pointer border p-1 transition-all ${activeImage === v.url ? 'border-pink-500 bg-white/5' : 'border-transparent opacity-50'}`} />
                 ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-12 lg:pt-10">
              <header className="space-y-4">
                <h1 className="text-6xl lg:text-7xl font-black uppercase tracking-tighter italic">{selectedProduct.name}</h1>
                <p className="text-4xl font-bold tracking-tight">£{selectedProduct.price}.00</p>
              </header>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">Active Style: {selectedColor}</p>
                <div className="flex gap-2">
                  {selectedProduct.variants?.map((v: any) => (
                    <button key={v.color} onClick={() => {setActiveImage(v.url); setSelectedColor(v.color);}} 
                            className={`w-14 h-14 border-2 p-1 transition-all ${selectedColor === v.color ? 'border-pink-500' : 'border-white/10 opacity-40'}`}>
                      <img src={v.url} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-pink-500 tracking-[0.3em] uppercase">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} 
                            className={`w-16 h-16 border flex items-center justify-center text-[12px] font-black transition-all relative ${selectedSize === s ? 'border-pink-500 bg-pink-500 text-black' : 'border-white/10 text-white/40 hover:border-white'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={addToBag} className="w-full py-6 bg-white text-black font-black text-[14px] tracking-[0.4em] hover:bg-pink-500 transition-all uppercase">
                Add to Bag
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setShowPaymentModal(false)} />
          <div className="relative w-full max-w-md bg-black border border-white/10 p-10 rounded-3xl">
            <h2 className="text-2xl font-black uppercase italic mb-8">Payment Details</h2>
            {paymentMethod === 'NONE' && (
              <div className="space-y-4">
                <button onClick={() => setPaymentMethod('MPESA')} className="w-full p-6 border border-white/10 rounded-2xl flex justify-between items-center hover:bg-green-600 transition-all group">
                  <span className="font-bold">M-PESA</span>
                </button>
                <button onClick={() => setPaymentMethod('VISA')} className="w-full p-6 border border-white/10 rounded-2xl flex justify-between items-center hover:bg-white hover:text-black transition-all">
                  <span className="font-bold">CARD / VISA</span>
                </button>
              </div>
            )}
            {paymentMethod === 'MPESA' && (
              <div className="space-y-6">
                <input type="text" placeholder="PHONE NUMBER" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none"
                       value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                <button onClick={submitOrder} disabled={isProcessing} className="w-full py-4 bg-green-600 text-white font-black uppercase rounded-xl">
                  {isProcessing ? "PROCESSING..." : "CONFIRM & PAY"}
                </button>
              </div>
            )}
            <button onClick={() => setPaymentMethod('NONE')} className="w-full mt-6 text-[10px] opacity-40 uppercase font-black">Back</button>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-black border-l border-white/10 h-full p-10 flex flex-col">
            <h2 className="text-[14px] font-black tracking-[0.5em] uppercase italic mb-10">Current Bag</h2>
            <div className="flex-1 overflow-y-auto space-y-6">
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-4 items-center border-b border-white/5 pb-4">
                  <img src={item.activeImage} className="w-16 h-20 object-contain" />
                  <div className="flex-1 text-[10px] font-black uppercase">
                    <p>{item.name}</p>
                    <p className="text-pink-500">{item.selectedSize}</p>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-[8px] opacity-30 hover:opacity-100 mt-1">REMOVE</button>
                  </div>
                  <p className="font-bold">£{item.price}</p>
                </div>
              ))}
            </div>
            <div className="pt-10 space-y-4">
              <div className="flex justify-between font-black text-xl border-t border-white/10 pt-4">
                <span>TOTAL</span>
                <span>£{cart.reduce((acc, curr) => acc + Number(curr.price), 0)}</span>
              </div>
              <button onClick={() => setShowPaymentModal(true)} className="w-full py-5 bg-pink-500 text-black font-black tracking-widest uppercase hover:bg-white transition-all">
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}