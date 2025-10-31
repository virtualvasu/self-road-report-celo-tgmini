import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';
// import { isTelegram } from './telegram';

const CELO_SEPOLIA_CHAIN_ID = 11142220;
// Temporary manual fallback per user request
const HARDCODED_WC_PROJECT_ID = '1174ede79de62e9003540b998b2a1c15';
const DEFAULT_CELO_SEPOLIA_RPC = 'https://forno.celo-sepolia.celo-testnet.org';

function getEnv(name: string): string | undefined {
  // Vite exposes envs with import.meta.env
  const viteVal = (import.meta as any)?.env?.[name];
  const procVal = (typeof process !== 'undefined' ? (process as any).env?.[name] : undefined);
  const val = viteVal ?? procVal;
  return val === '' ? undefined : val;
}

// Clear any cached WalletConnect session
export async function clearWalletConnectCache(): Promise<void> {
  // Clear cached provider
  if ((window as any).__wcBrowserProvider) {
    (window as any).__wcBrowserProvider = undefined;
  }
  
  // Clear WalletConnect storage/localStorage
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('wc@') || key.includes('walletconnect')) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn('[wallet] Could not clear localStorage', e);
  }
}

export async function getBrowserProvider(forceNew = false): Promise<ethers.BrowserProvider> {
  // Force WalletConnect everywhere (desktop/mobile/Telegram)
  const projectId = getEnv('VITE_WALLETCONNECT_PROJECT_ID') || HARDCODED_WC_PROJECT_ID;
  const rpcUrl = getEnv('VITE_CELO_SEPOLIA_RPC_URL');

  // Safe debug diagnostics (does not print secrets)
  if (typeof window !== 'undefined') {
    console.log('[wallet] Env presence:', {
      VITE_WALLETCONNECT_PROJECT_ID_present: Boolean(projectId),
      VITE_CELO_SEPOLIA_RPC_URL_present: Boolean(rpcUrl)
    });
  }

  if (!projectId) {
    throw new Error('WalletConnect not configured. Missing VITE_WALLETCONNECT_PROJECT_ID');
  }

  const effectiveRpcUrl = rpcUrl || DEFAULT_CELO_SEPOLIA_RPC;
  if (!rpcUrl && typeof window !== 'undefined') {
    console.warn('[wallet] VITE_CELO_SEPOLIA_RPC_URL not set. Falling back to default Celo Sepolia RPC');
  }

  // Clear cache if forcing new connection
  if (forceNew) {
    await clearWalletConnectCache();
  }

  // Check for cached provider - but only if not forcing new connection
  if (!forceNew && (window as any).__wcBrowserProvider) {
    // Check if the provider still has an active session
    try {
      const cached = (window as any).__wcBrowserProvider;
      const accounts = await cached.send('eth_accounts', []);
      if (accounts && accounts.length > 0) {
        // Session is still active, return cached
        return cached;
      }
    } catch (e) {
      // Session expired, clear cache and create new
      console.log('[wallet] Cached session expired, creating new connection');
      await clearWalletConnectCache();
    }
  }

  const wcProvider = await EthereumProvider.init({
    projectId,
    showQrModal: true, // Always show QR modal for wallet selection
    chains: [CELO_SEPOLIA_CHAIN_ID],
    methods: ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData', 'eth_signTransaction', 'eth_accounts', 'eth_requestAccounts'],
    rpcMap: { [CELO_SEPOLIA_CHAIN_ID]: effectiveRpcUrl },
    metadata: {
      name: 'SafeRoads DAO',
      description: 'Incident Reporting System',
      url: window.location.origin,
      icons: []
    }
  });

  // Check if already connected - if so, disconnect to force fresh connection
  if (wcProvider.session) {
    console.log('[wallet] Existing session found, disconnecting to force wallet selection');
    try {
      await wcProvider.disconnect();
    } catch (e) {
      console.warn('[wallet] Error disconnecting existing session', e);
    }
  }

  await wcProvider.enable();
  const browserProvider = new ethers.BrowserProvider(wcProvider as unknown as any);

  // Cache and handle disconnects
  (window as any).__wcBrowserProvider = browserProvider;
  try {
    (wcProvider as any).on?.('disconnect', () => {
      console.warn('[wallet] WalletConnect disconnected. Clearing cached provider');
      (window as any).__wcBrowserProvider = undefined;
    });
  } catch {}

  return browserProvider;
}

export async function connectWalletAndGetContract(address: string, abi: any, forceNewConnection = true): Promise<{
  walletAddress: string;
  contract: ethers.Contract;
  provider: ethers.BrowserProvider;
}> {
  const provider = await getBrowserProvider(forceNewConnection);
  const accounts = await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(address, abi, signer);
  return { walletAddress: accounts[0], contract, provider };
}

export function getReadOnlyProvider(): ethers.JsonRpcProvider {
  const rpcUrl = getEnv('VITE_CELO_SEPOLIA_RPC_URL') || DEFAULT_CELO_SEPOLIA_RPC;
  return new ethers.JsonRpcProvider(rpcUrl, CELO_SEPOLIA_CHAIN_ID);
}

export function getServerSigner(): ethers.Wallet {
  // Debug: Check what env vars are available
  if (typeof window !== 'undefined') {
    const metaEnv = (import.meta as any)?.env;
    console.log('[wallet] import.meta.env keys:', metaEnv ? Object.keys(metaEnv).filter(k => k.startsWith('VITE_')) : 'N/A');
    console.log('[wallet] VITE_SERVER_PRIVATE_KEY present:', Boolean(metaEnv?.VITE_SERVER_PRIVATE_KEY));
  }

  const privateKey = getEnv('VITE_SERVER_PRIVATE_KEY')|| '0xb9610c3d1f90bd9ab6484b6e4d46dcfd2ff4b4a6567734aac03b2f1829771ebd';
  if (!privateKey || privateKey.trim() === '') {
    throw new Error(
      'VITE_SERVER_PRIVATE_KEY not set or empty. ' +
      'For Vercel: Set it in Project Settings > Environment Variables. ' +
      'Make sure it starts with VITE_ and redeploy after adding it.'
    );
  }
  const rpcUrl = getEnv('VITE_CELO_SEPOLIA_RPC_URL') || DEFAULT_CELO_SEPOLIA_RPC;
  const provider = new ethers.JsonRpcProvider(rpcUrl, CELO_SEPOLIA_CHAIN_ID);
  return new ethers.Wallet(privateKey, provider);
}


