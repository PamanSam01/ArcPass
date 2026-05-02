import { defineChain } from 'viem';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// 1. Define the Arc Testnet
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'Arc', symbol: 'ARC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
    public: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
});

// 2. Contract Addresses
export const CONTRACTS = {
  ARC_IDENTITY: '0xDd37b027F9BF0e525660bDc3BbD2B53Ed7aFEF5b',
  USDC: '0x3600000000000000000000000000000000000000',
};

// 3. ABIs
export const ABIS = {
  ARCPASS: [
    { name: 'register', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'name', type: 'string' }, { name: 'metadataURI', type: 'string' }], outputs: [] },
    { name: 'unregister', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'name', type: 'string' }], outputs: [] },
    { name: 'resolve', type: 'function', stateMutability: 'view', inputs: [{ name: 'name', type: 'string' }], outputs: [{ name: '', type: 'address' }] },
    { name: 'isAvailable', type: 'function', stateMutability: 'view', inputs: [{ name: 'name', type: 'string' }], outputs: [{ name: '', type: 'bool' }] },
    { name: 'getRegistrationFee', type: 'function', stateMutability: 'view', inputs: [{ name: 'name', type: 'string' }], outputs: [{ name: '', type: 'uint256' }] },
    { name: 'IdentityRegistered', type: 'event', inputs: [{ name: 'owner', type: 'address', indexed: true }, { name: 'tokenId', type: 'uint256', indexed: true }, { name: 'name', type: 'string', indexed: false }] },
    { name: 'ownerOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ name: '', type: 'address' }] },
    { name: 'tokenURI', type: 'function', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ name: '', type: 'string' }] },
    { name: 'getNameByTokenId', type: 'function', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ name: '', type: 'string' }] },
    { name: 'tokenOfOwnerByIndex', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'index', type: 'uint256' }], outputs: [{ name: '', type: 'uint256' }] },
    { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
    { name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
    { name: 'tokenByIndex', type: 'function', stateMutability: 'view', inputs: [{ name: 'index', type: 'uint256' }], outputs: [{ name: '', type: 'uint256' }] },
  ] as const,
  ERC20: [
    { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '','type': 'uint256' }] },
    { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint8' }] },
    { name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
    { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
    { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
    { name: 'Transfer', type: 'event', inputs: [{ name: 'from', type: 'address', indexed: true }, { name: 'to', type: 'address', indexed: true }, { name: 'value', type: 'uint256', indexed: false }] }
  ] as const,
};

export const projectId = 'a069418e268953112d8a0f5a772428f5';

// 4. Setup Wagmi Adapter with explicit connectors
export const wagmiAdapter = new WagmiAdapter({
  networks: [arcTestnet],
  projectId,
  ssr: false,
});

// 5. Initialize AppKit
export const config = wagmiAdapter.wagmiConfig;
