import React, { useState, useEffect, useCallback } from 'react';
import { useArc } from '../hooks/useArc';
import { 
  User, 
  Wallet, 
  History as HistoryIcon, 
  ArrowDownLeft, 
  ArrowUpRight,
  RefreshCcw,
  Lock,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { formatUnits, getAddress, getAbiItem } from 'viem';
import { ABIS, CONTRACTS } from '../config/wagmi';

interface HistoryItem {
  hash: string;
  from: string;
  to: string;
  amount: string;
  type: 'sent' | 'received';
  name: string | null;
  timestamp: number; // Raw unix timestamp for sorting
}

interface IdentityItem {
  name: string;
  image: string;
  tokenId: string;
  uri: string;
}

const MyProfile: React.FC = () => {
  const { isConnected, address, publicClient, getOwnedIdentities, deleteIdentity, isPending, getPrimaryName } = useArc();
  const [identities, setIdentities] = useState<IdentityItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}.arc on-chain?`)) return;
    try {
      await deleteIdentity(name);
      loadProfileData(); // Refresh after delete
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const loadProfileData = useCallback(async () => {
    if (!isConnected || !address || !publicClient) return;
    setIsLoading(true);
    
    try {
      // 1. Get Identities
      const ids = await getOwnedIdentities(address);
      setIdentities(ids);

      // 2. Get Transaction History (USDC Transfers) - Chunked fetching
      const currentBlock = await publicClient.getBlockNumber();
      const CHUNK_SIZE = 10000n;
      const TOTAL_SCAN = 50000n;
      const userAddr = getAddress(address);
      
      let allSentLogs: any[] = [];
      let allReceivedLogs: any[] = [];
      
      for (let i = 0n; i < TOTAL_SCAN / CHUNK_SIZE; i++) {
        const toBlock = currentBlock - (i * CHUNK_SIZE);
        const fromBlock = toBlock - CHUNK_SIZE > 0n ? toBlock - CHUNK_SIZE : 0n;
        
        if (toBlock <= 0n) break;

        const [sentLogs, receivedLogs] = await Promise.all([
          publicClient.getLogs({
            address: CONTRACTS.USDC as `0x${string}`,
            event: getAbiItem({ abi: ABIS.ERC20, name: 'Transfer' }),
            args: { from: userAddr } as any,
            fromBlock,
            toBlock
          }),
          publicClient.getLogs({
            address: CONTRACTS.USDC as `0x${string}`,
            event: getAbiItem({ abi: ABIS.ERC20, name: 'Transfer' }),
            args: { to: userAddr } as any,
            fromBlock,
            toBlock
          })
        ]);
        
        allSentLogs = [...allSentLogs, ...sentLogs.map((l: any) => ({ ...l, role: 'sent' }))];
        allReceivedLogs = [...allReceivedLogs, ...receivedLogs.map((l: any) => ({ ...l, role: 'received' }))];
        
        if (fromBlock === 0n) break;
      }
      const allLogs = [...allSentLogs, ...allReceivedLogs];
      
      const newHistoryItems = await Promise.all(
        allLogs.map(async (log: any) => {
          const from = getAddress(log.args.from);
          const to = getAddress(log.args.to);
          const role = log.role;
          const isSent = role === 'sent';

          // Determine type based on the log's original source if possible, 
          // but here we can just create two items if it's a self-transfer later,
          // or just rely on the fact that we'll have two logs.
          // Wait, if it's a self-transfer, it's in both sentLogs and receivedLogs.
          // Let's keep the type based on which list it came from? 
          // No, allLogs is a flat array. Let's determine type by its role.
          
          // If a log is in allLogs twice (self-transfer), we need to know which role it's playing.
          // Actually, let's just create the item and the type will be 'sent' if from == userAddr.
          // But if it's both, we should probably have two items.
          
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          const otherParty = isSent ? to : from;
          const name = await getPrimaryName(otherParty).catch(() => null);

          return {
            type: isSent ? 'sent' : 'received',
            amount: formatUnits(log.args.value, 6),
            to: isSent ? (to === userAddr ? 'Self (Me)' : (name ? `${name}.arc` : `${to.slice(0, 6)}...${to.slice(-4)}`)) : 'Me',
            from: isSent ? 'Me' : (from === userAddr ? 'Self (Me)' : (name ? `${name}.arc` : `${from.slice(0, 6)}...${from.slice(-4)}`)),
            timestamp: Number(block.timestamp),
            hash: log.transactionHash,
            blockNumber: Number(log.blockNumber)
          };
        })
      );

      // --- PERSISTENCE LOGIC ---
      const cacheKey = `arc_history_${userAddr.toLowerCase()}`;
      const cachedData = JSON.parse(localStorage.getItem(cacheKey) || '[]');
      
      // Merge and remove duplicates by transaction hash AND type 
      const mergedHistory = [...newHistoryItems, ...cachedData];
      const uniqueHistory = Array.from(
        new Map(mergedHistory.map(item => [`${item.hash}_${item.type}`, item])).values()
      ) as (HistoryItem & { blockNumber?: number })[];
      
      // Sort by latest first (timestamp then blockNumber)
      const sortedHistory = uniqueHistory.sort((a, b) => {
        if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
        return (b.blockNumber || 0) - (a.blockNumber || 0);
      });

      localStorage.setItem(cacheKey, JSON.stringify(sortedHistory));
      setHistory(sortedHistory);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, publicClient, getOwnedIdentities, getPrimaryName]);

  // Initialize from cache on mount
  useEffect(() => {
    if (isConnected && address) {
      const cacheKey = `arc_history_${address.toLowerCase()}`;
      const cachedData = JSON.parse(localStorage.getItem(cacheKey) || '[]');
      if (cachedData.length > 0) setHistory(cachedData);
      
      loadProfileData();
      
      const timer = setTimeout(loadProfileData, 4000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, address, loadProfileData]);

  if (!isConnected) {
    return (
      <section className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="glass-panel p-10 rounded-[3rem] text-center max-w-md w-full">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/10">
            <Lock className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="font-orbitron font-black text-2xl text-white mb-4 uppercase tracking-tighter">Vault Locked</h2>
          <p className="font-syne text-slate-500 mb-8 leading-relaxed">
            Please connect your wallet to access your ArcPass identities and secure payment history.
          </p>
        </div>
      </section>
    );
  }

  const receivedPayments = history.filter(h => h.type === 'received');
  const sentPayments = history.filter(h => h.type === 'sent');

  return (
    <section id="profile" className="py-16 px-2 sm:px-6 relative overflow-hidden w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-12 sm:mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[0.6rem] text-emerald-500 font-bold uppercase tracking-widest">Verified Identity</span>
            </div>
            <h1 className="font-orbitron font-black text-[clamp(2.2rem,6vw,4.5rem)] text-white leading-none tracking-tighter uppercase">My Profile</h1>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 sm:px-4 py-2 rounded-2xl w-fit backdrop-blur-md">
              <Wallet className="w-4 h-4 text-arc-cyan" />
              <span className="font-mono text-[0.65rem] sm:text-[0.7rem] text-slate-400">{address?.slice(0, 8)}...{address?.slice(-6)}</span>
            </div>
          </div>
          <button 
            onClick={loadProfileData}
            disabled={isLoading}
            className="neon-btn w-full sm:w-auto px-8 py-4 rounded-2xl font-orbitron font-bold text-xs tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            REFRESH DATA
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-panel rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
              <div className="p-4 sm:p-8 border-b border-white/5 bg-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-arc-violet/10 flex items-center justify-center text-arc-violet border border-arc-violet/20 flex-shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-orbitron font-bold text-lg text-white uppercase tracking-tight truncate">Identity Vault</h3>
                  <p className="font-syne text-[0.65rem] text-slate-500 uppercase tracking-widest truncate">Your Claimed .arc Names</p>
                </div>
              </div>
              
              <div className="p-4 sm:p-8 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {identities.length > 0 ? (
                  identities.map((id, idx) => (
                    <div key={idx} className="group relative p-4 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-arc-cyan/40 transition-all">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-5 min-w-0">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 overflow-hidden border border-white/10 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                            <img src={id.image} alt={id.name} className="w-full h-full object-cover opacity-60" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-orbitron font-black text-sm sm:text-base text-white group-hover:text-arc-cyan transition-colors truncate">{id.name}.arc</h4>
                            <p className="font-mono text-[0.55rem] sm:text-[0.6rem] text-slate-500 uppercase tracking-widest mt-1 truncate max-w-[120px] sm:max-w-none">ID: {id.tokenId.slice(0, 8)}...</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDelete(id.name)}
                          disabled={isPending}
                          className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-30 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center opacity-30 italic font-syne text-sm text-slate-500">
                    No identities claimed yet.
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-emerald-500/[0.02] flex flex-col max-h-[500px]">
              <div className="p-4 sm:p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                    <ArrowDownLeft className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-orbitron font-bold text-base sm:text-lg text-white uppercase tracking-tight truncate">Received</h3>
                    <p className="font-syne text-[0.6rem] sm:text-[0.65rem] text-slate-500 uppercase tracking-widest truncate">Incoming History</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                  <span className="font-orbitron font-bold text-[0.7rem] text-emerald-400">{receivedPayments.length} TX</span>
                </div>
              </div>
              <div className="p-4 sm:p-8 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                {receivedPayments.length > 0 ? (
                  receivedPayments.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                            <ArrowDownLeft className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono text-[0.65rem] sm:text-[0.7rem] text-white truncate max-w-[150px] sm:max-w-none">{item.from}</p>
                            <p className="font-syne text-[0.55rem] sm:text-[0.6rem] text-slate-500 uppercase">
                              {typeof item.timestamp === 'number' 
                                ? new Date(item.timestamp * 1000).toLocaleDateString() 
                                : item.timestamp}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <p className="font-orbitron font-bold text-sm sm:text-base text-emerald-400">+{item.amount}</p>
                          <a 
                            href={`https://testnet.arcscan.app/tx/${item.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all flex-shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center opacity-30 italic font-syne text-sm text-slate-500">
                    No incoming payments.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="glass-panel rounded-[2rem] sm:rounded-[3rem] overflow-hidden flex flex-col h-full max-h-[800px]">
              <div className="p-4 sm:p-10 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-arc-cyan/10 flex items-center justify-center text-arc-cyan border border-arc-cyan/20 flex-shrink-0">
                    <HistoryIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-orbitron font-black text-xl sm:text-2xl text-white uppercase tracking-tight truncate">Sent History</h3>
                    <p className="font-syne text-[0.7rem] sm:text-sm text-slate-500 truncate">Detailed record of outgoing payments</p>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-arc-cyan/10 border border-arc-cyan/20 flex-shrink-0">
                  <span className="font-orbitron font-black text-[0.6rem] sm:text-xs text-arc-cyan">{sentPayments.length} TRANSACTIONS</span>
                </div>
              </div>
 
              <div className="p-4 sm:p-10 flex-1 overflow-y-auto custom-scrollbar">
                {sentPayments.length > 0 ? (
                  <div className="space-y-6">
                    {sentPayments.map((item, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-arc-cyan/20 transition-all group">
                        <div className="flex items-center gap-6 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-arc-cyan transition-colors flex-shrink-0">
                            <ArrowUpRight className="w-6 h-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-orbitron font-bold text-sm sm:text-base text-white uppercase tracking-tight truncate">To: {item.to}</p>
                            <p className="font-mono text-[0.55rem] sm:text-[0.65rem] text-slate-500 uppercase tracking-widest mt-1 truncate max-w-[150px] sm:max-w-none">TX: {item.hash}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0">
                          <div className="text-left md:text-right">
                            <p className="font-orbitron font-black text-lg sm:text-xl text-white">-{item.amount} USDC</p>
                            <p className="font-syne text-[0.55rem] sm:text-[0.6rem] text-slate-500 uppercase tracking-widest mt-1">
                              {typeof item.timestamp === 'number'
                                ? new Date(item.timestamp * 1000).toLocaleDateString()
                                : item.timestamp}
                            </p>
                          </div>
                          <a 
                            href={`https://testnet.arcscan.app/tx/${item.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-arc-cyan hover:bg-arc-cyan/10 border border-white/5 transition-all flex-shrink-0"
                            title="View on Explorer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center opacity-30">
                    <HistoryIcon className="w-16 h-16 mx-auto mb-6 text-slate-500" />
                    <p className="font-syne text-lg italic text-slate-500">No outgoing payments recorded.</p>
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};

export default MyProfile;
