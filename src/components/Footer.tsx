import React from 'react';
import { X, MessageSquare, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 pt-24 pb-12 px-6 border-t border-white/5 bg-slate-950/40 backdrop-blur-3xl">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arc-violet to-arc-cyan flex items-center justify-center p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center p-1.5">
                  <img src="/arc.jpg" alt="Arc Logo" className="w-full h-full object-cover rounded-[8px]" />
                </div>
              </div>
              <span className="font-orbitron font-black text-2xl text-white tracking-tighter">
                Arc<span className="text-arc-cyan">Pass</span>
              </span>
            </div>
            <p className="font-syne text-sm text-slate-400 max-w-md leading-relaxed">
              Arc is a stablecoin-native Layer-1 blockchain providing a foundation for stablecoins, tokenized assets, economic contracts, and onchain markets. Build on Arc.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://x.com/arc" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-arc-cyan hover:bg-arc-cyan/10 border border-white/5 transition-all">
                <X className="w-5 h-5" />
              </a>
              <a href="https://discord.com/invite/buildonarc" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-arc-cyan hover:bg-arc-cyan/10 border border-white/5 transition-all">
                <MessageSquare className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Build Links */}
          <div className="md:col-span-3">
            <h4 className="font-orbitron font-bold text-[0.65rem] text-slate-500 uppercase tracking-[0.3em] mb-8">//Build</h4>
            <ul className="space-y-4">
              {[
                { name: 'Documentation', url: 'https://docs.arc.network/' },
                { name: 'Explorer', url: 'https://testnet.arcscan.app/' },
                { name: 'Faucet', url: 'https://faucet.circle.com/' }
              ].map(item => (
                <li key={item.name}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-syne text-sm text-slate-300 hover:text-arc-cyan transition-colors flex items-center gap-2 group">
                    {item.name} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore Links */}
          <div className="md:col-span-3">
            <h4 className="font-orbitron font-bold text-[0.65rem] text-slate-500 uppercase tracking-[0.3em] mb-8">//Explore</h4>
            <ul className="space-y-4">
              {[
                { name: 'Blog', url: 'https://www.arc.network/blog' },
                { name: 'Ecosystem', url: 'https://www.arc.network/ecosystem' },
                { name: 'Litepaper', url: 'https://www.arc.network/litepaper' }
              ].map(item => (
                <li key={item.name}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-syne text-sm text-slate-300 hover:text-arc-cyan transition-colors flex items-center gap-2 group">
                    {item.name} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest">
                © 2026 Circle Internet Group, Inc. All rights reserved
              </div>
              <div className="flex items-center gap-8">
                <a href="https://docs.arc.network/terms" target="_blank" rel="noopener noreferrer" className="font-mono text-[0.6rem] text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Terms</a>
                <a href="https://www.circle.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-mono text-[0.6rem] text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Privacy</a>
                <a href="https://6778953.fs1.hubspotusercontent-na1.net/hubfs/6778953/Brand/Arc/Arc_Logos.zip" className="font-mono text-[0.6rem] text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Brand Kit</a>
              </div>
            </div>
            
            <p className="font-syne text-[0.6rem] text-slate-600 leading-relaxed max-w-full text-justify opacity-60">
              Arc testnet is offered by Circle Technology Services, LLC (“CTS”). CTS is a software provider and does not provide regulated financial or advisory services. You are solely responsible for services you provide to users, including obtaining any necessary licenses or approvals and otherwise complying with applicable laws. Arc has not been reviewed or approved by the New York State Department of Financial Services.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
