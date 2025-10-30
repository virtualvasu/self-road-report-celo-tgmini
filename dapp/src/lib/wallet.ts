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

export async function getBrowserProvider(): Promise<ethers.BrowserProvider> {
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

  const wcProvider = await EthereumProvider.init({
    projectId,
    showQrModal: true,
    chains: [CELO_SEPOLIA_CHAIN_ID],
    methods: ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData', 'eth_signTransaction', 'eth_accounts', 'eth_requestAccounts'],
    rpcMap: { [CELO_SEPOLIA_CHAIN_ID]: effectiveRpcUrl }
  });

  await wcProvider.enable();
  return new ethers.BrowserProvider(wcProvider as unknown as any);
}

export async function connectWalletAndGetContract(address: string, abi: any): Promise<{
  walletAddress: string;
  contract: ethers.Contract;
  provider: ethers.BrowserProvider;
}> {
  const provider = await getBrowserProvider();
  const accounts = await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(address, abi, signer);
  return { walletAddress: accounts[0], contract, provider };
}


