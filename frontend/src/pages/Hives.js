import React, { useState } from 'react';
import { useWeb3 } from '../utils/Web3Context';
import HiveCard from '../components/HiveCard';
import '../styles/Dashboard.css';
import '../styles/MyHives.css';

const Hives = () => {
  const { isConnected } = useWeb3();
  const [activeTab, setActiveTab] = useState('my-hives');
  const [activeFilter, setActiveFilter] = useState('all');

  // Mock data for My Hives section
  const userHives = {
    totalHives: 21,
    maxHives: 1000000, // 1 million max hives cap
    emissionsPerHive: 6,
    emissionsUsdValue: 49.92,
    dailyEarnings: 1048.32,
    currentEmissions: 1.84,
    emissionsValue: 15.33
  };

  // Mock hives data with different health states
  const hives = [
    {
      id: 1,
      name: 'Hive #1',
      image: '🐝',
      productionRate: 6, // Healthy
      decayCountdown: 7,
      isStaked: false
    },
    {
      id: 2,
      name: 'Hive #2',
      image: '🐝',
      productionRate: 5, // Slightly decayed
      decayCountdown: 3,
      isStaked: false
    },
    {
      id: 3,
      name: 'Hive #3',
      image: '🐝',
      productionRate: 4, // Moderately decayed
      decayCountdown: 5,
      isStaked: false
    },
    {
      id: 4,
      name: 'Hive #4',
      image: '🐝',
      productionRate: 2, // Critical - can be restored
      decayCountdown: 2,
      isStaked: false
    },
    {
      id: 5,
      name: 'Hive #5',
      image: '🐝',
      productionRate: 6, // Healthy and staked
      isStaked: true
    },
    {
      id: 6,
      name: 'Hive #6',
      image: '🐝',
      productionRate: 0, // Dead hive
      decayCountdown: 0,
      isStaked: false
    }
  ];

  // Filter hives based on active filter
  const getFilteredHives = () => {
    switch(activeFilter) {
      case 'healthy':
        return hives.filter(hive => hive.productionRate >= 5 && !hive.isStaked);
      case 'decaying':
        return hives.filter(hive => hive.productionRate < 5 && hive.productionRate > 2 && !hive.isStaked);
      case 'attention':
        return hives.filter(hive => hive.productionRate <= 2 && hive.productionRate > 0 && !hive.isStaked);
      case 'staked':
        return hives.filter(hive => hive.isStaked);
      default:
        return hives;
    }
  };

  return (
    <div className="dashboard">
      <h1 className="page-title">Hives</h1>
      
      {isConnected ? (
        <>
          <div className="hives-tabs">
            <button 
              className={`tab-button ${activeTab === 'my-hives' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-hives')}
            >
              My Hives
            </button>
            <button 
              className={`tab-button ${activeTab === 'get-hives' ? 'active' : ''}`}
              onClick={() => setActiveTab('get-hives')}
            >
              Get Hives
            </button>
          </div>
          
          {activeTab === 'my-hives' && (
            <>
              <section className="hives-overview">
                <div className="overview-header">
                  <div className="overview-title">Your Hives</div>
                  <div className="overview-count">{userHives.totalHives} / {userHives.maxHives.toLocaleString()}</div>
                </div>
                
                <div className="rewards-info">
                  <div className="rewards-section">
                    <h3>Emissions Per Hive</h3>
                    <div className="reward-value">
                      <span className="bee-icon">🐝</span>
                      <span className="reward-amount">{userHives.emissionsPerHive} Bees / day</span>
                    </div>
                    <div className="reward-usd">= ${userHives.emissionsUsdValue} USD</div>
                    <div className="daily-earnings">
                      Currently earning ${userHives.dailyEarnings} USD per day
                    </div>
                  </div>
                  
                  <div className="rewards-section">
                    <h3>Your Emissions</h3>
                    <div className="reward-value">
                      <span className="bee-icon">🐝</span>
                      <span className="reward-amount">{userHives.currentEmissions} Bees</span>
                    </div>
                    <div className="reward-usd">= ${userHives.emissionsValue} USD</div>
                    <button className="btn btn-claim">Claim Bees</button>
                    <button className="btn btn-compound">Compound</button>
                  </div>
                </div>
                
                <div className="decay-warning">
                  <div className="warning-icon">⚠️</div>
                  <div className="warning-text">
                    <h4>Hive Decay Warning</h4>
                    <p>Unstaked hives lose 1 Bee per week. If a hive reaches 0 Bees/day, it is permanently lost. 
                    Restore hives at 2 Bees/day for 8 Bees, or stake them in the Queen Bee Colony for protection.</p>
                  </div>
                </div>
              </section>
              
              <section className="hive-management">
                <h2 className="section-title">Manage Your Hives</h2>
                
                <div className="hive-filters">
                  <button 
                    className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                  >
                    All Hives
                  </button>
                  <button 
                    className={`filter-btn ${activeFilter === 'healthy' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('healthy')}
                  >
                    Healthy
                  </button>
                  <button 
                    className={`filter-btn ${activeFilter === 'decaying' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('decaying')}
                  >
                    Decaying
                  </button>
                  <button 
                    className={`filter-btn warning ${activeFilter === 'attention' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('attention')}
                  >
                    Need Attention
                  </button>
                  <button 
                    className={`filter-btn ${activeFilter === 'staked' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('staked')}
                  >
                    Staked
                  </button>
                </div>
                
                <div className="hives-grid">
                  {getFilteredHives().map(hive => (
                    <HiveCard key={hive.id} hive={hive} showDetails={true} />
                  ))}
                </div>
              </section>
            </>
          )}
          
          {activeTab === 'get-hives' && (
            <section className="get-hives">
              <h2 className="section-title">Get More Hives</h2>
              
              <div className="decay-warning">
                <div className="warning-icon">ℹ️</div>
                <div className="warning-text">
                  <h4>Important Information</h4>
                  <p>All hives, including purchased ones, are subject to decay (-1 Bee/week) unless staked in the Queen Bee Colony. 
                  The global maximum is 1 million hives.</p>
                </div>
              </div>
              
              <div className="actions-grid">
                <div className="action-card">
                  <h3>Colonize Hive</h3>
                  <div className="action-options">
                    <div className="action-option">
                      <div className="option-image">🐝</div>
                      <div className="option-details">
                        <div className="option-title">1 Hive</div>
                        <div className="option-price">10 Bees</div>
                      </div>
                      <button className="btn btn-action">Colonize Hive</button>
                    </div>
                    
                    <div className="action-option">
                      <div className="option-image">🐝</div>
                      <div className="option-details">
                        <div className="option-title">5 Hives</div>
                        <div className="option-price">50 Bees</div>
                      </div>
                      <button className="btn btn-action">Colonize Hive</button>
                    </div>
                  </div>
                </div>
                
                <div className="action-card">
                  <h3>Buy with USDC</h3>
                  <div className="action-options">
                    <div className="action-option">
                      <div className="option-image">🐝</div>
                      <div className="option-details">
                        <div className="option-title">1 Hive</div>
                        <div className="option-price">20 USDC</div>
                      </div>
                      <button className="btn btn-action">Buy with USDC</button>
                    </div>
                    
                    <div className="action-option">
                      <div className="option-image">🐝</div>
                      <div className="option-details">
                        <div className="option-title">5 Hives</div>
                        <div className="option-price">96 USDC</div>
                      </div>
                      <button className="btn btn-action">Buy with USDC</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="connect-prompt">
          <h2>Connect your wallet to view and manage hives</h2>
          <p>Connect your wallet to see your hives, emissions, and purchase new hives.</p>
        </div>
      )}
    </div>
  );
};

export default Hives; 