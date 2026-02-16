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
    <main className="min-h-screen bg-black flex items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full bg-[#050505] border border-[#a67c52]/20 p-10 shadow-2xl">
        <h1 className="text-white text-2xl font-black tracking-[0.5em] uppercase mb-2 text-center">VLK²</h1>
        <p className="text-[#a67c52] text-[8px] tracking-[0.3em] uppercase mb-8 text-center opacity-40">System Authentication</p>
        
        {logoutStatus === 'success' && (
          <p className="text-green-500 text-[9px] mb-6 text-center uppercase tracking-widest py-2 bg-green-500/5 border border-green-500/20">Session Terminated</p>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="email" placeholder="IDENTITY_EMAIL" 
            className="w-full bg-transparent border-b border-white/10 py-3 outline-none text-white text-[10px] focus:border-[#a67c52]" 
            onChange={(e) => setEmail(e.target.value)} required 
          />
          <input 
            type="password" placeholder="ACCESS_KEY" 
            className="w-full bg-transparent border-b border-white/10 py-3 outline-none text-white text-[10px] focus:border-[#a67c52]" 
            onChange={(e) => setPassword(e.target.value)} required 
          />
          <button disabled={loading} className="w-full py-4 bg-[#a67c52] text-black text-[10px] font-black tracking-[0.3em] uppercase hover:bg-white transition-all">
            {loading ? 'AUTHENTICATING...' : 'ESTABLISH_CONNECTION'}
          </button>
        </form>
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