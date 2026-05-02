import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ShieldCheck, Zap, Globe, ArrowRight } from 'lucide-react';

interface HeroProps {
  onClaimClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onClaimClick }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
        delay: 0.2
      });

      if (cardsRef.current) {
        gsap.from(cardsRef.current.children, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.6
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-6 overflow-hidden w-full">
      {/* Cinematic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] bg-arc-violet/10 blur-[150px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-arc-cyan/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 text-center max-w-5xl mx-auto w-full px-2 sm:px-0">
        <div className="flex flex-col items-center gap-4 mb-8 sm:mb-10 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-arc-cyan animate-pulse" />
            <span className="font-mono text-[0.6rem] sm:text-[0.65rem] text-arc-cyan font-bold tracking-[0.2em] uppercase">ArcPass Identity Protocol</span>
          </div>
          <a 
            href="https://x.com/MrSamweb3" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-arc-violet/5 border border-white/5 hover:border-arc-violet/30 hover:bg-arc-violet/10 transition-all cursor-pointer"
          >
            <span className="font-orbitron text-[0.5rem] sm:text-[0.55rem] text-slate-500 group-hover:text-slate-300 transition-colors tracking-[0.1em] uppercase italic">Created by</span>
            <span className="font-orbitron font-black text-[0.6rem] sm:text-[0.65rem] text-arc-violet group-hover:text-arc-cyan transition-colors tracking-tight">0xPamanSam</span>
          </a>
        </div>
 
        <h1 ref={titleRef} className="font-orbitron font-black text-[clamp(2rem,9vw,5.5rem)] leading-[0.95] tracking-tighter mb-8 sm:mb-10 text-white">
          The <span className="grad-text">Human Layer</span> <br/>
          of Web3 Finance.
        </h1>
 
        <p className="font-syne text-[clamp(0.85rem,2.5vw,1.2rem)] text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-12 px-4">
          Claim your unique <span className="text-white font-bold">.arc</span> identity and send USDC to names, not hex. Fully on-chain, non-custodial, and built for the next billion users.
        </p>
 
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-20 sm:mb-24">
          <button 
            onClick={onClaimClick}
            className="neon-btn w-full sm:w-auto font-orbitron font-bold text-xs sm:text-sm tracking-widest px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-3"
          >
            CLAIM YOUR NAME <ArrowRight className="w-5 h-5" />
          </button>
          <button className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md font-orbitron font-bold text-xs sm:text-sm tracking-widest hover:bg-white/10 transition-all text-white">
            EXPLORE ECOSYSTEM
          </button>
        </div>
 
        {/* Feature Cards Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left">
          {[
            { icon: <ShieldCheck className="w-6 h-6" />, title: "Full On-Chain", desc: "Identity and transfers are verified directly on the Arc Testnet L1." },
            { icon: <Zap className="w-6 h-6" />, title: "Sub-Second Speed", desc: "USDC settlements land instantly with near-zero gas fees." },
            { icon: <Globe className="w-6 h-6" />, title: "Universal Resolution", desc: "Your .arc name works across all EVM-compatible wallets." }
          ].map((item, i) => (
            <div key={i} className="glass-panel p-6 sm:p-8 rounded-3xl group hover:border-arc-cyan/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-arc-cyan mb-6 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-orbitron font-bold text-lg text-white mb-3 tracking-tight">{item.title}</h3>
              <p className="font-syne text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
