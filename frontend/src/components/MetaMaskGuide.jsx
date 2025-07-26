import { useState } from 'react';
import { Wallet, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

const MetaMaskGuide = ({ onClose }) => {
  const [step, setStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Install MetaMask",
      description: "Download and install the MetaMask browser extension",
      action: "Install MetaMask",
      link: "https://metamask.io/download/",
      icon: <Wallet size={24} />
    },
    {
      id: 2,
      title: "Create or Import Wallet",
      description: "Set up your MetaMask wallet with a new account or import existing one",
      action: "Open MetaMask",
      link: null,
      icon: <CheckCircle size={24} />
    },
    {
      id: 3,
      title: "Connect to Local Network",
      description: "Add localhost:8545 network to MetaMask for development",
      action: "Add Network",
      link: null,
      icon: <AlertCircle size={24} />
    }
  ];

  const networkConfig = {
    name: "Localhost 8545",
    rpcUrl: "http://localhost:8545",
    chainId: "0x539", // 1337 in hex
    currencySymbol: "ETH"
  };

  const handleAction = (stepData) => {
    if (stepData.link) {
      window.open(stepData.link, '_blank');
    } else if (stepData.id === 3) {
      // Add network to MetaMask
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: networkConfig.chainId,
            chainName: networkConfig.name,
            nativeCurrency: {
              name: 'Ether',
              symbol: networkConfig.currencySymbol,
              decimals: 18
            },
            rpcUrls: [networkConfig.rpcUrl]
          }]
        }).then(() => {
          setStep(4);
        }).catch((error) => {
          console.error('Error adding network:', error);
        });
      }
    }
  };

  return (
    <div className="metamask-guide-overlay">
      <div className="metamask-guide-modal">
        <div className="guide-header">
          <h2>🚀 Setup MetaMask for StartupQuest</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="guide-content">
          <p className="guide-description">
            Connect your MetaMask wallet to sync your startup progress on the blockchain and earn rewards!
          </p>

          <div className="steps-container">
            {steps.map((stepData) => (
              <div 
                key={stepData.id} 
                className={`step ${step >= stepData.id ? 'active' : ''}`}
              >
                <div className="step-icon">
                  {stepData.icon}
                </div>
                <div className="step-content">
                  <h3>{stepData.title}</h3>
                  <p>{stepData.description}</p>
                  {stepData.id === 3 && (
                    <div className="network-config">
                      <strong>Network Details:</strong>
                      <ul>
                        <li>Name: {networkConfig.name}</li>
                        <li>RPC URL: {networkConfig.rpcUrl}</li>
                        <li>Chain ID: {networkConfig.chainId} ({parseInt(networkConfig.chainId, 16)})</li>
                        <li>Currency: {networkConfig.currencySymbol}</li>
                      </ul>
                    </div>
                  )}
                </div>
                <button 
                  className={`step-action ${stepData.link ? 'external' : ''}`}
                  onClick={() => handleAction(stepData)}
                  disabled={step < stepData.id}
                >
                  {stepData.action}
                  {stepData.link && <ExternalLink size={16} />}
                </button>
              </div>
            ))}
          </div>

          {step === 4 && (
            <div className="success-step">
              <CheckCircle size={48} className="success-icon" />
              <h3>🎉 Setup Complete!</h3>
              <p>Your MetaMask is now configured for StartupQuest. You can now connect your wallet and start earning blockchain rewards!</p>
              <button className="btn-quest" onClick={onClose}>
                Start Your Journey
              </button>
            </div>
          )}
        </div>

        <div className="guide-footer">
          <p>
            <strong>Need help?</strong> Check out the{' '}
            <a href="https://metamask.io/help/" target="_blank" rel="noopener noreferrer">
              MetaMask documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetaMaskGuide; 