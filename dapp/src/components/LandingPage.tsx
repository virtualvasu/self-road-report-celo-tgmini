import { FileText, Shield, ArrowRight, BarChart3, Award } from 'lucide-react';

interface LandingPageProps {
  onReportIncident: () => void;
  onViewDashboard: () => void;
  onViewRewards: () => void;
}

export default function LandingPage({ onReportIncident, onViewDashboard, onViewRewards }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Road Incident Management System
            </h1>
            <p className="text-gray-600 text-lg mb-3">
              Professional incident reporting with blockchain verification and decentralized storage
            </p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm text-gray-500">Powered by</span>
              <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Celo
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What would you like to do?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from the options below to either report a new incident or search for details of a previously reported incident.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Report New Incident */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Report New Incident</h3>
              <p className="text-gray-600 mb-6">
                Create a comprehensive incident report with PDF generation, secure storage, and blockchain verification.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Professional PDF report generation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Secure IPFS storage via Storacha</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Blockchain verification and timestamping</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Photo evidence attachment support</span>
                </div>
              </div>

              <button
                onClick={onReportIncident}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-red-300 flex items-center justify-center space-x-2"
              >
                <span>Report New Incident</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* View Dashboard */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Incident Dashboard</h3>
              <p className="text-gray-600 mb-6">
                View the latest 10 incidents and search through all reported incidents with comprehensive details.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Latest 10 incidents overview</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Quick search by incident ID</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Verification status tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Real-time blockchain updates</span>
                </div>
              </div>

              <button
                onClick={onViewDashboard}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-green-300 flex items-center justify-center space-x-2"
              >
                <span>View Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* View My Rewards */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">My Rewards</h3>
              <p className="text-gray-600 mb-6">
                Connect your wallet to view your earnings from verified incident reports and track your rewards.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Total CELO rewards earned</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Verified vs pending incidents</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Detailed earnings breakdown</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Real-time reward tracking</span>
                </div>
              </div>

              <button
                onClick={onViewRewards}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-blue-300 flex items-center justify-center space-x-2"
              >
                <span>View My Rewards</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center space-y-2">
            <div>© 2025 Incident Management System - Secure • Decentralized • Professional</div>
            <div className="flex items-center space-x-2">
              <span>Powered by</span>
              <span className="font-semibold text-blue-600">Celo Network</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}