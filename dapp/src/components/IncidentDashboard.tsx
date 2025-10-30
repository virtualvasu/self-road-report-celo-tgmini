import { useState, useEffect } from 'react';
import { Search, ArrowLeft, FileText, User, Clock, Hash, ExternalLink, AlertCircle, Loader, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';
import { ethers } from 'ethers';
import { INCIDENT_MANAGER_ADDRESS, INCIDENT_MANAGER_ABI, type IncidentData } from '../lib/contract';

declare global {
    interface Window {
        ethereum?: any;
    }
}

interface IncidentDashboardProps {
  onBack: () => void;
}

export default function IncidentDashboard({ onBack }: IncidentDashboardProps) {
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchId, setSearchId] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<IncidentData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Load latest 10 incidents on component mount
  useEffect(() => {
    loadLatestIncidents();
  }, []);

  const loadLatestIncidents = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask to view incidents');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(INCIDENT_MANAGER_ADDRESS, INCIDENT_MANAGER_ABI, browserProvider);
      
      // Get the last incident ID
      const lastIncidentId = await contract.getLastIncidentId();
      const lastId = Number(lastIncidentId);
      
      if (lastId === 0) {
        setIncidents([]);
        setIsLoading(false);
        return;
      }

      // Calculate the range for the latest 10 incidents
      const startId = Math.max(1, lastId - 9); // Get last 10 or all if less than 10
      const incidentPromises = [];

      // Fetch incidents from newest to oldest
      for (let i = lastId; i >= startId; i--) {
        incidentPromises.push(
          contract.getIncident(i).then((data: any) => ({
            id: data[0].toString(),
            description: data[1],
            reportedBy: data[2],
            timestamp: new Date(Number(data[3]) * 1000).toLocaleString(),
            verified: data[4],
            ipfsUrl: data[1] // The description field contains the IPFS URL
          }))
        );
      }

      const fetchedIncidents = await Promise.all(incidentPromises);
      setIncidents(fetchedIncidents);
    } catch (err: any) {
      console.error('Error loading incidents:', err);
      setError('Failed to load incidents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setSearchError('Please enter an incident ID');
      return;
    }

    if (!window.ethereum) {
      setSearchError('Please install MetaMask to search incidents');
      return;
    }

    setIsSearching(true);
    setSearchError('');

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(INCIDENT_MANAGER_ADDRESS, INCIDENT_MANAGER_ABI, browserProvider);
      
      const data = await contract.getIncident(Number(searchId));
      
      if (data[0].toString() === '0') {
        setSearchError('Incident not found. Please check the ID and try again.');
        return;
      }

      const formattedData: IncidentData = {
        id: data[0].toString(),
        description: data[1],
        reportedBy: data[2],
        timestamp: new Date(Number(data[3]) * 1000).toLocaleString(),
        verified: data[4],
        ipfsUrl: data[1] // The description field contains the IPFS URL
      };

      setSelectedIncident(formattedData);
    } catch (err: any) {
      console.error('Search error:', err);
      if (err.message.includes('execution reverted')) {
        setSearchError('Incident not found. Please check the ID and try again.');
      } else {
        setSearchError('Failed to search incident. Please try again.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleIncidentClick = (incident: IncidentData) => {
    setSelectedIncident(incident);
  };

  const handleBackToList = () => {
    setSelectedIncident(null);
    setSearchId('');
    setSearchError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // If an incident is selected, show the detail view
  if (selectedIncident) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToList}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Incident Details
              </h1>
              <div className="w-32"></div> {/* Spacer for centering */}
            </div>
          </div>
        </header>

        {/* Incident Detail Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <FileText className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Incident Details</h3>
              <span className="ml-auto inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Found
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Hash className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Incident ID</span>
                    <p className="text-2xl font-bold text-gray-900">#{selectedIncident.id}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Reported On</span>
                    <p className="text-gray-900">{selectedIncident.timestamp}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Reported By</span>
                    <p className="text-gray-900 font-mono text-sm">
                      {selectedIncident.reportedBy.slice(0, 6)}...{selectedIncident.reportedBy.slice(-4)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Verification Status</span>
                    <div className="flex items-center space-x-2 mt-1">
                      {selectedIncident.verified ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 font-semibold">Verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-amber-600" />
                          <span className="text-amber-600 font-semibold">Pending Verification</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* IPFS Link */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700">Stored Report (IPFS)</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Decentralized
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <code className="text-sm text-gray-900 break-all pr-4">
                    {selectedIncident.ipfsUrl}
                  </code>
                  <a
                    href={selectedIncident.ipfsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                  >
                    <span>View Report</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className={`mt-6 p-4 border rounded-lg ${
              selectedIncident.verified 
                ? 'bg-green-50 border-green-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-start space-x-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  selectedIncident.verified 
                    ? 'bg-green-600' 
                    : 'bg-amber-600'
                }`}>
                  <span className="text-white text-xs font-bold">
                    {selectedIncident.verified ? '✓' : '!'}
                  </span>
                </div>
                <div className={`text-sm ${
                  selectedIncident.verified 
                    ? 'text-green-800' 
                    : 'text-amber-800'
                }`}>
                  <p className="font-medium">
                    {selectedIncident.verified 
                      ? 'Verified Incident Report' 
                      : 'Pending Verification'}
                  </p>
                  <p>
                    {selectedIncident.verified 
                      ? 'This incident has been verified by the contract owner and permanently recorded on the blockchain with IPFS storage, ensuring its authenticity and immutability.'
                      : 'This incident has been recorded on the blockchain and stored on IPFS, but is awaiting verification by the contract owner.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Incident Dashboard
            </h1>
            <button
              onClick={loadLatestIncidents}
              disabled={isLoading}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Specific Incident</h2>
          <div className="flex space-x-3">
            <input
              type="number"
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                setSearchError('');
              }}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Enter incident ID (e.g., 1, 2, 3...)"
              min="1"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              {isSearching ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{isSearching ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
          {searchError && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-800 text-sm">{searchError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Latest Incidents Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Latest Incidents</h2>
              <span className="text-sm text-gray-500">
                Showing latest {incidents.length} incidents
              </span>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-12 text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading incidents...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-12 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
              <p className="text-red-800">{error}</p>
              <button
                onClick={loadLatestIncidents}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No Incidents State */}
          {!isLoading && !error && incidents.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No incidents reported yet</p>
            </div>
          )}

          {/* Incidents List */}
          {!isLoading && !error && incidents.length > 0 && (
            <div className="divide-y divide-gray-200">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  onClick={() => handleIncidentClick(incident)}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          Incident #{incident.id}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {incident.verified ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-xs font-medium text-green-600">Verified</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-amber-600" />
                              <span className="text-xs font-medium text-amber-600">Pending</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{incident.timestamp}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span className="font-mono">
                            {incident.reportedBy.slice(0, 6)}...{incident.reportedBy.slice(-4)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}