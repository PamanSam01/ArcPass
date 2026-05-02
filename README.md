# ArcPass — The Human Layer of Web3 Finance

![ArcPass Banner](https://img.shields.io/badge/Network-Arc_Testnet-00f5ff?style=for-the-badge&logo=blockchaindotcom&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**ArcPass** is a high-performance decentralized identity and payment protocol built on the **Arc Testnet**. It eliminates the complexity of hex-based wallet addresses by providing human-readable `.arc` identities and seamless stablecoin payments.

## 🚀 Key Features

- **Decentralized Identities (.arc)**: Claim your unique on-chain soulbound identity.
- **Human-Readable Payments**: Send USDC to human names instead of long wallet addresses.
- **Biometric Integration Ready**: Built with soulbound NFT technology for permanent identity link.
- **Enterprise Performance**: Sub-second settlement and near-zero gas fees on Arc Network.
- **Cinematic UI/UX**: Premium glassmorphic design with GSAP animations and framer-motion.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: TailwindCSS, Vanilla CSS (Premium Mesh Backgrounds)
- **Animations**: GSAP (GreenSock), Framer Motion, Lucide Icons
- **Web3 Engine**: Wagmi, Viem, @reown/appkit (WalletConnect)
- **Network**: Arc Testnet (Chain ID: 5042002)

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PamanSam01/ArcPass.git
   cd ArcPass
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Project ID:**
   The app uses a default WalletConnect Project ID. For production, create your own at [cloud.reown.com](https://cloud.reown.com) and update it in `src/config/wagmi.ts`.

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

## 🌐 Vercel Deployment

ArcPass is optimized for **Vercel** deployment.

### Steps to Deploy:
1. Push your code to a GitHub repository.
2. Connect your repository to Vercel.
3. Use the following build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**: Add any custom variables if needed (e.g., `VITE_PROJECT_ID`).

> [!IMPORTANT]
> **Stability Note**: This project includes built-in polyfills for Node.js globals (`Buffer`, `process`, `global`) to ensure compatibility with Web3 libraries in the browser environment. No additional configuration is needed for Vercel.

## 📜 Smart Contract

The core ArcPass Identity contract is deployed on **Arc Testnet**:
- **Address**: `0xDd37b027F9BF0e525660bDc3BbD2B53Ed7aFEF5b`
- **Explorer**: [ArcScan](https://testnet.arcscan.app/address/0xDd37b027F9BF0e525660bDc3BbD2B53Ed7aFEF5b)

---

Created with ❤️ by **[0xPamanSam](https://x.com/MrSamweb3)**
