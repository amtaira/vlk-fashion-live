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
  const [paymentMethod, setPaymentMethod] = useState<'NONE' | 'MPESA' | 'VISA'>('NONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToBag = () => {
    if (!selectedSize) return alert("SELECT SIZE");
    const newItem = { ...selectedProduct, selectedSize, activeImage, selectedColor, cartId: Math.random() };
    setCart([...cart, newItem]);
    setSelectedSize('');
    setIsCartOpen(true);
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
      alert("VLK²: Order Confirmed.");
      setCart([]);
      setShowPaymentModal(false);
      setIsCartOpen(false);
    }
    setIsProcessing(false);
  };

  // Content Components for the various views
  const InfoView = ({ title, content }: { title: string, content: React.ReactNode }) => (
    <div className="max-w-3xl mx-auto pt-20 animate-fade-in">
      <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-10 text-pink-500">{title}</h1>
      <div className="text-white/70 space-y-6 text-sm leading-relaxed tracking-wide font-light">
        {content}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen text-white relative overflow-x-hidden font-sans">
      {/* BACKGROUND VIDEO (Black Planet Style) */}
      <div className="fixed inset-0 -z-20 bg-black" />
      <video src={bgVideo || "/placeholder-bg.mp4"} autoPlay loop muted playsInline 
             className="fixed inset-0 -z-10 w-full h-full object-cover opacity-40 grayscale" />

      {/* HEADER */}
      <nav className="fixed top-0 w-full z-[100] px-6 py-8 flex justify-between items-center mix-blend-difference">
        <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-4 group">
          <div className="space-y-1.5">
            <div className="w-6 h-0.5 bg-white group-hover:bg-pink-500 transition-all" />
            <div className="w-4 h-0.5 bg-white group-hover:bg-pink-500 transition-all" />
          </div>
          <span className="text-[10px] font-black tracking-[0.3em] uppercase">Menu</span>
        </button>

        <div className="font-black text-2xl tracking-tighter cursor-pointer" onClick={() => navigate('HOME')}>VLKLUKKS²</div>
        
        <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 group">
          <span className="bg-white text-black text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold group-hover:bg-pink-500 transition-colors">
            {cart.length}
          </span>
        </button>
      </nav>

      {/* LEFT TOGGLE MENU */}
      <div className={`fixed inset-0 z-[150] transition-all duration-700 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsMenuOpen(false)} />
        <div className="relative w-full max-w-sm h-full bg-black border-r border-white/10 p-12 flex flex-col justify-center space-y-6">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 opacity-40 hover:opacity-100 uppercase text-[10px] font-black tracking-widest">Close</button>
          
          {[
            { label: 'Products', view: 'CATALOGUE' },
            { label: 'SignUp', view: 'SIGNUP' },
            { label: 'Size Guide', view: 'SIZE_GUIDE' },
            { label: 'Sustainability', view: 'SUSTAINABILITY' },
            { label: 'Foundation', view: 'FOUNDATION' },
            { label: 'Shipment Policy', view: 'SHIPMENT' },
            { label: 'Cookie Policy', view: 'COOKIE' }
          ].map((item) => (
            <button key={item.label} onClick={() => navigate(item.view as ViewState)} 
                    className="text-3xl font-black uppercase italic tracking-tighter text-left hover:text-pink-500 hover:pl-4 transition-all duration-300">
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="pt-32 px-6 md:px-10 pb-20 relative z-10">
        
        {view === 'HOME' && (
          <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-8">
            <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter animate-pulse">VLKLUKKS</h1>
            <button onClick={() => navigate('CATALOGUE')} className="px-12 py-4 border border-white hover:bg-white hover:text-black transition-all font-black uppercase tracking-[0.5em] text-xs">
              Enter Shop
            </button>
          </div>
        )}

        {view === 'CATALOGUE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {catalogues.map(cat => (
              <div key={cat.id} onClick={() => navigate('GRID', cat)} 
                   className="h-[500px] border border-white/10 rounded-[40px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group overflow-hidden relative">
                <h2 className="text-4xl font-black tracking-[0.4em] uppercase z-10">{cat.name}</h2>
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
              </div>
            ))}
          </div>
        )}

        {view === 'GRID' && (
           <div className="max-w-7xl mx-auto">
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
               {activeCat?.products?.map((p: any) => (
                 <div key={p.id} onClick={() => navigate('DETAIL', activeCat, p)} className="cursor-pointer group">
                   <div className="aspect-[3/4] overflow-hidden bg-white/5 rounded-2xl flex items-center justify-center">
                     <img src={p.image_url} className="w-full h-full object-cover transition-all group-hover:scale-110" />
                   </div>
                   <h3 className="mt-6 text-[11px] font-black uppercase tracking-widest">{p.name}</h3>
                   <p className="text-pink-500 font-bold mt-1">£{p.price}.00</p>
                 </div>
               ))}
             </div>
           </div>
        )}

        {view === 'DETAIL' && selectedProduct && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-4">
               <img src={activeImage} className="w-full rounded-3xl" />
               <div className="flex gap-4">
                 {selectedProduct.variants?.map((v: any, idx: number) => (
                   <img key={idx} src={v.url} onClick={() => setActiveImage(v.url)} className={`w-20 h-24 object-cover cursor-pointer rounded-lg border ${activeImage === v.url ? 'border-pink-500' : 'border-transparent'}`} />
                 ))}
               </div>
            </div>
            <div className="space-y-10">
              <h1 className="text-6xl font-black uppercase italic tracking-tighter">{selectedProduct.name}</h1>
              <p className="text-3xl font-light opacity-80">£{selectedProduct.price}.00</p>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-pink-500">Size Selection</p>
                <div className="flex gap-3">
                  {['S', 'M', 'L', 'XL'].map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`w-14 h-14 border ${selectedSize === s ? 'bg-white text-black' : 'border-white/20'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <button onClick={addToBag} className="w-full py-6 bg-pink-500 text-black font-black uppercase tracking-widest hover:bg-white transition-all">Add to Bag</button>
            </div>
          </div>
        )}

        {/* POLICY VIEWS */}
        {view === 'SUSTAINABILITY' && (
          <InfoView title="Sustainability" content={
            <>
              <p>VLKLUKKS² is committed to a circular future. Our garments are produced in limited quantities to eliminate deadstock waste.</p>
              <p>Every piece uses 100% organic cotton or recycled synthetics sourced from ethical manufacturers in Europe and Africa.</p>
            </>
          } />
        )}

        {view === 'SIZE_GUIDE' && (
          <InfoView title="Size Guide" content={
            <div className="grid grid-cols-2 gap-4 border border-white/10 p-6 uppercase text-[10px] font-bold">
              <div className="opacity-40">Size</div><div className="opacity-40">Chest (CM)</div>
              <div>Small</div><div>90-95</div>
              <div>Medium</div><div>96-101</div>
              <div>Large</div><div>102-107</div>
              <div>XL</div><div>108-114</div>
            </div>
          } />
        )}

        {view === 'SHIPMENT' && (
          <InfoView title="Shipment Policy" content={
            <p>Global fulfillment via VLK Logistics. Standard shipping: 3-5 business days. Express shipping: 24-48 hours. Tracking provided via encrypted SMS.</p>
          } />
        )}

        {view === 'FOUNDATION' && (
          <InfoView title="Foundation" content={
            <p>10% of every VLKLUKKS acquisition is funneled into the VLK Foundation, supporting urban development and youth creative programs in developing tech hubs.</p>
          } />
        )}

      </div>

      {/* CART DRAWER (Kept same logic as before) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-black border-l border-white/10 h-full p-10 flex flex-col">
            <h2 className="text-[14px] font-black tracking-[0.5em] uppercase italic mb-10">Current Bag</h2>
            <div className="flex-1 overflow-y-auto space-y-6">
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-4 items-center border-b border-white/5 pb-4">
                  <img src={item.activeImage} className="w-16 h-20 object-cover rounded" />
                  <div className="flex-1 text-[10px] font-black uppercase">
                    <p>{item.name}</p>
                    <p className="text-pink-500">{item.selectedSize}</p>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-[8px] opacity-30 mt-1">REMOVE</button>
                  </div>
                  <p className="font-bold">£{item.price}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setShowPaymentModal(true)} className="w-full py-5 bg-white text-black font-black uppercase tracking-widest mt-4">Checkout</button>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL (Same logic as before) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setShowPaymentModal(false)} />
          <div className="relative w-full max-w-md bg-black border border-white/10 p-10 rounded-3xl">
             <h2 className="text-2xl font-black uppercase italic mb-8">Select Payment</h2>
             <div className="space-y-4">
               <button onClick={() => setPaymentMethod('MPESA')} className="w-full p-6 border border-white/10 rounded-2xl flex justify-between items-center hover:bg-green-600">
                 <span className="font-bold uppercase tracking-widest">M-Pesa</span>
               </button>
               {paymentMethod === 'MPESA' && (
                 <div className="space-y-4 pt-4">
                   <input type="text" placeholder="PHONE NUMBER" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                   <button onClick={submitOrder} className="w-full py-4 bg-white text-black font-black uppercase">{isProcessing ? 'Wait...' : 'Confirm'}</button>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

    </main>
  );
}