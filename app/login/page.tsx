'use client';
import { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

// 1. Logic component that uses searchParams
function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const logoutStatus = searchParams.get('logout');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simple logic: if you're using custom admin keys or Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert("ACCESS_DENIED: " + error.message);
    } else {
      // Set a simple cookie for your admin middleware
      document.cookie = "vlk_admin_key=authenticated; path=/; max-age=86400";
      router.push('/admin');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md w-full bg-[#050505] border border-[#a67c52]/20 p-10 shadow-2xl">
      <h1 className="text-white text-2xl font-black tracking-[0.5em] uppercase mb-2 text-center">VLK²</h1>
      <p className="text-[#a67c52] text-[8px] tracking-[0.3em] uppercase mb-8 text-center opacity-40">System Authentication</p>
      
      {logoutStatus === 'success' && (
        <p className="text-green-500 text-[9px] mb-6 text-center uppercase tracking-widest border border-green-500/20 py-2 bg-green-500/5">Session Terminated Successfully</p>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <input 
          type="email" 
          placeholder="IDENTITY_EMAIL" 
          className="w-full bg-transparent border-b border-white/10 py-3 outline-none text-white text-[10px] focus:border-[#a67c52] transition-colors" 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="ACCESS_KEY" 
          className="w-full bg-transparent border-b border-white/10 py-3 outline-none text-white text-[10px] focus:border-[#a67c52] transition-colors" 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button 
          disabled={loading} 
          className="w-full py-4 bg-[#a67c52] text-black text-[10px] font-black tracking-[0.3em] uppercase hover:bg-white transition-all mt-4"
        >
          {loading ? 'AUTHENTICATING...' : 'ESTABLISH_CONNECTION'}
        </button>
      </form>
    </div>
  );
}

// 2. Main Page component that provides the Suspense Boundary
export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6 font-mono">
      <Suspense fallback={<div className="text-[#a67c52] text-[10px] animate-pulse uppercase tracking-[0.5em]">Initializing_Protocol...</div>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}