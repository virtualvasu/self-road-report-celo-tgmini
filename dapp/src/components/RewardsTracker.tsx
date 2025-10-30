import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, TrendingUp, Award, ArrowLeft, RefreshCw, DollarSign, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { INCIDENT_MANAGER_ADDRESS, INCIDENT_MANAGER_ABI } from '../lib/contract';
import { getBrowserProvider } from '../lib/wallet';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface RewardedIncident {
  id: number;
  description: string;
  timestamp: Date;
  rewardAmount: string; // in CELO
  txHash?: string;
}

interface UserIncident {
  id: number;
  description: string;
  reportedBy: string;
  timestamp: Date;
  verified: boolean;
}

interface RewardsTrackerProps {
  onBack: () => void;
}

export default function RewardsTracker({ onBack }: RewardsTrackerProps) {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  
  const [rewardedIncidents, setRewardedIncidents] = useState<RewardedIncident[]>([]);
  const [totalRewards, setTotalRewards] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [userIncidents, setUserIncidents] = useState<UserIncident[]>([]);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [currentRewardAmount, setCurrentRewardAmount] = useState<string>('0.05'); // Default fallback

  const connectWallet = async () => {
    setIsConnectingWallet(true);
    setError('');
    try {
      const browserProvider = await getBrowserProvider();
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const signer = await browserProvider.getSigner();
      const contractInstance = new ethers.Contract(INCIDENT_MANAGER_ADDRESS, INCIDENT_MANAGER_ABI, signer);
      setContract(contractInstance);
      setWalletAddress(accounts[0]);
      setWalletConnected(true);
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setError(error?.message || "Failed to connect wallet. Please try again.");
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const fetchUserRewards = async () => {
    if (!contract || !walletAddress) return;

    setIsLoading(true);
    setError('');
    
    try {
      // Get total number of incidents
      const lastIncidentId = await contract.getLastIncidentId();
      const totalIncidents = Number(lastIncidentId);
      
      const userIncidentsList: UserIncident[] = [];
      const rewardedIncidentsList: RewardedIncident[] = [];
      let totalRewardsSum = 0;
      let verified = 0;
      let pending = 0;

      // Check all incidents to find ones reported by this user
      for (let i = 1; i <= totalIncidents; i++) {
        try {
          const incident = await contract.getIncident(i);
          const [id, description, reportedBy, timestamp, isVerified] = incident;
          
          // Check if this incident was reported by the current user
          if (reportedBy.toLowerCase() === walletAddress.toLowerCase()) {
            const incidentData = {
              id: Number(id),
              description,
              reportedBy,
              timestamp: new Date(Number(timestamp) * 1000),
              verified: isVerified
            };
            
            userIncidentsList.push(incidentData);
            
            if (isVerified) {
              verified++;
              // Get reward amount from contract
              const rewardAmount = await contract.rewardAmount();
              const rewardInCelo = ethers.formatEther(rewardAmount);
              totalRewardsSum += parseFloat(rewardInCelo);
              
              // Store the current reward amount for display
              setCurrentRewardAmount(rewardInCelo);
              
              rewardedIncidentsList.push({
                id: Number(id),
                description,
                timestamp: new Date(Number(timestamp) * 1000),
                rewardAmount: rewardInCelo
              });
            } else {
              pending++;
            }
          }
        } catch (incidentError) {
          console.error(`Error fetching incident ${i}:`, incidentError);
          // Continue with next incident
        }
      }

      setUserIncidents(userIncidentsList);
      setRewardedIncidents(rewardedIncidentsList);
      setTotalRewards(totalRewardsSum.toFixed(4));
      setVerifiedCount(verified);
      setPendingCount(pending);

    } catch (error) {
      console.error('Error fetching rewards:', error);
      setError('Failed to fetch rewards data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    if (walletConnected) {
      fetchUserRewards();
    }
  };

  // Auto-fetch rewards when wallet is connected
  useEffect(() => {
    if (walletConnected && contract && walletAddress) {
      fetchUserRewards();
    }
  }, [walletConnected, contract, walletAddress]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">My Rewards</h1>
              <p className="text-gray-600">Track your earnings from verified incidents</p>
            </div>

            <div className="w-24"> {/* Spacer for centering */}</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Wallet Connection */}
        {!walletConnected ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                Connect your wallet to view your incident rewards and earnings history.
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </div>
              )}

              <button
                onClick={connectWallet}
                disabled={isConnectingWallet}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isConnectingWallet ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Connected Wallet Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Wallet Connected</h3>
                    <p className="text-sm text-gray-600">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your rewards data...</p>
              </div>
            )}

            {/* Rewards Summary */}
            {!isLoading && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {/* Total Rewards */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Earned</p>
                        <p className="text-2xl font-bold text-gray-900">{totalRewards} CELO</p>
                      </div>
                    </div>
                  </div>

                  {/* Verified Incidents */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Verified</p>
                        <p className="text-2xl font-bold text-gray-900">{verifiedCount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pending Incidents */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Total Reports */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Reports</p>
                        <p className="text-2xl font-bold text-gray-900">{userIncidents.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Incidents List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Your Incident Reports</h3>
                    <p className="text-gray-600">Track the status and rewards of your submitted incidents</p>
                  </div>

                  {userIncidents.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Incidents Found</h3>
                      <p className="text-gray-600 mb-4">You haven't reported any incidents yet.</p>
                      <button
                        onClick={onBack}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        Report Your First Incident
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {userIncidents.map((incident) => (
                        <div key={incident.id} className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  Incident #{incident.id}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  incident.verified 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {incident.verified ? 'Verified & Rewarded' : 'Pending Verification'}
                                </span>
                              </div>
                              
                              <p className="text-gray-700 mb-3">{incident.description}</p>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(incident.timestamp)}</span>
                                </div>
                              </div>
                            </div>

                            {incident.verified && (
                              <div className="ml-6 text-right">
                                <div className="text-lg font-semibold text-green-600">
                                  +{rewardedIncidents.find(r => r.id === incident.id)?.rewardAmount || '0'} CELO
                                </div>
                                <div className="text-sm text-gray-500">Reward Earned</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reward Info */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">How Rewards Work</p>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Report incidents through the incident wizard</li>
                        <li>• Once verified by administrators, you automatically receive CELO rewards</li>
                        <li>• Current reward amount: {currentRewardAmount} CELO per verified incident</li>
                        <li>• Rewards are sent directly to your wallet address</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}