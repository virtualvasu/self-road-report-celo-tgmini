// IncidentManager Contract Configuration
// This file contains the contract address and ABI for the IncidentManager contract

import { ethers } from 'ethers';
import { connectWalletAndGetContract } from './wallet';

export const INCIDENT_MANAGER_ADDRESS = "0x34b6921bfe6c4933a1Af79b5f36A5b6e28B1a081";

export const INCIDENT_MANAGER_ABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "receive",
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getContractBalance",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getIncident",
    "inputs": [
      {
        "name": "_id",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getLastIncidentId",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "incidentCounter",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "incidents",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "description",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "reportedBy",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "verified",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "reportIncident",
    "inputs": [
      {
        "name": "_description",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "rewardAmount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "rewardClaimed",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "setRewardAmount",
    "inputs": [
      {
        "name": "_amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "verifyIncident",
    "inputs": [
      {
        "name": "_id",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawFunds",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "IncidentReported",
    "inputs": [
      {
        "name": "id",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "description",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "reportedBy",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "IncidentVerified",
    "inputs": [
      {
        "name": "id",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "verifiedBy",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RewardPaid",
    "inputs": [
      {
        "name": "incidentId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "reporter",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  }
] as const;

// Export types for TypeScript support
export type IncidentManagerContract = {
    address: typeof INCIDENT_MANAGER_ADDRESS;
    abi: typeof INCIDENT_MANAGER_ABI;
};

// Helper function to get contract configuration
export const getIncidentManagerContract = (): IncidentManagerContract => ({
    address: INCIDENT_MANAGER_ADDRESS,
    abi: INCIDENT_MANAGER_ABI,
});

// Contract interface for better type safety
export interface Incident {
    id: bigint;
    description: string;
    reportedBy: string;
    timestamp: bigint;
    verified: boolean;
}

export interface IncidentData {
    id: string;
    description: string;
    reportedBy: string;
    timestamp: string;
    verified: boolean;
    ipfsUrl: string;
}

// Utility functions for contract interactions
export const connectWalletAndContract = async (): Promise<{
    walletAddress: string;
    contract: ethers.Contract;
    provider: ethers.BrowserProvider;
} | null> => {
    try {
        const { walletAddress, contract, provider } = await connectWalletAndGetContract(
            INCIDENT_MANAGER_ADDRESS,
            INCIDENT_MANAGER_ABI
        );
        return { walletAddress, contract, provider };
    } catch (error) {
        console.error('Wallet connection error:', error);
        throw error;
    }
};

export const getUserIncidents = async (
    contract: ethers.Contract,
    userAddress: string
): Promise<Incident[]> => {
    const lastIncidentId = await contract.getLastIncidentId();
    const totalIncidents = Number(lastIncidentId);
    
    const userIncidents: Incident[] = [];
    
    for (let i = 1; i <= totalIncidents; i++) {
        try {
            const incident = await contract.getIncident(i);
            const [id, description, reportedBy, timestamp, verified] = incident;
            
            if (reportedBy.toLowerCase() === userAddress.toLowerCase()) {
                userIncidents.push({
                    id: BigInt(id),
                    description,
                    reportedBy,
                    timestamp: BigInt(timestamp),
                    verified
                });
            }
        } catch (error) {
            console.error(`Error fetching incident ${i}:`, error);
        }
    }
    
    return userIncidents;
};

export const calculateUserRewards = async (
    contract: ethers.Contract,
    userIncidents: Incident[]
): Promise<{
    totalRewards: string;
    verifiedCount: number;
    pendingCount: number;
    rewardAmount: string;
}> => {
    const rewardAmount = await contract.rewardAmount();
    const rewardInCelo = ethers.formatEther(rewardAmount);
    
    const verifiedIncidents = userIncidents.filter(incident => incident.verified);
    const pendingIncidents = userIncidents.filter(incident => !incident.verified);
    
    const totalRewards = (parseFloat(rewardInCelo) * verifiedIncidents.length).toFixed(4);
    
    return {
        totalRewards,
        verifiedCount: verifiedIncidents.length,
        pendingCount: pendingIncidents.length,
        rewardAmount: rewardInCelo
    };
};

// Global window interface for MetaMask
declare global {
    interface Window {
        ethereum?: any;
    }
}