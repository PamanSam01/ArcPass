import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArc } from '../hooks/useArc';
import { Send, ChevronRight, Activity, ShieldCheck, Zap } from 'lucide-react';

const Payments: React.FC = () => {
  const { isConnected, isPending, sendUSDCPayment, isSuccess, txHash, resolveName } = useArc();
  const [recipient, setRecipient] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [amount, setAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSuccess) setShowSuccess(true);
  }, [isSuccess]);

  useEffect(() => {
    const lookup = async () => {
      if (!recipient || recipient.length < 3) {
        setResolvedAddress(null);
        return;
      }
      setIsResolving(true);
      try {
        const addr = await resolveName(recipient);
        setResolvedAddress(addr);
      } catch (err) {
        setResolvedAddress(null);
      } finally {
        setIsResolving(false);
      }
    };
    const timer = setTimeout(lookup, 500);
    return () => clearTimeout(timer);
  }, [recipient, resolveName]);

  const handleSend = async () => {
    try {
      if (!isConnected) return;
      if (!resolvedAddress) return;
      await sendUSDCPayment(amount, recipient);
    } catch (err) {
      console.error('Payment failed:', err);
    }
  };

  const resetPayment = () => {
    setShowSuccess(false);
    setRecipient('');
    setAmount('');
    setResolvedAddress(null);
  };

  return (
    <section id="payments" className="py-16 px-2 sm:px-6 relative overflow-hidden w-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-arc-violet/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-10 sm:mb-20">
          <h2 className="font-orbitron font-black text-[clamp(1.6rem,5vw,4rem)] leading-none tracking-tighter mb-6 text-white px-2">
            Send <span className="grad-text">Digital Dollars</span> <br/>
            to Human Names.
          </h2>
          <p className="font-syne text-xs sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed px-4">
            Fast, secure, and fully on-chain. Experience the Stripe-level UX for decentralized stablecoin finance.
          </p>
        </div>
 
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          <div className="lg:col-span-5 order-2 lg:order-1 w-full overflow-hidden">
            <div ref={cardRef} className="glass-panel p-4 sm:p-8 rounded-[2rem] sm:rounded-[3rem] relative overflow-hidden w-full max-w-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-arc-cyan/5 blur-3xl pointer-events-none" />
              
              <AnimatePresence>
                {showSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6 sm:p-8"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-arc-cyan/10 border border-arc-cyan/20 flex items-center justify-center mb-6">
                      <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-arc-cyan" />
                    </div>
                    <h3 className="font-orbitron font-black text-xl sm:text-2xl text-white mb-2 uppercase tracking-tight">Payment Sent!</h3>
                    <p className="font-syne text-xs sm:text-sm text-slate-400 mb-8 max-w-xs">
                      Successfully sent <span className="text-white font-bold">{amount} USDC</span> to <span className="text-arc-cyan font-bold">{recipient}.arc</span>
                    </p>
                    
                    {txHash && (
                      <a 
                        href={`https://testnet.arcscan.app/tx/${txHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-mono text-[0.6rem] text-arc-cyan/60 hover:text-arc-cyan transition-colors mb-8 bg-white/5 px-4 py-2 rounded-lg border border-white/10"
                      >
                        TX: {txHash.slice(0, 15)}...
                      </a>
                    )}
 
                    <button onClick={resetPayment} className="neon-btn w-full py-4 rounded-2xl font-orbitron font-bold text-sm tracking-widest">
                      SEND ANOTHER PAYMENT
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
 
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-arc-violet/10 flex items-center justify-center text-arc-violet">
                    <Send className="w-5 h-5" />
                  </div>
                  <h4 className="font-orbitron font-bold text-base sm:text-lg text-white">Payment Rail</h4>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[0.5rem] sm:text-[0.6rem] text-emerald-500 font-bold uppercase tracking-widest">Live</span>
                </div>
              </div>
 
              <div className="mb-8">
                <label className="font-mono text-[0.6rem] sm:text-[0.65rem] text-slate-500 uppercase tracking-widest mb-3 block">Recipient Identity</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Search .arc username..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 font-syne text-sm sm:text-base text-white outline-none focus:border-arc-cyan/30 transition-all placeholder:text-slate-600"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 font-orbitron font-black text-arc-cyan/40 text-xs sm:text-sm tracking-tighter">.ARC</div>
                </div>
                
                <div className="mt-3 min-h-[20px]">
                  {isResolving ? (
                    <span className="font-mono text-[0.55rem] text-arc-cyan/50 animate-pulse uppercase">Resolving...</span>
                  ) : resolvedAddress ? (
                    <div className="flex items-center gap-2 font-mono text-[0.55rem] text-emerald-400 uppercase tracking-tight bg-emerald-400/5 p-2 rounded-lg border border-emerald-400/10">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Resolved: {resolvedAddress.slice(0, 6)}...{resolvedAddress.slice(-4)}
                    </div>
                  ) : recipient.length > 2 && (
                    <span className="font-mono text-[0.55rem] text-red-400/70 uppercase">Identity not registered</span>
                  )}
                </div>
              </div>
 
              <div className="mb-10">
                <label className="font-mono text-[0.6rem] sm:text-[0.65rem] text-slate-500 uppercase tracking-widest mb-3 block">Amount in USDC</label>
                <div className="flex items-stretch bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-arc-cyan/30 transition-all">
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="flex-1 bg-transparent p-4 sm:p-5 font-orbitron font-bold text-lg sm:text-2xl text-white outline-none placeholder:text-slate-700 min-w-0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="flex items-center gap-2 px-3 sm:px-6 bg-white/5 border-l border-white/10">
                    <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=040" className="w-4 h-4 sm:w-6 sm:h-6" alt="USDC" />
                    <span className="font-orbitron font-black text-[0.55rem] sm:text-xs text-white tracking-tighter uppercase">USDC</span>
                  </div>
                </div>
              </div>
 
              <div className="space-y-3 mb-10 bg-slate-900/50 p-4 sm:p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between font-syne text-[0.6rem] sm:text-xs gap-4">
                  <span className="text-slate-500 uppercase">Fee</span>
                  <span className="text-emerald-400 font-bold tracking-tight">~$0.0001 USDC</span>
                </div>
                <div className="flex justify-between font-syne text-[0.6rem] sm:text-xs border-t border-white/5 pt-3 gap-4">
                  <span className="text-slate-200 font-bold uppercase tracking-tight">Total</span>
                  <span className="text-white font-black text-sm sm:text-sm tracking-tighter">{(parseFloat(amount) || 0).toFixed(2)} USDC</span>
                </div>
              </div>
 
              <button 
                onClick={handleSend}
                disabled={isPending || !resolvedAddress || !amount}
                className={`neon-btn w-full py-5 rounded-2xl font-orbitron font-bold text-xs sm:text-sm tracking-widest flex items-center justify-center gap-3 ${
                  isPending || !resolvedAddress || !amount ? 'opacity-30 grayscale cursor-not-allowed' : ''
                }`}
              >
                {isPending ? 'PROCESSING...' : (
                  <>INITIATE TRANSFER <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </div>
 
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-8 sm:space-y-12">
            <div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-arc-cyan/10 flex items-center justify-center text-arc-cyan mb-6 sm:mb-8 border border-arc-cyan/20">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="font-orbitron font-black text-xl sm:text-3xl text-white mb-4 tracking-tighter uppercase">Enterprise Performance.</h3>
              <p className="font-syne text-sm sm:text-lg text-slate-500 leading-relaxed max-w-xl">
                Payments are settled instantly on Arc Testnet, leveraging native stablecoin rails to eliminate volatility and reduce fees to nearly zero.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {[
                { title: 'Social Rails', desc: 'No more copy-pasting hex strings. Use names like damar.arc to send funds instantly.' },
                { title: 'Safe Transaction', desc: 'Real-time name resolution ensures you never send funds to an unregistered address.' },
                { title: 'Full Ownership', desc: 'ArcPass is fully non-custodial. Your keys, your funds, your identity.' },
                { title: 'USDC Optimized', desc: 'Native support for USDC ensures your assets are stable and universally accepted.' }
              ].map((item, i) => (
                <div key={i} className="space-y-2 group">
                  <div className="w-2 h-2 rounded-full bg-arc-violet group-hover:bg-arc-cyan transition-colors" />
                  <h4 className="font-orbitron font-bold text-sm text-white tracking-tight uppercase">{item.title}</h4>
                  <p className="font-syne text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Payments;
