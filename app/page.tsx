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

  // 2. BROWSER NAVIGATION LOGIC
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

  // Helper Component for Content Pages
  const ContentPage = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="max-w-4xl mx-auto pt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-5xl font-black italic uppercase tracking-tighter text-pink-500 mb-8 border-b border-white/10 pb-4">{title}</h1>
      <div className="text-lg leading-relaxed text-white/80 space-y-6 font-medium">
        {children}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen text-white relative overflow-x-hidden font-sans">
      {/* PERSISTENT BACKGROUND VIDEO */}
      <div className="fixed inset-0 -z-30 bg-black" />
      <video src={bgVideo || "/hero-bg.mp4"} autoPlay loop muted playsInline 
             className="fixed inset-0 -z-20 w-full h-full object-cover opacity-30 grayscale pointer-events-none" />
      
      {/* PRODUCT PAGE BACKGROUND IMAGE (Image 2 Style) */}
      {(view === 'GRID' || view === 'DETAIL') && (
        <div 
          className="fixed inset-0 -z-10 opacity-40 grayscale bg-cover bg-center pointer-events-none transition-opacity duration-1000"
          style={{ backgroundImage: "url('https://vlk-lukks-assets.s3.amazonaws.com/image_3fe0f4.jpg')" }} 
        />
      )}

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
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
        <div className="relative w-80 h-full bg-black border-r border-white/10 p-10 flex flex-col justify-center space-y-6">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 text-[10px] font-black opacity-40 uppercase">Close</button>
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
              className="text-2xl font-black uppercase italic text-left hover:text-pink-500 transition-all hover:pl-2"
            >
              {item.label}
            </button>
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
              <div key={cat.id} onClick={() => navigate('GRID', cat)} className="h-96 border border-white/10 rounded-3xl flex items-center justify-center cursor-pointer hover:bg-white/5 transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                <h2 className="text-3xl font-black uppercase tracking-widest group-hover:text-pink-500 z-10 transition-colors">{cat.name}</h2>
              </div>
            ))}
          </div>
        )}

        {view === 'GRID' && (
          <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-3 gap-10">
            {activeCat?.products?.map((p: any) => (
              <div key={p.id} onClick={() => navigate('DETAIL', activeCat, p)} className="cursor-pointer group text-center bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <img src={p.image_url} className="aspect-[3/4] object-contain mb-4 group-hover:scale-105 transition-transform" />
                <h3 className="font-black uppercase text-[10px] tracking-widest">{p.name}</h3>
                <p className="text-pink-500 font-bold mt-2">£{p.price}.00</p>
              </div>
            ))}
          </div>
        )}

        {view === 'DETAIL' && selectedProduct && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 bg-black/60 p-10 rounded-[40px] border border-white/10 backdrop-blur-xl">
            <img src={activeImage} className="w-full h-auto object-contain rounded-3xl" />
            <div className="space-y-8">
              <h1 className="text-6xl font-black uppercase italic tracking-tighter">{selectedProduct.name}</h1>
              <p className="text-3xl font-bold text-pink-500">£{selectedProduct.price}.00</p>
              <div className="space-y-4">
                <p className="text-xs font-black uppercase opacity-50">Select Size</p>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`w-12 h-12 border font-black transition-all ${selectedSize === s ? 'bg-pink-500 text-black border-pink-500' : 'border-white/20 hover:border-white'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <button onClick={addToBag} className="w-full py-5 bg-white text-black font-black uppercase tracking-widest hover:bg-pink-500 transition-all">Add to Bag</button>
            </div>
          </div>
        )}

        {/* POLICY VIEWS - NOW ACTIVE */}
        {view === 'SUSTAINABILITY' && (
          <ContentPage title="Sustainability">
            <p>At VLKLUKKS², sustainability is not an option; it is our foundation. We believe in high-utility fashion that lasts generations, not seasons.</p>
            <p>Our fabrics are sourced from 100% recycled cotton fleece and organic textiles. We operate on a zero-waste policy, ensuring every scrap of material is repurposed into our accessories line.</p>
          </ContentPage>
        )}

        {view === 'SIZE_GUIDE' && (
          <ContentPage title="Size Guide">
            <p>Our fit is designed for an "Urban Oversized" aesthetic. If you prefer a regular fit, we recommend sizing down.</p>
            <div className="grid grid-cols-2 gap-4 border border-white/10 p-6 mt-4">
              <div className="font-black opacity-50">SIZE</div><div className="font-black opacity-50">CHEST (IN)</div>
              <div>S</div><div>36 - 38</div>
              <div>M</div><div>38 - 40</div>
              <div>L</div><div>40 - 42</div>
              <div>XL</div><div>42 - 44</div>
            </div>
          </ContentPage>
        )}

        {view === 'FOUNDATION' && (
          <ContentPage title="Foundation">
            <p>The VLK² Foundation supports underground digital artists and urban photographers in emerging cities.</p>
            <p>A percentage of every sale goes directly into our grant program, providing equipment and exhibition space for creators who are shaping the new visual world.</p>
          </ContentPage>
        )}

        {view === 'SHIPMENT' && (
          <ContentPage title="Shipment Policy">
            <p>We ship globally. Orders are processed within 48 hours of acquisition. Once shipped, you will receive an encrypted tracking code via SMS/Email.</p>
            <p>Standard Shipping: 5-7 Business Days. Express: 24-48 Hours.</p>
          </ContentPage>
        )}
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setShowPaymentModal(false)} />
          <div className="relative w-full max-w-lg bg-black border border-white/10 p-8 rounded-3xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-black uppercase italic mb-6">Secure Checkout</h2>
            <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
              {['MPESA_STK', 'MPESA_PAYBILL', 'VISA'].map((m) => (
                <button key={m} onClick={() => setPaymentMethod(m as any)} className={`text-[10px] font-black px-4 py-2 rounded-full border ${paymentMethod === m ? 'bg-pink-500 text-black border-pink-500' : 'border-white/10 opacity-50'}`}>
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
            {paymentMethod === 'MPESA_STK' && (
              <div className="space-y-4">
                <input type="text" placeholder="2547..." className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-pink-500" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                <button onClick={submitOrder} className="w-full py-4 bg-green-600 font-black uppercase rounded-xl">Send STK Prompt</button>
              </div>
            )}
            {paymentMethod === 'MPESA_PAYBILL' && (
              <div className="space-y-4 text-center p-6 bg-white/5 rounded-2xl">
                <p className="text-xs font-black text-pink-500 uppercase">Paybill: 0795151303 | Account: 247247</p>
                <button onClick={submitOrder} className="w-full py-4 bg-white text-black font-black uppercase rounded-xl mt-4">Confirm Payment</button>
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
            <h2 className="font-black uppercase tracking-widest mb-10 text-pink-500">Your Bag</h2>
            <div className="flex-1 overflow-y-auto space-y-6">
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-4 items-center border-b border-white/5 pb-4">
                  <img src={item.activeImage} className="w-16 h-20 object-cover rounded" />
                  <div className="flex-1 text-[10px] font-black uppercase">
                    <p>{item.name}</p>
                    <p className="text-pink-500">{item.selectedSize}</p>
                  </div>
                  <p className="font-bold">£{item.price}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setShowPaymentModal(true)} className="w-full py-5 bg-pink-500 text-black font-black uppercase mt-4 hover:bg-white transition-all">Proceed to Payment</button>
          </div>
        </div>
      )}
    </main>
  );
}