import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield } from 'lucide-react';
import { useConnect, useAccount } from 'wagmi';


interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose }) => {
  const { connectors, connect } = useConnect();
  const { isConnected } = useAccount();

  // Close modal when connected
  React.useEffect(() => {
    if (isConnected) {
      onClose();
    }
  }, [isConnected, onClose]);

  const handleWalletConnect = (walletId: string) => {
    const connector = connectors.find(
      (c) => c.name.toLowerCase().includes(walletId.toLowerCase()) || 
             c.id.toLowerCase().includes(walletId.toLowerCase())
    );

    if (connector) {
      connect({ connector });
    } else {
      // Wallet not found / not installed
      const links: Record<string, string> = {
        rabby: 'https://rabby.io/',
        metaMask: 'https://metamask.io/download/',
        okx: 'https://www.okx.com/web3'
      };
      window.open(links[walletId] || 'https://google.com', '_blank');
    }
  };

  if (!isOpen) return null;



  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#050810]/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-[440px] bg-[#0a0f1d] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          {/* Header */}
          <div className="p-8 pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-orbitron text-2xl font-bold text-white tracking-tight">Connect Wallet</h2>
              <p className="text-slate-400 text-sm mt-1">Select your preferred connection method</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 pt-4 space-y-4">
            {/* Wallet List */}
            <div className="grid grid-cols-1 gap-3">

              {[
                { id: 'rabby', name: 'Rabby Wallet', icon: '/images/rabby-logo.png', desc: 'The best wallet for Ethereum power users' },

                { id: 'metaMask', name: 'MetaMask', icon: '/images/metamask-logo.png', desc: 'Popular browser extension wallet' },
                { id: 'okx', name: 'OKX Wallet', icon: '/images/okx-logo.png', desc: 'Multi-chain support & built-in DEX' }
              ].map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleWalletConnect(wallet.id)}
                  className="group relative p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all flex items-center gap-4 text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-800/50 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-white/10 overflow-hidden">
                    <img src={wallet.icon} alt={wallet.name} className="w-7 h-7 object-contain" />
                  </div>
                  <div className="flex-1">
                    <div className="font-orbitron text-sm font-bold text-white tracking-wide">{wallet.name}</div>
                    <p className="text-slate-500 text-[11px] mt-0.5">{wallet.desc}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-arc-cyan opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_var(--arc-cyan)]" />
                </button>
              ))}
            </div>

            {/* Security Footer */}
            <div className="pt-2 flex items-center justify-center gap-2 text-slate-600">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted Connection</span>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="bg-white/[0.02] p-4 text-center border-t border-white/5">
            <p className="text-[10px] text-slate-500 font-medium">
              By connecting, you agree to our <span className="text-arc-cyan cursor-pointer hover:underline">Terms</span> and <span className="text-arc-cyan cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConnectModal;
