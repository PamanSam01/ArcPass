import { useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConfig, usePublicClient, useSwitchChain } from 'wagmi';
import { parseUnits, getAddress, getAbiItem } from 'viem';
import { readContract } from '@wagmi/core';
import { CONTRACTS, ABIS, arcTestnet } from '../config/wagmi';

export interface ArcHook {
  isConnected: boolean;
  address: `0x${string}` | undefined;
  isPending: boolean;
  isSuccess: boolean;
  txHash: `0x${string}` | undefined;
  approveUSDC: (amount: string) => Promise<any>;
  registerIdentity: (username: string, customImage?: string) => Promise<`0x${string}` | undefined>;
  deleteIdentity: (name: string) => Promise<any>;
  sendUSDCPayment: (amount: string, recipientName: string) => Promise<any>;
  resolveName: (name: string) => Promise<`0x${string}` | null>;
  getFee: (name: string) => Promise<bigint>;
  getOwnedIdentities: (ownerAddress: string) => Promise<any[]>;
  getPrimaryName: (ownerAddress: string) => Promise<string | null>;
  publicClient: any;
}

export const useArc = (): ArcHook => {
  const { isConnected, address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const config = useConfig();
  const publicClient = usePublicClient();
  const { writeContractAsync, data: hash, isPending: isWritePending } = useWriteContract();
  
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isPending = isWritePending || isWaiting;

  // 0. Resolve Name to Address (Robust Multi-Strategy Resolution)
  const resolveName = useCallback(async (name: string) => {
    if (!publicClient || !name || name.length < 3) return null;
    
    const tryResolve = async (searchName: string, strategy: string) => {
      console.log(`[ArcResolver] Strategy ${strategy}: Searching for "${searchName}"...`);
      try {
        const addr = await publicClient.readContract({
          address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
          abi: ABIS.ARCPASS,
          functionName: 'resolve',
          args: [searchName],
        } as any) as `0x${string}`;
        
        if (addr && addr !== '0x0000000000000000000000000000000000000000') {
          console.log(`[ArcResolver] ✅ Found! Address: ${addr}`);
          return addr;
        }
        console.log(`[ArcResolver] ❌ Not found via ${strategy}`);
        return null;
      } catch (e: any) {
        console.warn(`[ArcResolver] ⚠️ Error in ${strategy}:`, e.message || e);
        return null;
      }
    };

    try {
      console.log(`[ArcResolver] Starting resolution for: "${name}"`);
      
      // Strategy 1: Exact as typed (e.g. "Senja.arc")
      let resolved = await tryResolve(name.trim(), 'EXACT');
      if (resolved) return resolved;

      // Strategy 2: Strip .arc (e.g. "Senja")
      const stripped = name.trim().replace(/\.arc$/i, '');
      if (stripped !== name.trim()) {
        resolved = await tryResolve(stripped, 'STRIPPED');
        if (resolved) return resolved;
      }

      // Strategy 3: Lowercase Fallback (e.g. "senja")
      const lower = stripped.toLowerCase();
      if (lower !== stripped) {
        resolved = await tryResolve(lower, 'LOWERCASE');
        if (resolved) return resolved;
      }

      console.log(`[ArcResolver] 🚫 Final Result: No identity found for "${name}"`);
      return null;
    } catch (err) {
      console.error('Final Resolution Error:', err);
      return null;
    }
  }, [publicClient]);

  // 0.2 Get Primary Name of an Address
  const getPrimaryName = useCallback(async (ownerAddress: string) => {
    if (!publicClient || !ownerAddress) return null;
    try {
      const target = getAddress(ownerAddress);
      // Try to get the first token they own
      const tokenId = await publicClient.readContract({
        address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
        abi: ABIS.ARCPASS,
        functionName: 'tokenOfOwnerByIndex',
        args: [target, 0n],
      } as any).catch(() => null) as bigint | null;

      if (tokenId !== null) {
        return await publicClient.readContract({
          address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
          abi: ABIS.ARCPASS,
          functionName: 'getNameByTokenId',
          args: [tokenId],
        } as any) as string;
      }
      return null;
    } catch (e) {
      return null;
    }
  }, [publicClient]);

  // 0.1 Get Registration Fee
  const getFee = useCallback(async (name: string) => {
    const result = await readContract(config, {
      address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
      abi: ABIS.ARCPASS,
      functionName: 'getRegistrationFee',
      args: [name],
    } as any);
    return result as bigint;
  }, [config]);

  // 1. Approve USDC for ArcPass
  const approveUSDC = useCallback(async (amount: string) => {
    if (!isConnected) throw new Error('Not connected');
    
    const amountBigInt = parseUnits(amount, 6);

    return await writeContractAsync({
      address: CONTRACTS.USDC as `0x${string}`,
      abi: ABIS.ERC20,
      functionName: 'approve' as any,
      args: [CONTRACTS.ARC_IDENTITY as `0x${string}`, amountBigInt],
      account: address,
      chain: arcTestnet,
    });
  }, [isConnected, address, writeContractAsync]);

  // 2. Register ArcPass Identity (Seamless Two-Step Process)
  const registerIdentity = useCallback(async (username: string, customImage?: string) => {
    if (!isConnected || !address || !writeContractAsync || !publicClient || !switchChainAsync) throw new Error('Not connected');

    try {
      // 0. Automatic Network Switch
      const chainId = await publicClient.getChainId();
      if (chainId !== arcTestnet.id) {
        try {
          await switchChainAsync({ chainId: arcTestnet.id });
          await new Promise(r => setTimeout(r, 1500));
        } catch (e) {
          alert("Please switch to Arc Testnet in MetaMask first!");
          return;
        }
      }

      const target = getAddress(address);

      // 1. Fetch Fee and Check USDC Balance
      const fee = await publicClient.readContract({
        address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
        abi: ABIS.ARCPASS,
        functionName: 'getRegistrationFee',
        args: [username]
      } as any) as bigint;
      
      const userUsdcBalance = await publicClient.readContract({
        address: CONTRACTS.USDC as `0x${string}`,
        abi: ABIS.ERC20,
        functionName: 'balanceOf',
        args: [target]
      } as any) as bigint;

      if (userUsdcBalance < fee) {
        alert(`Insufficient USDC balance. Required: ${Number(fee)/1e6}, Have: ${Number(userUsdcBalance)/1e6}`);
        return;
      }

      // 2. Step 1: Approval (only if fee > 0)
      if (fee > 0n) {
        console.log(`[ArcRegister] Fee required: ${fee.toString()}. Checking allowance...`);
        const currentAllowance = await publicClient.readContract({
          address: CONTRACTS.USDC as `0x${string}`,
          abi: ABIS.ERC20,
          functionName: 'allowance',
          args: [target, CONTRACTS.ARC_IDENTITY as `0x${string}`]
        } as any) as bigint;

        if (currentAllowance < fee) {
          console.log(`[ArcRegister] Allowance insufficient (${currentAllowance.toString()}). Requesting approval...`);
          const approveHash = await writeContractAsync({
            address: CONTRACTS.USDC as `0x${string}`,
            abi: ABIS.ERC20,
            functionName: 'approve',
            args: [CONTRACTS.ARC_IDENTITY as `0x${string}`, fee],
            account: address,
            chain: arcTestnet
          });
          console.log(`[ArcRegister] Approval TX sent: ${approveHash}. Waiting for mining...`);
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
          console.log(`[ArcRegister] Approval mined. Waiting 2s for RPC sync...`);
          await new Promise(r => setTimeout(r, 2000)); // Crucial for testnets
        } else {
          console.log(`[ArcRegister] Existing allowance is sufficient: ${currentAllowance.toString()}`);
        }
      }

      // 3. Step 2: Registration
      const metadata = {
        name: `${username}.arc`,
        description: `ArcPass Identity: ${username}.arc`,
        image: customImage || `https://api.dicebear.com/7.x/identicon/png?seed=${username}`,
        external_url: `https://testnet.arcscan.app/address/${CONTRACTS.ARC_IDENTITY}`,
        attributes: [
          { trait_type: "Extension", value: ".arc" }
        ]
      };
      
      const jsonStr = JSON.stringify(metadata);
      const metadataURI = `data:application/json;base64,${btoa(unescape(encodeURIComponent(jsonStr)))}`;

      console.log(`[ArcRegister] Calling register("${username}", metadata)...`);
      const registerHash = await writeContractAsync({
        address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
        abi: ABIS.ARCPASS,
        functionName: 'register',
        args: [username, metadataURI],
        account: address,
        chain: arcTestnet
      } as any);

      console.log(`[ArcRegister] Registration TX sent: ${registerHash}`);
      return registerHash;
    } catch (err: any) {
      console.error('[ArcRegister] ERROR:', err);
      alert(`Transaction failed: ${err.shortMessage || err.message || 'Unknown error'}`);
      throw err;
    }
  }, [isConnected, address, writeContractAsync, publicClient, switchChainAsync]);

  // 3. Delete / Unregister Identity
  const deleteIdentity = useCallback(async (name: string) => {
    if (!isConnected || !address || !writeContractAsync || !publicClient || !switchChainAsync) throw new Error('Not connected');

    try {
      // Automatic Network Switch
      const chainId = await publicClient.getChainId();
      if (chainId !== arcTestnet.id) {
        await switchChainAsync({ chainId: arcTestnet.id });
        await new Promise(r => setTimeout(r, 1500));
      }

      // Remove the .arc suffix if present for the contract call
      const cleanName = name.replace('.arc', '');

      return await writeContractAsync({
        address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
        abi: ABIS.ARCPASS,
        functionName: 'unregister',
        args: [cleanName],
        account: address,
        chain: arcTestnet
      } as any);
    } catch (err) {
      console.error('Delete failed:', err);
      throw err;
    }
  }, [isConnected, address, writeContractAsync, publicClient, switchChainAsync]);

  // 3. Send USDC Payment (P2P)
  const sendUSDCPayment = useCallback(async (amount: string, recipientName: string) => {
    if (!isConnected || !publicClient || !switchChainAsync) throw new Error('Not connected');

    try {
      // 0. Automatic Network Switch
      const chainId = await publicClient.getChainId();
      if (chainId !== arcTestnet.id) {
        await switchChainAsync({ chainId: arcTestnet.id });
        await new Promise(r => setTimeout(r, 1500));
      }

      // 1. Real on-chain resolution
      const resolvedAddress = await resolveName(recipientName);
      if (!resolvedAddress) throw new Error('Could not resolve name');
      
      const amountBigInt = parseUnits(amount, 6); // USDC uses 6 decimals

      console.log(`[Payment] Sending ${amount} USDC to ${recipientName} (${resolvedAddress})`);

      return await writeContractAsync({
        address: CONTRACTS.USDC as `0x${string}`,
        abi: ABIS.ERC20,
        functionName: 'transfer',
        args: [resolvedAddress as `0x${string}`, amountBigInt],
        account: address,
        chain: arcTestnet,
      });
    } catch (err: any) {
      console.error('Payment failed:', err);
      throw err;
    }
  }, [isConnected, address, writeContractAsync, resolveName, publicClient, switchChainAsync]);

  const getOwnedIdentities = useCallback(async (ownerAddress: string): Promise<any[]> => {
    if (!publicClient || !ownerAddress) return [];
    const target = getAddress(ownerAddress);
    let allIdentities: any[] = [];

    try {
      // 1. Try Mature Way (Enumerable)
      const balance = await publicClient.readContract({
        address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
        abi: ABIS.ARCPASS,
        functionName: 'balanceOf',
        args: [target]
      } as any) as bigint;

      if (Number(balance) > 0) {
        const enumResults = await Promise.all(
          Array.from({ length: Number(balance) }).map(async (_, index) => {
            try {
              const tokenId = await publicClient.readContract({
                address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
                abi: ABIS.ARCPASS,
                functionName: 'tokenOfOwnerByIndex',
                args: [target, BigInt(index)]
              } as any) as bigint;

              const [name, uri] = await Promise.all([
                publicClient.readContract({
                  address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
                  abi: ABIS.ARCPASS,
                  functionName: 'getNameByTokenId',
                  args: [tokenId]
                } as any).catch(() => 'Unknown'),
                publicClient.readContract({
                  address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
                  abi: ABIS.ARCPASS,
                  functionName: 'tokenURI',
                  args: [tokenId]
                } as any).catch(() => '')
              ]) as [string, string];

              return {
                name,
                tokenId: tokenId.toString(),
                uri,
                image: (uri && uri.startsWith('data:application/json;base64,')) 
                  ? JSON.parse(atob(uri.split(',')[1])).image 
                  : `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`
              };
            } catch (e) { return null; }
          })
        );
        allIdentities = [...allIdentities, ...enumResults.filter(Boolean)];
      }
    } catch (e) { console.warn('Enumerable check failed'); }

    // 2. Always try Log way as backup/merge
    try {
      // 1. Get current block to limit range (RPC safety)
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock > 5000n ? currentBlock - 5000n : 0n;

      const logs = await publicClient.getLogs({
        address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
        event: getAbiItem({
          abi: ABIS.ARCPASS,
          name: 'IdentityRegistered',
        }),
        fromBlock,
        toBlock: 'latest'
      });

      const logResults = await Promise.all(
        logs
          .filter((log: any) => getAddress(log.args.owner) === target)
          .map(async (log: any) => {
            const name = log.args.name as string;
            const tokenId = log.args.tokenId as bigint;
            // Check if already found in enumerable
            if (allIdentities.some(id => id.name === name)) return null;

            try {
              const uri = await publicClient.readContract({
                address: CONTRACTS.ARC_IDENTITY as `0x${string}`,
                abi: ABIS.ARCPASS,
                functionName: 'tokenURI',
                args: [tokenId]
              } as any).catch(() => '') as string;

              return {
                name,
                tokenId: tokenId.toString(),
                uri,
                image: (uri && uri.startsWith('data:application/json;base64,')) 
                  ? JSON.parse(atob(uri.split(',')[1])).image 
                  : `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`
              };
            } catch {
              return { name, tokenId: tokenId.toString(), uri: '', image: `https://api.dicebear.com/7.x/identicon/svg?seed=${name}` };
            }
          })
      );
      allIdentities = [...allIdentities, ...logResults.filter(Boolean)];
    } catch (e) { console.error('Log fallback failed'); }

    // Remove duplicates by name
    return Array.from(new Map(allIdentities.map(id => [id.name, id])).values());
  }, [publicClient]);

  return {
    isConnected,
    address,
    isPending,
    isSuccess,
    txHash: hash,
    approveUSDC,
    registerIdentity,
    deleteIdentity,
    sendUSDCPayment,
    resolveName,
    getFee,
    getOwnedIdentities,
    getPrimaryName,
    publicClient
  };
};
