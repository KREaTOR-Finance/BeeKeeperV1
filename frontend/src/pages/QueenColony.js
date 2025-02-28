import React, { useState } from 'react';
import { useWeb3 } from '../utils/Web3Context';
import '../styles/QueenColony.css';

const QueenColony = () => {
  const { isConnected } = useWeb3();
  const [selectedHives, setSelectedHives] = useState([]);
  const [showCeremony, setShowCeremony] = useState(false);
  const [ceremonyComplete, setCeremonyComplete] = useState(false);
  
  // Mock data for available hives
  const availableHives = Array(8).fill().map((_, index) => ({
    id: index + 1,
    name: `Hive #${index + 1}`,
    image: '🐝',
    productionRate: 6,
    decayCountdown: 7 * (index % 4 + 1), // Days until next decay
    isStaked: false
  }));
  
  // Mock data for staked hives
  const stakedHives = Array(4).fill().map((_, index) => ({
    id: index + 101,
    name: `Royal Hive #${index + 1}`,
    image: '🐝',
    productionRate: 6,
    stakedDate: new Date(Date.now() - (index * 30 * 24 * 60 * 60 * 1000)), // Staked 0-3 months ago
    unlockDate: new Date(Date.now() + ((12 - index) * 30 * 24 * 60 * 60 * 1000)), // Unlocks in 9-12 months
    isStaked: true
  }));
  
  // Colony statistics
  const colonyStats = {
    totalHives: stakedHives.length,
    dailyBeeProduction: stakedHives.length * 6,
    dailyHunyProduction: stakedHives.length * 1,
    colonyRank: 'Worker Bee', // Based on number of hives staked
    memberSince: '2 months ago'
  };
  
  const toggleHiveSelection = (hiveId) => {
    if (selectedHives.includes(hiveId)) {
      setSelectedHives(selectedHives.filter(id => id !== hiveId));
    } else {
      setSelectedHives([...selectedHives, hiveId]);
    }
  };
  
  const startStakingCeremony = () => {
    if (selectedHives.length > 0) {
      setShowCeremony(true);
      // In a real implementation, we would play ceremony music here
      
      // Simulate ceremony completion after 3 seconds
      setTimeout(() => {
        setCeremonyComplete(true);
      }, 3000);
    }
  };
  
  const completeCeremony = () => {
    setShowCeremony(false);
    setCeremonyComplete(false);
    // In a real implementation, we would update the blockchain state here
    
    // Reset selection
    setSelectedHives([]);
  };
  
  const formatTimeRemaining = (date) => {
    const now = new Date();
    const diffTime = Math.abs(date - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    
    return `${months} months, ${days} days`;
  };
  
  return (
    <div className="queen-colony">
      <div className={`ceremony-overlay ${showCeremony ? 'active' : ''}`}>
        <div className="ceremony-content">
          <h2>Royal Staking Ceremony</h2>
          <div className="ceremony-animation">
            {!ceremonyComplete ? (
              <>
                <div className="queen-emoji">👑</div>
                <div className="ceremony-hives">
                  {selectedHives.map(hiveId => (
                    <div key={hiveId} className="ceremony-hive">🐝</div>
                  ))}
                </div>
                <div className="ceremony-progress">
                  <div className="progress-bar"></div>
                </div>
                <p>The Queen is welcoming your hives to the Royal Colony...</p>
              </>
            ) : (
              <>
                <div className="ceremony-complete">
                  <div className="queen-emoji">👑</div>
                  <div className="royal-hives">
                    {selectedHives.map(hiveId => (
                      <div key={hiveId} className="royal-hive">👑🐝</div>
                    ))}
                  </div>
                </div>
                <h3>Royal Decree</h3>
                <p className="royal-decree">
                  These hives are now under the protection of the Queen Bee Colony for a period of 1 year.
                  They shall produce 6 Bees and 1 Huny per day, and be protected from decay.
                </p>
                <button className="btn btn-royal" onClick={completeCeremony}>
                  Accept Royal Decree
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <h1 className="page-title">Queen Bee Colony</h1>
      
      {isConnected ? (
        <>
          <section className="colony-overview">
            <div className="queen-banner">
              <div className="queen-avatar">👑🐝</div>
              <div className="queen-info">
                <h2>Her Royal Highness</h2>
                <p>Protector of Hives, Provider of Huny</p>
              </div>
            </div>
            
            <div className="colony-benefits">
              <h3>Royal Benefits</h3>
              <ul className="benefits-list">
                <li><span className="benefit-icon">🛡️</span> Protection from decay</li>
                <li><span className="benefit-icon">🍯</span> 1 Huny token per day per hive</li>
                <li><span className="benefit-icon">🐝</span> Guaranteed 6 Bees per day per hive</li>
                <li><span className="benefit-icon">👑</span> Royal Colony membership status</li>
              </ul>
              <div className="royal-warning">
                <p><strong>Royal Commitment:</strong> Hives are locked in the colony for 1 year</p>
              </div>
            </div>
          </section>
          
          {stakedHives.length > 0 && (
            <section className="your-colony">
              <h2 className="section-title">Your Royal Hives</h2>
              
              <div className="colony-stats">
                <div className="stat-card">
                  <div className="stat-value">{colonyStats.totalHives}</div>
                  <div className="stat-label">Royal Hives</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">{colonyStats.dailyBeeProduction}</div>
                  <div className="stat-label">Daily Bees</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">{colonyStats.dailyHunyProduction}</div>
                  <div className="stat-label">Daily Huny</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">{colonyStats.colonyRank}</div>
                  <div className="stat-label">Colony Rank</div>
                </div>
              </div>
              
              <div className="royal-hives-grid">
                {stakedHives.map(hive => (
                  <div key={hive.id} className="royal-hive-card">
                    <div className="royal-insignia">👑</div>
                    <div className="hive-image">{hive.image}</div>
                    <div className="hive-name">{hive.name}</div>
                    <div className="hive-production">
                      <div className="production-item">
                        <span className="production-icon">🐝</span>
                        <span className="production-value">6 Bees/day</span>
                      </div>
                      <div className="production-item">
                        <span className="production-icon">🍯</span>
                        <span className="production-value">1 Huny/day</span>
                      </div>
                    </div>
                    <div className="lock-period">
                      <div className="lock-label">Unlocks in:</div>
                      <div className="lock-value">{formatTimeRemaining(hive.unlockDate)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          <section className="stake-new-hives">
            <h2 className="section-title">Stake New Hives</h2>
            <p className="section-description">
              Select hives to join the Queen Bee Colony. Staked hives will be locked for 1 year,
              but will be protected from decay and earn 1 Huny token per day in addition to 6 Bees.
            </p>
            
            <div className="available-hives-grid">
              {availableHives.map(hive => (
                <div 
                  key={hive.id} 
                  className={`available-hive-card ${selectedHives.includes(hive.id) ? 'selected' : ''}`}
                  onClick={() => toggleHiveSelection(hive.id)}
                >
                  <div className="selection-indicator"></div>
                  <div className="hive-image">{hive.image}</div>
                  <div className="hive-name">{hive.name}</div>
                  <div className="hive-production">
                    <span className="production-icon">🐝</span>
                    <span className="production-value">{hive.productionRate} Bees/day</span>
                  </div>
                  <div className="decay-countdown">
                    <div className="decay-label">Next decay in:</div>
                    <div className="decay-value">{hive.decayCountdown} days</div>
                  </div>
                  <div className="comparison">
                    <div className="current-state">
                      <div className="state-label">Current</div>
                      <div className="state-value">Decaying</div>
                    </div>
                    <div className="arrow">→</div>
                    <div className="future-state">
                      <div className="state-label">After Staking</div>
                      <div className="state-value">Protected</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedHives.length > 0 && (
              <div className="staking-actions">
                <div className="selected-count">
                  {selectedHives.length} hive{selectedHives.length !== 1 ? 's' : ''} selected
                </div>
                <button className="btn btn-royal" onClick={startStakingCeremony}>
                  Begin Royal Staking Ceremony
                </button>
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="connect-prompt">
          <h2>Connect your wallet to join the Queen Bee Colony</h2>
          <p>Connect your wallet to stake your hives in the Queen Bee Colony for royal benefits.</p>
        </div>
      )}
    </div>
  );
};

export default QueenColony; 