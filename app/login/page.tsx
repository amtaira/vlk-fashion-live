'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function adminLogin() {
  const [key, setKey] = useState('');
  const router = useRouter();

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    // Cookie lasts 24 hours
    document.cookie = `vlk_admin_key=${key}; path=/; max-age=86400; SameSite=Strict`;
    router.push('/admin');
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6 font-mono">
      <div className="w-full max-w-xs space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-white text-2xl font-black tracking-tighter italic">VLK²</h1>
          <p className="text-[#a67c52] text-[9px] uppercase tracking-[0.4em]">Restricted Archive Access</p>
        </div>
        <form onSubmit={handleAccess} className="space-y-4">
          <input 
            type="password" 
            placeholder="ACCESS_PASSPHRASE"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full bg-transparent border-b border-white/10 py-4 outline-none text-[10px] tracking-widest text-white text-center focus:border-[#a67c52] transition-colors"
          />
          <button className="w-full py-4 bg-[#a67c52] text-black font-black text-[9px] uppercase tracking-[0.3em] hover:bg-white transition-all">
            INITIALIZE SESSION
          </button>
        </form>
      </div>
    </main>
  );
}