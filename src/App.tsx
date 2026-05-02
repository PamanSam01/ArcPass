import { useState, useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Components
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Identities from './components/Identities'
import Payments from './components/Payments'
import MyProfile from './components/MyProfile'
import Footer from './components/Footer'
import Background from './components/Background'

import { createAppKit } from '@reown/appkit/react'
import { config, projectId, wagmiAdapter, arcTestnet } from './config/wagmi'

const queryClient = new QueryClient()

function App() {
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    try {
      createAppKit({
        adapters: [wagmiAdapter],
        networks: [arcTestnet],
        projectId,
        metadata: {
          name: 'ArcPass',
          description: 'Financial Identity on Arc',
          url: window.location.origin,
          icons: ['https://avatars.githubusercontent.com/u/37784886']
        },
        features: {
          analytics: false,
          email: false,
          socials: false,
          swaps: false,
          onramp: false
        },
        themeMode: 'dark',
        themeVariables: {
          '--w3m-accent': '#00f5ff',
          '--w3m-border-radius-master': '1px',
          '--w3m-z-index': 9999
        },
        featuredWalletIds: [
          '971e689d049951b8d74dfa77c058c140340ca7657f7329394a291b7a73e1c1c1', // OKX Wallet
          'c57ca97b475477a26f57990e32353f60f52763e19e0e470817f30ee03027766b', // MetaMask
          'edde64295980dd0f57e56bc6945a89461159807530638167814e5a959f635602', // Rabby
        ],
        allWallets: 'HIDE'
      });
    } catch (err) {
      console.error('AppKit init failed:', err);
    }
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="relative min-h-screen bg-[#020408] text-white selection:bg-arc-cyan/30 w-full overflow-x-hidden">
          <Background />
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <main className="pt-20 w-full overflow-x-hidden relative">
            {activeTab === 'home' && <Hero onClaimClick={() => setActiveTab('identities')} />}
            {activeTab === 'identities' && <Identities />}
            {activeTab === 'payments' && <Payments />}
            {activeTab === 'profile' && <MyProfile />}
          </main>

          <Footer />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
