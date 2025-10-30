import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { isTelegram } from './telegram';

const CELO_SEPOLIA_CHAIN_ID = 11142220;

function getEnv(name: string): string | undefined {
  // Vite exposes envs with import.meta.env
  // but reading directly avoids type issues here
  return (import.meta as any).env[name];
}

export async function getBrowserProvider(): Promise<ethers.BrowserProvider> {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }

  // Fallback to WalletConnect (works inside Telegram)
  const projectId = getEnv('VITE_WALLETCONNECT_PROJECT_ID');
  const rpcUrl = getEnv('VITE_CELO_SEPOLIA_RPC_URL');
  if (!projectId || !rpcUrl) {
    if (isTelegram()) {
      throw new Error('WalletConnect not configured. Set VITE_WALLETCONNECT_PROJECT_ID and VITE_CELO_SEPOLIA_RPC_URL');
    }
    throw new Error('No wallet provider found. Please install MetaMask or configure WalletConnect');
  }

  const wcProvider = await EthereumProvider.init({
    projectId,
    showQrModal: true,
    chains: [CELO_SEPOLIA_CHAIN_ID],
    methods: ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData', 'eth_signTransaction', 'eth_accounts', 'eth_requestAccounts'],
    rpcMap: { [CELO_SEPOLIA_CHAIN_ID]: rpcUrl }
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


