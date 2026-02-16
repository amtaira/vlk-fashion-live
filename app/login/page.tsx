'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLogin() {
  const [key, setKey] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('logout') === 'success') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [searchParams]);

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    // Session cookie (no max-age)
    document.cookie = `vlk_admin_key=${key}; path=/; SameSite=Strict`;
    router.push('/admin');
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6 font-mono">
      <div className="w-full max-w-xs space-y-8">
        {showSuccess && (
          <div className="text-center p-2 border border-green-500/50 bg-green-500/10 mb-4">
            <p className="text-green-500 text-[9px] uppercase tracking-widest">Session Terminated Successfully</p>
          </div>
        )}
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