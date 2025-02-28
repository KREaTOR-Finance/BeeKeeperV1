import React from 'react';
import { useWeb3 } from '../utils/Web3Context';
import '../styles/Stats.css';

const Stats = () => {
  const { isConnected } = useWeb3();

  // Mock data - would be replaced with actual contract data
  const platformStats = {
    marketCap: '$112K',
    beePrice: '$1.13',
    hunyPrice: '$0.25',
    totalHives: '123,456',
    activeHives: '98,765',
    decayedHives: '22,345',
    deadHives: '2,346',
    hiveCap: '1,000,000',
    hivesRemaining: '876,544',
    totalStaked: '45,678',
    percentStaked: '37%',
    avgDecayRate: '0.8 Bees/week',
    avgRestorations: '1,234/week',
    totalHunyEarned: '45,678',
    runway: '365 D'
  };

  return (
    <div className="stats-page">
      <h1 className="page-title">Platform Statistics</h1>
      
      {isConnected ? (
        <>
          <section className="stats-overview">
            <div className="stats-card main-stats">
              <h2>Key Metrics</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{platformStats.marketCap}</div>
                  <div className="stat-label">Market Cap</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-value">{platformStats.beePrice}</div>
                  <div className="stat-label">Bee Price</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-value">{platformStats.hunyPrice}</div>
                  <div className="stat-label">Huny Price</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-value">{platformStats.runway}</div>
                  <div className="stat-label">Runway</div>
                </div>
              </div>
            </div>
          </section>
          
          <section className="hive-stats">
            <h2 className="section-title">Hive Statistics</h2>
            
            <div className="stats-grid">
              <div className="stats-card">
                <h3>Hive Distribution</h3>
                <div className="stat-chart">
                  <div className="chart-placeholder">
                    <div className="chart-segment active" style={{ width: '80%' }}>
                      <span>Active: {platformStats.activeHives}</span>
                    </div>
                    <div className="chart-segment decaying" style={{ width: '15%' }}>
                      <span>Decaying: {platformStats.decayedHives}</span>
                    </div>
                    <div className="chart-segment dead" style={{ width: '5%' }}>
                      <span>Dead: {platformStats.deadHives}</span>
                    </div>
                  </div>
                </div>
                <div className="stat-details">
                  <div className="stat-row">
                    <div className="stat-label">Total Hives</div>
                    <div className="stat-value">{platformStats.totalHives}</div>
                  </div>
                  <div className="stat-row">
                    <div className="stat-label">Hive Cap</div>
                    <div className="stat-value">{platformStats.hiveCap}</div>
                  </div>
                  <div className="stat-row">
                    <div className="stat-label">Remaining</div>
                    <div className="stat-value">{platformStats.hivesRemaining}</div>
                  </div>
                </div>
              </div>
              
              <div className="stats-card">
                <h3>Staking Statistics</h3>
                <div className="stat-chart">
                  <div className="chart-placeholder">
                    <div className="chart-segment staked" style={{ width: platformStats.percentStaked }}>
                      <span>Staked: {platformStats.percentStaked}</span>
                    </div>
                  </div>
                </div>
                <div className="stat-details">
                  <div className="stat-row">
                    <div className="stat-label">Total Staked</div>
                    <div className="stat-value">{platformStats.totalStaked}</div>
                  </div>
                  <div className="stat-row">
                    <div className="stat-label">Total Huny Earned</div>
                    <div className="stat-value">{platformStats.totalHunyEarned}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section className="decay-stats">
            <h2 className="section-title">Decay Mechanics</h2>
            
            <div className="stats-grid">
              <div className="stats-card">
                <h3>Decay Statistics</h3>
                <div className="stat-details">
                  <div className="stat-row">
                    <div className="stat-label">Average Decay Rate</div>
                    <div className="stat-value">{platformStats.avgDecayRate}</div>
                  </div>
                  <div className="stat-row">
                    <div className="stat-label">Weekly Restorations</div>
                    <div className="stat-value">{platformStats.avgRestorations}</div>
                  </div>
                  <div className="stat-row">
                    <div className="stat-label">Bees Used for Restoration</div>
                    <div className="stat-value">{parseInt(platformStats.avgRestorations) * 8}</div>
                  </div>
                </div>
              </div>
              
              <div className="stats-card info-card">
                <h3>Decay Mechanics Explained</h3>
                <div className="info-content">
                  <p><strong>Hive Decay:</strong> All unstaked hives lose 1 Bee per week in production rate.</p>
                  <p><strong>Restoration:</strong> Hives can be restored to full production (6 Bees/day) for 8 Bees, but only when they reach 2 Bees/day.</p>
                  <p><strong>Permanent Loss:</strong> If a hive reaches 0 Bees/day, it is permanently lost.</p>
                  <p><strong>Protection:</strong> Staking hives in the Queen Bee Colony protects them from decay for the duration of the stake (1 year).</p>
                </div>
              </div>
            </div>
          </section>
          
          <section className="huny-stats">
            <h2 className="section-title">Huny Token</h2>
            
            <div className="stats-card info-card">
              <h3>Huny Token Utility</h3>
              <div className="info-content">
                <p><strong>Earning Huny:</strong> Huny tokens are only earned by staking hives in the Queen Bee Colony (1 Huny/day per hive).</p>
                <p><strong>Future Utility:</strong></p>
                <ul>
                  <li>Payment token for Bumble Bots (trading, sniping, and AI bots)</li>
                  <li>Currency for a Huny-exclusive NFT collection</li>
                  <li>In-game currency for the Bumble Bee Game Builder</li>
                </ul>
                <p><strong>Long-Term Plan:</strong> If successful, Huny will eventually be fairly paired to a portion of the USDC earned from bought nodes.</p>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="connect-prompt">
          <h2>Connect your wallet to view statistics</h2>
          <p>Connect your wallet to see detailed platform statistics and metrics.</p>
        </div>
      )}
    </div>
  );
};

export default Stats; 