import React from 'react';
import { ArrowRight, Github, FileCode, Sparkles, Shield, Coins, CheckCircle, ExternalLink, MapPin } from 'lucide-react';

interface ProjectIntroPageProps {
  onContinue: () => void;
}

export default function ProjectIntroPage({ onContinue }: ProjectIntroPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SafeRoads DAO</span>
          </div>
          <a
            href="https://github.com/virtualvasu/self-road-report-celo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:border-emerald-600 rounded-lg transition-all text-gray-700 hover:text-emerald-600"
          >
            <Github className="w-5 h-5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-1 bg-emerald-50 rounded-full border border-emerald-200">
            <span className="text-emerald-700 text-sm font-medium">Built on Celo Blockchain</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Report Road Incidents.
            <br />
            <span className="text-emerald-600">Earn Rewards.</span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            A decentralized platform that rewards citizens for reporting real road incidents — potholes, accidents, and hazards — with blockchain-verified transparency.
          </p>

          <button
            onClick={onContinue}
            className="group px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 mx-auto"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* How It Works - Flow Diagram */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
          How It Works
        </h2>
        
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3">
            {[
              { icon: Shield, title: 'Verify Identity', subtitle: 'via Self Protocol' },
              { icon: MapPin, title: 'Report Incident', subtitle: 'Location + Image' },
              { icon: CheckCircle, title: 'Get Verified', subtitle: 'Authority Review' },
              { icon: Coins, title: 'Earn Rewards', subtitle: 'Celo Tokens' }
            ].map((item, index) => (
              <React.Fragment key={index}>
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 w-44 text-center hover:border-emerald-400 transition-all">
                  <item.icon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-600">{item.subtitle}</p>
                </div>
                {index < 3 && (
                  <ArrowRight className="hidden md:block w-6 h-6 text-emerald-600 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Self Protocol Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                Aadhaar-Verified Identity with Self Protocol
              </h2>
              <p className="text-gray-700 text-sm mb-3">
                SafeRoads DAO integrates <strong>Self Protocol</strong> to ensure only real, unique humans can submit incident reports. Users verify their identity through Aadhaar-based zero-knowledge proofs, confirming they are genuine individuals without exposing any personal data.
              </p>
              <p className="text-gray-700 text-sm mb-4">
                This privacy-preserving verification prevents bots and duplicate accounts, ensuring the platform remains secure while protecting user privacy. Only verified users can submit reports and earn rewards.
              </p>
              <a
                href="https://docs.self.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
              >
                Learn more about Self Protocol
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Contracts */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-6">
          Smart Contracts on Celo Sepolia
        </h2>
        
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-emerald-400 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">ProofOfHuman</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Handles user verification via Self Protocol with Aadhaar-based zero-knowledge proofs
                </p>
              </div>
              <Shield className="w-7 h-7 text-emerald-600 flex-shrink-0" />
            </div>
            <a
              href="https://celo-sepolia.blockscout.com/address/0xa46fbeC38d888c37b4310a145745CF947d83a0eB"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors font-mono text-xs break-all"
            >
              <span>0xa46f...a0eB</span>
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
            </a>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-emerald-400 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">IncidentContract</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Manages incident reporting lifecycle, data storage, and reward distribution
                </p>
              </div>
              <FileCode className="w-7 h-7 text-emerald-600 flex-shrink-0" />
            </div>
            <a
              href="https://celo-sepolia.blockscout.com/address/0x34b6921bfe6c4933a1Af79b5f36A5b6e28B1a081"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors font-mono text-xs break-all"
            >
              <span>0x34b6...a081</span>
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
            </a>
          </div>
        </div>
      </section>

      {/* Noah AI Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-emerald-50 border-2 border-emerald-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Verification Portal Experiment
            </h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Built with Noah AI for rapid feature development. The Verification Portal allows authorities to review incident reports and trigger rewards efficiently.
          </p>
          <a
            href="https://share.vidyard.com/watch/wUvHSew3pVXDFLG247Pzzq"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all"
          >
            <Sparkles className="w-5 h-5" />
            View Noah AI Demo
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Blockchain Verified',
                description: 'All reports stored on Celo for complete transparency'
              },
              {
                title: 'Privacy First',
                description: 'Self Protocol ensures identity without exposing personal data'
              },
              {
                title: 'Real Rewards',
                description: 'Earn Celo tokens for verified contributions to safer cities'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center border-2 border-gray-200 rounded-lg p-5 hover:border-emerald-400 transition-all">
                <div className="w-2 h-2 bg-emerald-600 rounded-full mx-auto mb-3"></div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 border-t border-gray-200 mt-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-gray-900 font-semibold text-sm">SafeRoads DAO</div>
                <div className="text-gray-600 text-xs">Making roads safer, one report at a time</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <a
                href="https://github.com/virtualvasu/self-road-report-celo"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-gray-300 hover:border-emerald-600 rounded-lg transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-gray-600" />
              </a>
              <a
                href="https://share.vidyard.com/watch/wUvHSew3pVXDFLG247Pzzq"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-gray-300 hover:border-emerald-600 rounded-lg transition-all"
                aria-label="Noah AI Demo"
              >
                <Sparkles className="w-5 h-5 text-gray-600" />
              </a>
            </div>
          </div>
          
          <div className="text-center mt-4 text-gray-500 text-xs">
            Built with 💚 on Celo Blockchain
          </div>
        </div>
      </footer>
    </div>
  );
}