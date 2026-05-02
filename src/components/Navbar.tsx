import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Claim ArcPass', id: 'identities' },
    { name: 'Payments', id: 'payments' },
    { name: 'My Profile', id: 'profile' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
      isScrolled ? 'py-4' : 'py-8'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className={`glass-panel rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between transition-all duration-500 w-full ${
          isScrolled ? 'mx-0 bg-slate-900/80 border-white/10 shadow-2xl' : 'mx-0 sm:mx-4 bg-transparent border-transparent'
        }`}>
          {/* Logo */}
          <div 
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arc-violet to-arc-cyan p-0.5 group-hover:rotate-[15deg] transition-transform duration-500">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center p-1.5">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                  <path d="M50 15 C 25 15, 10 50, 10 85 L 30 85 C 30 60, 40 35, 50 35 C 60 35, 70 60, 70 85 L 90 85 C 90 50, 75 15, 50 15 Z" />
                  <path d="M45 85 L 80 85 L 80 70 L 45 70 Z" className="fill-white/80" />
                </svg>
              </div>
            </div>
            <span className="font-orbitron font-black text-xl tracking-tighter text-white">
              Arc<span className="text-arc-cyan">Pass</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={() => setActiveTab(link.id)}
                className={`font-orbitron text-[0.7rem] font-bold tracking-widest uppercase transition-all relative py-2 ${
                  activeTab === link.id ? 'text-arc-cyan' : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.name}
                {activeTab === link.id && (
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-arc-cyan rounded-full animate-in fade-in slide-in-from-left-2" />
                )}
              </button>
            ))}
          </div>

          {/* Wallet / Mobile Action */}
          <div className="flex items-center gap-2 sm:gap-4 pr-1 sm:pr-0">
            <div className="hidden sm:block scale-90 sm:scale-100 origin-right">
              {/* @ts-ignore */}
              <appkit-button balance="hide" />
            </div>

            <button 
              className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/10 active:scale-95 transition-transform"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[90] bg-slate-950/98 backdrop-blur-2xl lg:hidden flex flex-col p-6 pt-32"
          >
            <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
              {navLinks.map((link) => (
                <button 
                  key={link.id} 
                  onClick={() => {
                    setActiveTab(link.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left p-6 rounded-2xl border transition-all ${
                    activeTab === link.id 
                      ? 'bg-arc-cyan/10 border-arc-cyan/20 text-arc-cyan' 
                      : 'bg-white/5 border-white/5 text-slate-400'
                  }`}
                >
                  <span className="font-orbitron text-xl font-black tracking-tighter uppercase">{link.name}</span>
                </button>
              ))}
              
              <div className="pt-8 border-t border-white/10 mt-4 flex justify-center">
                {/* @ts-ignore */}
                <appkit-button balance="hide" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
