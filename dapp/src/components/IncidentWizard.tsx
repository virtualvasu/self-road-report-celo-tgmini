import { useState } from 'react';
import { ChevronRight, CheckCircle, ArrowLeft, Zap } from 'lucide-react';
import { ethers } from 'ethers';
import InitialSetupStep from './steps/InitialSetupStep';
import SelfProtocolVerification from './SelfProtocolVerification';
import IncidentFormStep from './steps/IncidentFormStep';
import PDFGenerationStep from './steps/PDFGenerationStep';
import StorageUploadStep from './steps/StorageUploadStep';
import ContractSubmissionStep from './steps/ContractSubmissionStep';
import SuccessSummaryStep from './steps/SuccessSummaryStep';
import type { StorachaCredentials } from './StorachaConnection';
import type { IncidentData } from '../lib/generateIncidentPDF';
import { getServerSigner } from '../lib/wallet';
// import { INCIDENT_MANAGER_ADDRESS, INCIDENT_MANAGER_ABI } from '../lib/contract';

export interface WizardData {
  walletAddress: string;
  contract: ethers.Contract | null;
  storachaCredentials: StorachaCredentials | null;
  isIdentityVerified: boolean;
  incidentData: IncidentData;
  pdfBytes: Uint8Array | null;
  storachaCID: string;
  contractData: any;
}

const STEPS = [
  { id: 1, title: 'Setup Services', description: 'Connect wallet and storage' },
  { id: 2, title: 'Identity Verification', description: 'Verify with Self Protocol' },
  { id: 3, title: 'Incident Details', description: 'Report incident information' },
  { id: 4, title: 'Generate Report', description: 'Create PDF document' },
  { id: 5, title: 'Upload to Storage', description: 'Store on IPFS network' },
  { id: 6, title: 'Submit to Contract', description: 'Record on blockchain' },
  { id: 7, title: 'Complete', description: 'View summary' }
];

const createInitialWizardData = (): WizardData => ({
  walletAddress: '',
  contract: null,
  storachaCredentials: null,
  isIdentityVerified: false,
  incidentData: {
    location: '',
    description: '',
    isElderlyInvolved: 'no',
    image: null
  },
  pdfBytes: null,
  storachaCID: '',
  contractData: null
});

export default function IncidentWizard({ onBackToHome }: { onBackToHome?: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(createInitialWizardData());

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    // Only allow going to previous steps or the current step
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  // Development-only: Quick submit mock incident
  const handleQuickMockSubmit = async () => {
    if (!import.meta.env.DEV) return; // Only in development
    
    try {
      // Get wallet address from server signer
      const signer = getServerSigner();
      const walletAddress = await signer.getAddress();
      
      // Create mock data
      // const mockPdfCID = `https://w3s.link/ipfs/QmMockDev${Date.now()}`;
      const mockIncidentData: IncidentData = {
        location: '123 Test Street, Development City',
        description: 'Mock incident for development testing',
        isElderlyInvolved: 'no',
        image: null
      };

      // Update wizard data
      setWizardData({
        walletAddress,
        contract: null, // Not needed since we use getServerSigner
        storachaCredentials: null,
        isIdentityVerified: true, // Skip verification
        incidentData: mockIncidentData,
        pdfBytes: null,
        storachaCID: `QmMockDev${Date.now()}`,
        contractData: null
      });

      // Jump directly to contract submission step
      setCurrentStep(6);
    } catch (error: any) {
      console.error('Quick mock submit error:', error);
      alert('Failed to setup mock submit: ' + (error.message || 'Unknown error'));
    }
  };

  const isDev = import.meta.env.DEV;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <InitialSetupStep
            onNext={(setupData: { walletAddress: string; contract: ethers.Contract; storachaCredentials: StorachaCredentials }) => {
              updateWizardData({ 
                walletAddress: setupData.walletAddress,
                contract: setupData.contract,
                storachaCredentials: setupData.storachaCredentials
              });
              nextStep();
            }}
          />
        );
      case 2:
        return (
          <SelfProtocolVerification
            userAddress={wizardData.walletAddress}
            contract={wizardData.contract}
            onVerificationComplete={(verified: boolean) => {
              updateWizardData({ isIdentityVerified: verified });
              nextStep();
            }}
            onBack={previousStep}
          />
        );
      case 3:
        return (
          <IncidentFormStep
            data={wizardData.incidentData}
            onNext={(data: IncidentData) => {
              updateWizardData({ incidentData: data });
              nextStep();
            }}
          />
        );
      case 4:
        return (
          <PDFGenerationStep
            incidentData={wizardData.incidentData}
            onNext={(pdfBytes: Uint8Array) => {
              updateWizardData({ pdfBytes });
              nextStep();
            }}
            onBack={previousStep}
          />
        );
      case 5:
        return (
          <StorageUploadStep
            pdfBytes={wizardData.pdfBytes!}
            storachaCredentials={wizardData.storachaCredentials!}
            onNext={(cid: string) => {
              updateWizardData({ storachaCID: cid });
              nextStep();
            }}
            onBack={previousStep}
          />
        );
      case 6:
        return (
          <ContractSubmissionStep
            pdfCID={`https://w3s.link/ipfs/${wizardData.storachaCID}`}
            contract={wizardData.contract!}
            walletAddress={wizardData.walletAddress}
            onNext={(contractData: any) => {
              updateWizardData({ contractData });
              nextStep();
            }}
            onBack={previousStep}
          />
        );
      case 7:
        return (
          <SuccessSummaryStep
            wizardData={wizardData}
            onRestart={() => {
              setCurrentStep(1);
              setWizardData(createInitialWizardData());
            }}
            onBackToHome={onBackToHome}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
  <div className="mobile-wrapper py-3 md:py-4">
          <div className="flex items-center justify-between">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Back</span>
              </button>
            )}
            <div className="flex-1 text-center px-2">
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 leading-tight">
                Incident Management System
              </h1>
              <p className="text-gray-600 text-xs md:text-sm mt-1">
                Professional incident reporting with blockchain verification
              </p>
            </div>
            {onBackToHome && <div className="w-16 md:w-28"></div>} {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Progress Steps - horizontally scrollable on small screens */}
      <div className="bg-white border-b border-gray-200">
  <div className="mobile-wrapper py-4">
          <nav>
            <ol className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar py-2 px-1">
              {STEPS.map((step, index) => (
                <li key={step.id} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => goToStep(step.id)}
                      disabled={step.id > currentStep}
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-200 ${
                        currentStep > step.id
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : currentStep === step.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        step.id
                      )}
                    </button>
                    <div className="mt-1 text-center">
                      <p className={`text-xs md:text-sm font-medium ${
                        currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xxs text-gray-500 hidden md:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-3 md:ml-6 flex-shrink-0" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
  <main className="mobile-wrapper py-8">
        {/* Development Only: Quick Mock Submit Button */}
        {isDev && currentStep === 1 && (
          <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">Development Mode</p>
                  <p className="text-sm text-amber-700">Skip all steps and submit a mock incident directly</p>
                </div>
              </div>
              <button
                onClick={handleQuickMockSubmit}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Quick Mock Submit</span>
              </button>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {renderStepContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-gray-500 text-sm bg-white border-t border-gray-200">
        <div className="mobile-wrapper">
          © 2025 Incident Management System - Secure • Decentralized • Professional
        </div>
      </footer>
    </div>
  );
}