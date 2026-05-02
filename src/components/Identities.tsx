import React, { useState, useEffect } from 'react';
import { useArc } from '../hooks/useArc';
import { ShieldCheck, UserPlus, Fingerprint, ChevronRight, Activity, Sparkles, AlertCircle } from 'lucide-react';
import { ABIS, CONTRACTS } from '../config/wagmi';

const Identities: React.FC = () => {
  const { isConnected, isPending, registerIdentity, resolveName } = useArc();
  const [name, setName] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!name || name.length < 3) {
        setIsAvailable(null);
        return;
      }
      setIsChecking(true);
      try {
        const addr = await resolveName(name);
        setIsAvailable(addr === null);
      } catch (err) {
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    };
    const timer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timer);
  }, [name, resolveName]);

  const [image, setImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const resizeImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 100; // Smaller for absolute safety
        const MAX_HEIGHT = 100;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const finalData = canvas.toDataURL('image/jpeg', 0.6);
        console.log(`[PFP] Resized image size: ${Math.round(finalData.length / 1024)} KB`);
        resolve(finalData);
      };
      img.src = dataUrl;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const resized = await resizeImage(reader.result as string);
          setImage(resized);
        } catch (err) {
          console.error("Resize failed", err);
        } finally {
          setIsProcessingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async () => {
    if (!name || !isAvailable) return;
    try {
      await registerIdentity(name, image || undefined);
      setName('');
      setImage(null);
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <section id="identities" className="py-20 px-4 sm:px-6 relative overflow-hidden bg-slate-950/20">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(124,58,237,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-mono text-[0.65rem] text-amber-500 font-bold tracking-widest uppercase">Protocol Testnet Live</span>
              </div>
              <h2 className="font-orbitron font-black text-[clamp(2.2rem,6vw,4.5rem)] leading-[0.9] text-white tracking-tighter uppercase">
                Claim Your <br/>
                <span className="grad-text">On-Chain Soul.</span>
              </h2>
              <p className="font-syne text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl">
                Your <span className="text-white font-bold">.arc</span> name is more than a username. It's a non-transferable identity NFT that secures your social and financial footprint on the Arc Network.
              </p>
            </div>
 
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                { icon: <Fingerprint className="w-5 h-5" />, title: 'Biometric Soulbound', desc: 'Immutable identity linked to your wallet permanently.' },
                { icon: <ShieldCheck className="w-5 h-5" />, title: 'Zero Collisions', desc: 'Proprietary name resolution protocol ensures total uniqueness.' }
              ].map((feat, i) => (
                <div key={i} className="glass-panel p-6 rounded-[2rem] border-white/5 bg-white/[0.01]">
                  <div className="w-10 h-10 rounded-xl bg-arc-violet/10 flex items-center justify-center text-arc-violet mb-4">
                    {feat.icon}
                  </div>
                  <h4 className="font-orbitron font-bold text-sm text-white mb-2 uppercase tracking-tight">{feat.title}</h4>
                  <p className="font-syne text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
 
          <div className="lg:col-span-6">
            <div className="glass-panel p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] relative group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-arc-violet/10 blur-[80px] rounded-full group-hover:bg-arc-violet/20 transition-all duration-700" />
              
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-arc-cyan">
                  <UserPlus className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-orbitron font-black text-xl text-white uppercase tracking-tight">Identity Registration</h3>
                  <p className="font-syne text-xs text-slate-500 uppercase tracking-widest">Reserve your .arc domain now</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Image Upload */}
                <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/10">
                  <div className="relative group/pfp w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 group-hover/pfp:border-arc-cyan transition-all">
                    {image ? (
                      <img src={image} alt="PFP Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
                        <UserPlus className="w-8 h-8" />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/pfp:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      <span className="font-mono text-[0.6rem] text-white font-bold uppercase">Upload</span>
                    </label>
                  </div>
                  <p className="font-syne text-[0.6rem] text-slate-500 uppercase tracking-widest">Upload Profile Picture (Optional)</p>
                </div>

                <div>
                  <label className="font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest mb-4 block">Desired Username</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g. Satoshi"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 font-orbitron font-bold text-2xl text-white outline-none focus:border-arc-cyan/30 transition-all placeholder:text-slate-700"
                      value={name}
                      onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 font-orbitron font-black text-arc-cyan text-xl tracking-tighter">.ARC</div>
                  </div>
                  
                  <div className="mt-4 min-h-[32px]">
                    {isChecking ? (
                      <div className="flex items-center gap-3 animate-pulse">
                        <Activity className="w-4 h-4 text-arc-cyan" />
                        <span className="font-mono text-[0.65rem] text-arc-cyan uppercase tracking-widest">Querying Identity Protocol...</span>
                      </div>
                    ) : isAvailable === true ? (
                      <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-mono text-[0.65rem] uppercase font-bold tracking-widest">Identity is Available</span>
                      </div>
                    ) : isAvailable === false ? (
                      <div className="flex items-center gap-2 text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-mono text-[0.65rem] uppercase font-bold tracking-widest">Identity Already Claimed</span>
                      </div>
                    ) : name.length > 0 && name.length < 3 && (
                      <span className="font-mono text-[0.6rem] text-slate-500 uppercase px-2">Minimum 3 characters required</span>
                    )}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-xs font-syne">
                    <span className="text-slate-500 uppercase tracking-widest">Registration Fee</span>
                    <span className="text-white font-bold uppercase">
                      {name.length >= 6 ? 'Free (Testnet)' : 
                       name.length === 5 ? '1 USDC' :
                       name.length === 4 ? '3 USDC' :
                       name.length === 3 ? '5 USDC' : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-syne border-t border-white/5 pt-4">
                    <span className="text-slate-500 uppercase tracking-widest">Gas Limit</span>
                    <span className="text-emerald-400 font-bold uppercase">Sponsored</span>
                  </div>
                </div>

                <button 
                  onClick={handleRegister}
                  disabled={isPending || isProcessingImage || !isAvailable || !isConnected}
                  className={`neon-btn w-full py-6 rounded-2xl font-orbitron font-bold text-sm tracking-widest flex items-center justify-center gap-3 ${
                    isPending || isProcessingImage || !isAvailable || !isConnected ? 'opacity-30 grayscale cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessingImage ? 'PROCESSING IMAGE...' : isPending ? 'MINTING SOULBOUND...' : (
                    <>CLAIM THIS IDENTITY <ChevronRight className="w-5 h-5" /></>
                  )}
                </button>

                {/* Global Passport Feed */}
                <div className="mt-12 pt-12 border-t border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-arc-cyan/10 flex items-center justify-center text-arc-cyan">
                        <Activity className="w-4 h-4" />
                      </div>
                      <h4 className="font-orbitron font-bold text-sm text-white uppercase tracking-tight">Global Passport Feed</h4>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-arc-cyan/5 border border-arc-cyan/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-arc-cyan animate-pulse" />
                      <span className="font-mono text-[0.5rem] text-arc-cyan uppercase font-bold">Live Sync</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar scroll-smooth">
                    <RecentMints />
                  </div>
                </div>

                {!isConnected && (
                  <p className="text-center font-mono text-[0.6rem] text-red-400/60 uppercase tracking-widest animate-pulse">
                    Please connect wallet to authorize claim
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Identities;

const RecentMints: React.FC = () => {
  const { publicClient } = useArc();
  const [mints, setMints] = useState<any[]>([]);

  useEffect(() => {
    const fetchMints = async () => {
      if (!publicClient) return;
      try {
        // 1. Get total minted identities
        const total = await publicClient.readContract({
          address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
          abi: ABIS.ARCPASS,
          functionName: 'totalSupply',
        }) as bigint;

        console.log(`[GlobalFeed] Total identities on-chain: ${total}`);
        if (Number(total) === 0) return;

        // 2. Fetch the last 10 minted tokens
        const start = Number(total) - 1;
        const count = Math.min(Number(total), 10);
        
        console.log(`[GlobalFeed] Fetching latest ${count} identities starting from index ${start}...`);

        const latestMints = await Promise.all(
          Array.from({ length: count }).map(async (_, index) => {
            try {
              const currentIdx = BigInt(start - index);
              const tokenId = await publicClient.readContract({
                address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
                abi: ABIS.ARCPASS,
                functionName: 'tokenByIndex',
                args: [currentIdx]
              }) as bigint;

              const [name, owner] = await Promise.all([
                publicClient.readContract({
                  address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
                  abi: ABIS.ARCPASS,
                  functionName: 'getNameByTokenId',
                  args: [tokenId]
                }),
                publicClient.readContract({
                  address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
                  abi: ABIS.ARCPASS,
                  functionName: 'ownerOf',
                  args: [tokenId]
                })
              ]) as [string, string];

              return { name, owner, hash: '' };
            } catch (e) { 
              console.error(`[GlobalFeed] Failed to fetch token at index ${start - index}`, e);
              return null; 
            }
          })
        );

        const filtered = latestMints.filter(Boolean);
        console.log(`[GlobalFeed] Successfully synced ${filtered.length} identities to feed.`);
        setMints(filtered);
      } catch (err) {
        console.error('Direct fetch failed:', err);
      }
    };

    fetchMints();
    const interval = setInterval(fetchMints, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [publicClient]);

  if (mints.length === 0) {
    return <div className="text-center py-8 text-slate-600 font-syne text-xs italic">Waiting for new passport data...</div>;
  }

  return (
    <>
      {mints.slice(0, 10).map((mint, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group min-w-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-arc-cyan/20 to-arc-violet/20 flex items-center justify-center text-arc-cyan shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-orbitron font-bold text-[0.75rem] text-white tracking-tight group-hover:text-arc-cyan transition-colors truncate">{mint.name}.arc</p>
              <p className="font-mono text-[0.55rem] text-slate-500 uppercase tracking-widest truncate">{mint.owner.slice(0, 6)}...{mint.owner.slice(-4)}</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
