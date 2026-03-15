'use client';
import { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const logoutStatus = searchParams.get('logout');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Authenticate via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert("ACCESS_DENIED: " + error.message);
      setLoading(false);
    } else if (data.user) {
      // Set the exact cookie the middleware is looking for
      document.cookie = "vlk_admin_key=authenticated; path=/; max-age=86400; SameSite=Lax";
      
      // Use a hard redirect to ensure the browser registers the new cookie
      window.location.href = '/admin';
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-black border border-white/10 p-10 shadow-[0_0_50px_rgba(220,38,38,0.1)] rounded-[40px] backdrop-blur-xl">
        
        {/* LOGO ADDED HERE */}
        <div className="flex flex-col items-center mb-10">
          <img src="/logo1.png" alt="VLK" className="h-10 mb-6" />
          <h1 className="text-white text-3xl font-black italic tracking-tighter uppercase text-center">Admin Access</h1>
          <p className="text-red-600 text-[10px] tracking-[0.4em] uppercase font-bold mt-2 opacity-80 text-center text-pretty">Secure Terminal</p>
        </div>
        
        {logoutStatus === 'success' && (
          <p className="text-red-600 text-[9px] mb-6 text-center uppercase font-black tracking-widest py-3 bg-red-600/5 border border-red-600/20 rounded-xl">Session Terminated</p>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase opacity-40 ml-1">Identity</label>
            <input 
              type="email" placeholder="EMAIL_ADDRESS" 
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none text-white text-xs focus:border-red-600 transition-all" 
              onChange={(e) => setEmail(e.target.value)} required 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase opacity-40 ml-1">Access Key</label>
            <input 
              type="password" placeholder="••••••••" 
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none text-white text-xs focus:border-red-600 transition-all" 
              onChange={(e) => setPassword(e.target.value)} required 
            />
          </div>

          <button 
            disabled={loading} 
            className="w-full py-5 bg-red-600 text-white text-xs font-black tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all rounded-2xl mt-4"
          >
            {loading ? 'Authenticating...' : 'Establish Connection'}
          </button>
        </form>
        
        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">VLK² Proprietary System</p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen" />}>
      <LoginContent />
    </Suspense>
  );
}