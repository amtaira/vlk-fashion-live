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
  const [isProcessing, setIsProcessing] = useState(false);

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
    if (prod) {
      setActiveImage(prod.image_url);
      setSelectedColor(prod.variants?.[0]?.color || 'OG');
    }
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
      const newItem = { ...selectedProduct, selectedSize, activeImage, selectedColor, quantity: 1, cartId: Math.random() };
      setCart([...cart, newItem]);
    }
    setSelectedSize('');
    setIsCartOpen(true);
  };

  const submitOrder = async () => {
    setIsProcessing(true);
    const { error } = await supabase.from('orders').insert([{
      items: cart,
      total: cart.reduce((acc, curr) => acc + (Number(curr.price) * curr.quantity), 0),
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
      <div className="fixed inset-0 -z-30 bg-black" />
      
      <video 
        src={bgVideo || "/hero-bg.mp4"} 
        autoPlay loop muted playsInline 
        className="fixed inset-0 -z-25 w-full h-full object-cover opacity-60 pointer-events-none" 
      />

      {/* NAV */}
      <nav className="fixed top-0 w-full z-[100] px-6 py-8 flex justify-between items-center mix-blend-difference">
        <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-4 group cursor-pointer">
          <div className="space-y-1.5"><div className="w-6 h-0.5 bg-white"/><div className="w-4 h-0.5 bg-white"/></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Menu</span>
        </button>
        <img src="/logo1.png" alt="VLK" className="h-8 cursor-pointer" onClick={() => navigate('HOME')} />
        <button onClick={() => setIsCartOpen(true)} className="relative cursor-pointer">
          <span className="bg-red-600 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold">
            {cart.reduce((a, b) => a + b.quantity, 0)}
          </span>
        </button>
      </nav>

      {/* STYLED MENU SECTION (RESTORED) */}
      <div className={`fixed inset-0 z-[150] transition-opacity duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
        <div className={`relative w-80 h-full bg-black/40 backdrop-blur-xl border-r border-white/10 p-10 flex flex-col justify-center space-y-8 transition-transform duration-500 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 text-[10px] font-black opacity-40 uppercase hover:opacity-100 transition-opacity cursor-pointer">Close</button>
          {[
            { id: 'CATALOGUE', label: 'Products' },
            { id: 'SIZE_GUIDE', label: 'Size Guide' },
            { id: 'SUSTAINABILITY', label: 'Sustainability' },
            { id: 'FOUNDATION', label: 'Foundation' },
            { id: 'SHIPMENT', label: 'Shipment Policy' },
            { id: 'COOKIE', label: 'Cookie Policy' }
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => navigate(item.id as ViewState)} 
              className="group text-2xl font-black uppercase italic text-left transition-all relative overflow-hidden cursor-pointer"
            >
              <span className="relative z-10 group-hover:text-red-600 transition-colors">{item.label}</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        {view === 'HOME' && (
          <div className="flex flex-col items-center space-y-2 w-full max-w-2xl transform -translate-y-10">
            <img src="/visual lukks.png" alt="Visual Lukks" className="w-full h-auto object-contain animate-pulse" />
            <button onClick={() => navigate('CATALOGUE')} className="px-12 py-4 border border-white hover:bg-red-600 hover:border-red-600 transition-all uppercase font-black text-xs tracking-[0.4em] cursor-pointer">
              Shop With Us
            </button>
          </div>
        )}

        {view === 'CATALOGUE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl mt-20">
            {catalogues.map(cat => (
              <div key={cat.id} onClick={() => navigate('GRID', cat)} className="h-96 border border-white/10 rounded-3xl flex items-center justify-center cursor-pointer hover:bg-white/5 relative group overflow-hidden">
                <h2 className="text-3xl font-black uppercase group-hover:text-red-600 transition-colors z-10">{cat.name}</h2>
              </div>
            ))}
          </div>
        )}

        {view === 'GRID' && (
          <div className="max-w-6xl w-full grid grid-cols-2 lg:grid-cols-3 gap-10 mt-20">
            {activeCat?.products?.map((p: any) => (
              <div key={p.id} onClick={() => navigate('DETAIL', activeCat, p)} className="cursor-pointer bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <img src={p.image_url} className="aspect-[3/4] object-contain mb-4" />
                <h3 className="font-black uppercase text-[10px] tracking-widest">{p.name}</h3>
                <p className="text-red-600 font-bold">£{p.price}.00</p>
              </div>
            ))}
          </div>
        )}

        {view === 'DETAIL' && selectedProduct && (
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 bg-black/60 p-10 rounded-[40px] border border-white/10 backdrop-blur-xl mt-20">
            <img src={activeImage} className="w-full h-auto object-contain rounded-3xl" />
            <div className="space-y-8">
              <h1 className="text-6xl font-black uppercase italic tracking-tighter">{selectedProduct.name}</h1>
              <p className="text-3xl font-bold text-red-600">£{selectedProduct.price}.00</p>
              <div className="flex gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)} className={`w-12 h-12 border font-black cursor-pointer ${selectedSize === s ? 'bg-red-600 border-red-600' : 'border-white/20'}`}>{s}</button>
                ))}
              </div>
              <button onClick={addToBag} className="w-full py-5 bg-white text-black font-black uppercase cursor-pointer">Add to Bag</button>
            </div>
          </div>
        )}
      </div>

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/80" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-black border-l border-white/10 h-full p-8 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-black uppercase text-red-600">Your Bag</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-[10px] uppercase opacity-50 cursor-pointer">Continue Shopping</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6">
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-4 items-center border-b border-white/5 pb-4">
                  <img src={item.activeImage} className="w-16 h-20 object-cover" />
                  <div className="flex-1 text-[10px] font-black uppercase">
                    <p>{item.name}</p>
                    <p className="text-red-600">{item.selectedSize}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQuantity(item.cartId, -1)} className="w-5 h-5 border border-white/20 flex items-center justify-center cursor-pointer">-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartId, 1)} className="w-5 h-5 border border-white/20 flex items-center justify-center cursor-pointer">+</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold mb-2">£{item.price * item.quantity}</p>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-600 text-[10px] cursor-pointer">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-white/10">
              <div className="flex justify-between font-black uppercase mb-4">
                <span>Total</span>
                <span>£{cart.reduce((a, b) => a + (b.price * b.quantity), 0)}</span>
              </div>
              <button onClick={() => { setShowPaymentModal(true); setIsCartOpen(false); }} className="w-full py-5 bg-red-600 font-black uppercase cursor-pointer">Proceed to Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setShowPaymentModal(false)} />
          <div className="relative w-full max-w-lg bg-black border border-white/10 p-8 rounded-3xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black uppercase italic">Checkout</h2>
              <button onClick={() => { setShowPaymentModal(false); setIsCartOpen(true); }} className="text-red-600 text-[10px] font-black uppercase underline cursor-pointer">Back to Bag</button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
              {['MPESA_STK', 'MPESA_PAYBILL', 'VISA'].map((m) => (
                <button key={m} onClick={() => setPaymentMethod(m as any)} className={`text-[10px] font-black px-4 py-2 rounded-full border cursor-pointer ${paymentMethod === m ? 'bg-red-600 border-red-600' : 'border-white/10 opacity-50'}`}>
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>

            {paymentMethod === 'MPESA_STK' && (
              <div className="space-y-4">
                <input type="text" placeholder="2547XXXXXXXX" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                <button onClick={submitOrder} className="w-full py-4 bg-red-600 text-white font-black uppercase rounded-xl cursor-pointer">Send Prompt</button>
              </div>
            )}

            {paymentMethod === 'MPESA_PAYBILL' && (
              <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="opacity-60 uppercase text-xs">Business No</span><span className="font-black text-red-600">247247</span></div>
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="opacity-60 uppercase text-xs">Account No</span><span className="font-black text-red-600">0795151303</span></div>
                <button onClick={submitOrder} className="w-full py-4 bg-red-600 mt-4 font-black uppercase cursor-pointer">Confirm Payment</button>
              </div>
            )}

            {paymentMethod === 'VISA' && (
              <div className="space-y-4">
                <input type="text" placeholder="CARD NUMBER" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl" />
                <div className="flex gap-4">
                  <input type="text" placeholder="MM/YY" className="w-1/2 bg-white/5 border border-white/10 p-4 rounded-xl" />
                  <input type="text" placeholder="CVC" className="w-1/2 bg-white/5 border border-white/10 p-4 rounded-xl" />
                </div>
                <button onClick={submitOrder} className="w-full py-4 bg-red-600 font-black uppercase rounded-xl cursor-pointer">Pay with Visa</button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}