import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ethers } from 'ethers';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Hives from './pages/Hives';
import Stake from './pages/Stake';
import Stats from './pages/Stats';
import QueenColony from './pages/QueenColony';

// Context
import { Web3Provider } from './utils/Web3Context';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        
        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
        setChainId(network.chainId);
        setIsConnected(true);
      } else {
        alert('Please install MetaMask to use this application');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
  };

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const network = await provider.getNetwork();
            
            setAccount(accounts[0]);
            setProvider(provider);
            setSigner(signer);
            setChainId(network.chainId);
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <Web3Provider value={{ account, provider, signer, chainId, isConnected, connectWallet, disconnectWallet }}>
      <div className="app">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hives" element={<Hives />} />
            <Route path="/stake" element={<Stake />} />
            <Route path="/queen-colony" element={<QueenColony />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </div>
      </div>
    </Web3Provider>
  );
}

export default App; 