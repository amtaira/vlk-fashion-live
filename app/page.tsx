{/* FULL-SCREEN PRODUCT PAGE OVERLAY */}
{selectedProduct && (
  <div className="fixed inset-0 z-[150] bg-black text-[#D4AF37] font-mono flex overflow-hidden">
    
    {/* LEFT SIDEBAR: CATEGORIES */}
    <div className="hidden lg:flex flex-col w-64 p-10 space-y-4 text-[11px] font-bold uppercase tracking-widest border-r border-white/5">
      <div className="mb-12 cursor-pointer" onClick={() => setSelectedProduct(null)}>
        <img src="/logo-white.png" className="w-32 invert" alt="Logo" /> 
      </div>
      {['NEW', 'COMBOS', 'T-SHIRTS', 'TOPS / JERSEYS', 'SWEATSHIRTS', 'JACKETS', 'KNITWEAR', 'BOTTOMS', 'SHORTS'].map(cat => (
        <button key={cat} className="text-left hover:text-white transition-colors">{cat}</button>
      ))}
    </div>

    {/* CENTER: PRODUCT VIEWER */}
    <div className="flex-1 flex flex-col items-center justify-center relative p-6">
      <div className="w-full max-w-2xl aspect-square flex items-center justify-center relative">
        <img 
          key={activeImage}
          src={activeImage} 
          className="max-h-full w-auto object-contain animate-in fade-in zoom-in-95 duration-500"
          alt="Main Product"
        />
        {/* Detail Thumbnails below main image */}
        <div className="absolute bottom-[-80px] flex gap-4">
           <img src={activeImage} className="w-16 h-16 object-cover border border-[#D4AF37]" />
           {/* Add more detail views here if available in your DB */}
        </div>
      </div>
    </div>

    {/* RIGHT SIDE: PRODUCT DETAILS */}
    <div className="w-full lg:w-[450px] p-10 flex flex-col justify-start space-y-10 overflow-y-auto bg-black">
      
      {/* HEADER */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold uppercase tracking-tighter leading-tight text-white">
          {selectedProduct.name} <br/>
          <span className="text-[#D4AF37] opacity-80">[{selectedColor}]</span>
        </h1>
        <p className="text-2xl font-bold">${selectedProduct.price}.00</p>
      </div>

      {/* COLOUR GRID (Exactly as marking) */}
      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">COLOUR</p>
        <div className="grid grid-cols-5 gap-1">
          {selectedProduct.variants?.map((v: any) => (
            <button 
              key={v.color} 
              onClick={() => { setSelectedColor(v.color); setActiveImage(v.url); }} 
              className={`aspect-square border transition-all ${
                selectedColor === v.color 
                ? 'border-[#D4AF37] scale-100' 
                : 'border-white/10 opacity-40 hover:opacity-100'
              }`}
            >
              <img src={v.url} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* SIZE GRID (Diagonal strikethrough style) */}
      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">SIZE</p>
        <div className="grid grid-cols-5 border border-white/10">
          {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
            <button 
              key={s} 
              onClick={() => setSelectedSize(s)} 
              className={`h-14 flex items-center justify-center text-[11px] font-black border-r last:border-r-0 border-white/10 transition-all relative overflow-hidden ${
                selectedSize === s 
                ? 'bg-[#D4AF37] text-black' 
                : 'hover:bg-white/5'
              }`}
            >
              {/* Optional: Add a diagonal line if "sold out" logic is needed later */}
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* BUY BUTTON */}
      <button 
        onClick={addToCart}
        className="w-full py-5 border border-red-900/50 text-red-600 font-black uppercase tracking-[0.4em] text-[12px] hover:bg-red-900 hover:text-white transition-all"
      >
        {selectedSize ? 'ADD TO ARCHIVE' : 'SELECT SIZE'}
      </button>

      {/* PRODUCT SPECS LIST */}
      <div className="text-[10px] space-y-2 uppercase tracking-widest leading-relaxed opacity-80 border-t border-white/5 pt-8">
         <p>• 440GSM 100% COTTON FLEECE.</p>
         <p>• PUFF PRINT LOGO ON CHEST.</p>
         <p>• YKK METAL TWO-WAY ZIPPER.</p>
         <p className="text-red-500 font-bold">• TRUE TO SIZE - BOXY RELAXED FIT.</p>
         <div className="pt-4 space-y-1 underline">
            <p className="cursor-pointer">SIZE GUIDE</p>
            <p className="cursor-pointer">SHIPPING POLICY</p>
         </div>
      </div>
    </div>
  </div>
)}