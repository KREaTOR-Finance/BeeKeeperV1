import React from 'react';
import '../styles/HiveCard.css';

const HiveCard = ({ hive, showDetails = false }) => {
  // Calculate health percentage based on production rate (6 is max, 0 is dead)
  const healthPercentage = (hive.productionRate / 6) * 100;
  
  // Determine health status
  const getHealthStatus = () => {
    if (healthPercentage >= 80) return 'healthy';
    if (healthPercentage >= 50) return 'good';
    if (healthPercentage >= 30) return 'warning';
    return 'critical';
  };
  
  // Get days until next decay
  const getDaysUntilDecay = () => {
    return hive.decayCountdown || 7; // Default to 7 days if not specified
  };
  
  // Check if hive can be restored (only at 2 Bees/day)
  const canRestore = hive.productionRate === 2;
  
  // Handle restoration
  const handleRestore = (e) => {
    e.stopPropagation();
    // In a real implementation, this would call a smart contract function
    alert(`Restoring ${hive.name} for 8 Bees`);
  };
  
  return (
    <div className={`hive-card ${getHealthStatus()}`}>
      {hive.isStaked && <div className="staked-badge">👑 Staked</div>}
      
      <div className="hive-image">{hive.image}</div>
      <h3 className="hive-name">{hive.name}</h3>
      
      <div className="hive-details">
        <div className="production-rate">
          <span className="bee-icon">🐝</span>
          <span className="rate-value">{hive.productionRate} Bees/day</span>
        </div>
        
        {!hive.isStaked && (
          <div className="health-bar-container">
            <div 
              className="health-bar" 
              style={{ width: `${healthPercentage}%` }}
            ></div>
          </div>
        )}
        
        {showDetails && (
          <>
            {!hive.isStaked ? (
              <div className="decay-info">
                <div className="decay-label">Next decay in:</div>
                <div className="decay-value">{getDaysUntilDecay()} days</div>
                <div className="decay-note">-1 Bee/week unless staked</div>
              </div>
            ) : (
              <div className="staked-info">
                <div className="staked-label">Protected from decay</div>
                <div className="huny-production">
                  <span className="huny-icon">🍯</span>
                  <span className="huny-value">1 Huny/day</span>
                </div>
              </div>
            )}
            
            {canRestore && !hive.isStaked && (
              <button className="btn-restore" onClick={handleRestore}>
                Restore (8 Bees)
              </button>
            )}
            
            {hive.productionRate === 0 && !hive.isStaked && (
              <div className="dead-hive-warning">
                Hive is dead and cannot be restored
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HiveCard; 