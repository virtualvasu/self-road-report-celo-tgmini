import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Hash, Clock, User, FileText, Shield } from 'lucide-react';
import { ethers } from 'ethers';
import { getServerSigner, getReadOnlyProvider } from '../../lib/wallet';
import { INCIDENT_MANAGER_ADDRESS, INCIDENT_MANAGER_ABI } from '../../lib/contract';

declare global {
  interface Window {
    ethereum?: any;
  }
}interface ContractSubmissionStepProps {
  pdfCID: string;
  contract?: ethers.Contract;
  walletAddress: string;
  onNext: (contractData: any) => void;
  onBack: () => void;
}

export default function ContractSubmissionStep({ pdfCID, walletAddress, onNext, onBack }: ContractSubmissionStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [contractData, setContractData] = useState<any>(null);

  const handleSubmitToContract = async () => {
    setIsSubmitting(true);
    try {
      // Sign transaction using private key from env (client-side)
      const signer = getServerSigner();
      const contractWithSigner = new ethers.Contract(INCIDENT_MANAGER_ADDRESS, INCIDENT_MANAGER_ABI, signer);
      
      const tx = await contractWithSigner.reportIncident(pdfCID);
      const receipt = await tx.wait();

      // Get incident ID from contract
      let incidentId: string | undefined;
      try {
        const readProvider = getReadOnlyProvider();
        const readContract = new ethers.Contract(INCIDENT_MANAGER_ADDRESS, INCIDENT_MANAGER_ABI, readProvider);
        const lastId = await readContract.getLastIncidentId();
        incidentId = lastId?.toString?.() || String(lastId);
      } catch (e) {
        console.warn('Could not fetch incident ID', e);
      }

      const incidentData = {
        id: incidentId || 'N/A',
        description: pdfCID,
        reportedBy: walletAddress,
        timestamp: new Date().toLocaleString(),
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
      setContractData(incidentData);
      setSubmissionComplete(true);
    } catch (error: any) {
      console.error('Contract submission error:', error);
      alert("Transaction failed: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (contractData) {
      onNext(contractData);
    }
  };

  return (
    <div className="mobile-wrapper p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 text-center px-2">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
        </div>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">Submit to Blockchain</h2>
        <p className="text-sm text-gray-600">
          Record your incident report on the blockchain for permanent, tamper-proof storage
        </p>
      </div>

      {/* Contract Information */}
  <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Smart Contract Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Contract Address:</span>
            <code className="bg-white px-2 py-1 rounded border text-xs font-mono">
              {INCIDENT_MANAGER_ADDRESS}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">IPFS URL:</span>
            <code className="bg-white px-2 py-1 rounded border text-xs font-mono break-words w-full sm:w-72">
              {pdfCID}
            </code>
          </div>
        </div>
      </div>

      {/* Wallet Status & Submission */}
      {!submissionComplete ? (
        <div className="space-y-6">
          {/* Connected Wallet */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Wallet Connected</p>
                <p className="text-sm text-green-700 font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={handleSubmitToContract}
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-red-300 flex items-center justify-center space-x-2 mx-auto"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Submitting Transaction...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Submit to Blockchain</span>
                </>
              )}
            </button>
          </div>

          {/* Information */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium">About Blockchain Submission</p>
                <p>This transaction will permanently record your incident report's IPFS hash on the blockchain, providing cryptographic proof of when and by whom the report was submitted.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:space-x-4">
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-0 sm:mt-1 mb-3 sm:mb-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-1">Successfully Submitted!</h3>
              <p className="text-green-800 mb-3 text-sm">
                Your incident report has been permanently recorded on the blockchain.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Hash className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-700 text-sm">Incident ID</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">#{contractData.id}</span>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-700 text-sm">Timestamp</span>
                  </div>
                  <span className="text-sm text-gray-900">{contractData.timestamp}</span>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-700 text-sm">Reporter</span>
                  </div>
                  <span className="text-sm font-mono text-gray-900">
                    {contractData.reportedBy.slice(0, 6)}...{contractData.reportedBy.slice(-4)}
                  </span>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-700 text-sm">Block Number</span>
                  </div>
                  <span className="text-sm text-gray-900">{contractData.blockNumber}</span>
                </div>
              </div>
              
              <div className="mt-3 bg-white rounded-lg p-3 border border-green-200">
                <span className="font-medium text-gray-700 text-sm">Transaction Hash:</span>
                <div className="mt-1">
                  <code className="text-xs text-gray-900 bg-gray-50 px-2 py-1 rounded break-words font-mono">
                    {contractData.txHash}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 sm:pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        {submissionComplete && (
          <button
            onClick={handleContinue}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-blue-300 flex items-center justify-center space-x-2"
          >
            <span>View Summary</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}