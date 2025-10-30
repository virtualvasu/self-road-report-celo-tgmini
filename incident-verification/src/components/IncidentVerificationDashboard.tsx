import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  Wallet, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar, 
  FileText, 
  Shield, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  DollarSign,
  Plus
} from 'lucide-react';
import { INCIDENT_MANAGER_ADDRESS, INCIDENT_MANAGER_ABI, type IncidentData } from '../lib/contract';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function IncidentVerificationDashboard() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Connect wallet function
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to continue");
      return;
    }

    setIsConnecting(true);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const signer = await browserProvider.getSigner();
      const contractInstance = new ethers.Contract(INCIDENT_MANAGER_ADDRESS, INCIDENT_MANAGER_ABI, signer);
      
      setContract(contractInstance);
      setWalletAddress(accounts[0]);
      setIsWalletConnected(true);

      // Check if connected address is the owner
      const ownerAddress = await contractInstance.owner();
      setIsOwner(ownerAddress.toLowerCase() === accounts[0].toLowerCase());

    } catch (error) {
      console.error('Wallet connection error:', error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Fetch all incidents
  const fetchIncidents = async () => {
    if (!contract) return;

    setIsLoading(true);
    try {
      const lastIncidentId = await contract.getLastIncidentId();
      const incidentPromises = [];

      for (let i = 1; i <= Number(lastIncidentId); i++) {
        incidentPromises.push(contract.getIncident(i));
      }

      const incidentResults = await Promise.all(incidentPromises);
      const formattedIncidents: IncidentData[] = incidentResults.map((result, index) => ({
        id: (index + 1).toString(),
        description: result[1],
        reportedBy: result[2],
        timestamp: new Date(Number(result[3]) * 1000).toLocaleString(),
        verified: result[4]
      }));

      setIncidents(formattedIncidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      alert('Failed to fetch incidents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify an incident
  const verifyIncident = async (incidentId: string) => {
    if (!contract || !isOwner) {
      alert('Only the contract owner can verify incidents.');
      return;
    }

    setIsVerifying(true);
    try {
      const tx = await contract.verifyIncident(incidentId);
      await tx.wait();
      
      // Refresh incidents after verification
      await fetchIncidents();
      
      // Update selected incident if it was the one verified
      if (selectedIncident && selectedIncident.id === incidentId) {
        setSelectedIncident({
          ...selectedIncident,
          verified: true
        });
      }

      alert('Incident verified successfully!');
    } catch (error) {
      console.error('Error verifying incident:', error);
      alert('Failed to verify incident. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Fetch incidents when contract is available
  useEffect(() => {
    if (contract) {
      fetchIncidents();
    }
  }, [contract]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Incident Verification Dashboard</h1>
                <p className="text-gray-600">Admin panel for verifying reported incidents</p>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {!isWalletConnected ? (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      <span>Connect Wallet</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        {formatAddress(walletAddress)}
                      </span>
                    </div>
                  </div>
                  {isOwner && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Owner
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Owner status warning */}
          {isWalletConnected && !isOwner && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  You are not the contract owner. Only the owner can verify incidents.
                </span>
              </div>
            </div>
          )}
        </div>

        {isWalletConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Incidents List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">All Incidents</h2>
                    <button
                      onClick={fetchIncidents}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 flex items-center space-x-1"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      <span className="text-sm">Refresh</span>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading incidents...</p>
                    </div>
                  ) : incidents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No incidents found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {incidents.map((incident) => (
                        <div
                          key={incident.id}
                          onClick={() => setSelectedIncident(incident)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedIncident?.id === incident.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  Incident #{incident.id}
                                </span>
                                {incident.verified ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                {incident.description.startsWith('http') ? (
                                  <a
                                    href={incident.description}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline break-all line-clamp-2"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {incident.description}
                                  </a>
                                ) : (
                                  <span className="line-clamp-2 break-words">
                                    {incident.description}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  <span>{formatAddress(incident.reportedBy)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{incident.timestamp}</span>
                                </span>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Incident Details */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-4">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Incident Details</h2>
                </div>

                <div className="p-6">
                  {selectedIncident ? (
                    <div className="space-y-4">
                      {/* Status */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
                        {selectedIncident.verified ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-4 h-4 mr-2" />
                            Pending Verification
                          </span>
                        )}
                      </div>

                      {/* Incident ID */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Incident ID</label>
                        <p className="text-sm text-gray-900">#{selectedIncident.id}</p>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {selectedIncident.description.startsWith('http') ? (
                            <a
                              href={selectedIncident.description}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline break-all"
                            >
                              {selectedIncident.description}
                            </a>
                          ) : (
                            <span className="break-words">
                              {selectedIncident.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Reported By */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Reported By</label>
                        <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                          {selectedIncident.reportedBy}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Reported At</label>
                        <p className="text-sm text-gray-900">{selectedIncident.timestamp}</p>
                      </div>

                      {/* Verify Button */}
                      {!selectedIncident.verified && isOwner && (
                        <div className="pt-4 border-t border-gray-200">
                          <button
                            onClick={() => verifyIncident(selectedIncident.id)}
                            disabled={isVerifying}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            {isVerifying ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Verifying...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Mark as Verified</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {!selectedIncident.verified && !isOwner && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              Only the contract owner can verify incidents
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Select an incident to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}