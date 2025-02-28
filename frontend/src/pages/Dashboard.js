import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  // State for the royal staker counter
  const [royalStakers, setRoyalStakers] = useState(45000);
  const [remainingSpots, setRemainingSpots] = useState(55000);
  const maxRoyalStakers = 100000;
  
  // Simulate live counter updates
  useEffect(() => {
    // Random interval between 3-10 seconds for a new staker
    const getRandomInterval = () => Math.floor(Math.random() * 7000) + 3000;
    
    const updateCounter = () => {
      if (royalStakers < maxRoyalStakers) {
        setRoyalStakers(prev => {
          const newValue = Math.min(prev + 1, maxRoyalStakers);
          setRemainingSpots(maxRoyalStakers - newValue);
          return newValue;
        });
      }
    };
    
    // Initial update
    const initialTimeout = setTimeout(updateCounter, getRandomInterval());
    
    // Set up recurring updates
    const interval = setInterval(() => {
      updateCounter();
    }, getRandomInterval());
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [royalStakers]);
  
  // Calculate percentage filled
  const percentageFilled = (royalStakers / maxRoyalStakers) * 100;
  
  return (
    <div className="dashboard">
      <h1 className="page-title">Welcome to BeeKeeper</h1>
      
      {/* How It Works Section */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        
        <div className="info-card">
          <h3>What is BeeKeeper?</h3>
          <p>
            BeeKeeper is a decentralized node protocol that allows users to earn passive income by owning and maintaining virtual hives. Each hive produces Bee tokens daily, which can be claimed or compounded to grow your hive network.
          </p>
          
          <h3>Getting Started</h3>
          <ol>
            <li>
              <strong>Connect Your Wallet</strong> - Use MetaMask or another Web3 wallet to connect to the BeeKeeper platform.
            </li>
            <li>
              <strong>Purchase Hives</strong> - Buy your first hive using USDC or Bee tokens through our <Link to="/hives">Hives</Link> page.
            </li>
            <li>
              <strong>Earn Rewards</strong> - Your hives will start generating Bee tokens immediately after purchase.
            </li>
            <li>
              <strong>Claim or Compound</strong> - Decide whether to claim your Bee tokens or compound them to purchase more hives.
            </li>
          </ol>
          
          <h3>Tokenomics</h3>
          <p>
            The BeeKeeper ecosystem is designed for sustainability with the following features:
          </p>
          <ul>
            <li><strong>Fixed Supply</strong> - There is a maximum supply of Bee tokens to ensure scarcity.</li>
            <li><strong>Emissions Schedule</strong> - Hives produce a fixed amount of Bee tokens daily.</li>
            <li><strong>Sustainability Fee</strong> - A small fee on transactions helps maintain the ecosystem.</li>
          </ul>
          
          <h3>Staking</h3>
          <p>
            Stake your Bee tokens to earn additional rewards and participate in governance decisions. Visit our <Link to="/stake">Stake</Link> page to learn more.
          </p>
        </div>
      </section>
      
      {/* Queen Bee Colony Section */}
      <section className="queen-colony-highlight">
        <h2 className="section-title">
          <span className="queen-crown">👑</span> Queen Bee Colony <span className="queen-crown">👑</span>
        </h2>
        
        <div className="info-card royal">
          <div className="royal-banner">
            <div className="royal-icon">👑🐝</div>
            <h3>Royal Protection & Rewards</h3>
          </div>
          
          <p className="royal-intro">
            Join the exclusive Queen Bee Colony and receive royal treatment for your hives!
          </p>
          
          <div className="royal-benefits">
            <div className="benefit-item">
              <div className="benefit-icon">🛡️</div>
              <div className="benefit-content">
                <h4>Protection from Decay</h4>
                <p>Hives in the Queen Bee Colony are protected from the weekly decay that affects regular hives.</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <div className="benefit-icon">🍯</div>
              <div className="benefit-content">
                <h4>Exclusive Huny Tokens</h4>
                <p>Earn 1 Huny token per day for each hive staked in the colony - only available through royal staking!</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <div className="benefit-icon">🐝</div>
              <div className="benefit-content">
                <h4>Guaranteed Production</h4>
                <p>Maintain the maximum production rate of 6 Bees per day throughout the staking period.</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <div className="benefit-icon">👑</div>
              <div className="benefit-content">
                <h4>Royal Status</h4>
                <p>Gain exclusive colony membership status and future governance rights in the BeeKeeper ecosystem.</p>
              </div>
            </div>
          </div>
          
          <div className="royal-note">
            <p><strong>Royal Commitment:</strong> Hives are locked in the colony for 1 year in exchange for these royal benefits.</p>
          </div>
          
          <div className="royal-exclusivity">
            <div className="exclusivity-badge">LIMITED</div>
            <p>Only 100,000 royal stakers can join the Queen Bee Colony at once. Secure your position in this exclusive group while spots remain available!</p>
            
            <div className="live-counter">
              <div className="counter-label">LIVE COUNTER</div>
              <div className="counter-value">{royalStakers.toLocaleString()}</div>
              <div className="counter-pulse"></div>
            </div>
            
            <div className="progress-container">
              <div className="progress-label">Royal Positions Filled:</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${percentageFilled}%` }}></div>
              </div>
              <div className="progress-stats">
                <span>{royalStakers.toLocaleString()} / {maxRoyalStakers.toLocaleString()}</span>
                <span>{remainingSpots.toLocaleString()} spots remaining</span>
              </div>
            </div>
            
            <div className="urgency-message">
              <span className="urgency-icon">⚠️</span>
              <span>Positions are filling up! Join now to secure your spot in the colony.</span>
            </div>
          </div>
          
          <div className="cta-buttons">
            <Link to="/queen-colony" className="btn btn-royal">
              Join the Queen Bee Colony
            </Link>
          </div>
        </div>
      </section>
      
      {/* Buy Bees Section */}
      <section className="buy-bees">
        <h2 className="section-title">How to Buy Bees</h2>
        
        <div className="info-card">
          <h3>Option 1: Buy Directly</h3>
          <p>
            You can purchase Hives directly through our platform using USDC. This is the simplest way to get started.
          </p>
          
          <h3>Option 2: DEX</h3>
          <p>
            Bee tokens are available on decentralized exchanges. Follow these steps:
          </p>
          <ol>
            <li>Visit PancakeSwap or another supported DEX</li>
            <li>Connect your wallet</li>
            <li>Swap BNB or USDC for Bee tokens</li>
            <li>Import the Bee token to your wallet</li>
          </ol>
          
          <div className="cta-buttons">
            <a href="https://pancakeswap.finance/" target="_blank" rel="noopener noreferrer" className="btn btn-action">
              PancakeSwap
            </a>
            <Link to="/hives" className="btn btn-action">
              Buy Hives
            </Link>
          </div>
        </div>
      </section>
      
      {/* Social Media Links */}
      <section className="social-links">
        <h2 className="section-title">Join Our Community</h2>
        
        <div className="social-grid">
          <a href="https://t.me/BeeKeeperOfficial" target="_blank" rel="noopener noreferrer" className="social-card">
            <i className="fab fa-telegram"></i>
            <span>Telegram</span>
            <p>Join our active community for updates and discussions</p>
          </a>
          
          <a href="https://twitter.com/BeeKeeperFi" target="_blank" rel="noopener noreferrer" className="social-card">
            <i className="fab fa-twitter"></i>
            <span>Twitter</span>
            <p>Follow us for the latest news and announcements</p>
          </a>
          
          <a href="https://dexscreener.com/bsc/beekeeper" target="_blank" rel="noopener noreferrer" className="social-card">
            <i className="fas fa-chart-line"></i>
            <span>DEX Screener</span>
            <p>Track Bee token price and market statistics</p>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Dashboard; 