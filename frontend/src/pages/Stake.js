import React, { useState } from 'react';
import { useWeb3 } from '../utils/Web3Context';
import '../styles/Stake.css';

const Stake = () => {
  const { isConnected } = useWeb3();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  // Mock data - would be replaced with actual contract data
  const stakeData = {
    totalStaked: '1,245.78',
    yourStaked: '125.5',
    beeBalance: '45.32',
    rewardsAvailable: '12.75',
    apr: '125%'
  };

  const handleStake = (e) => {
    e.preventDefault();
    // Would handle staking logic here
    console.log('Staking:', stakeAmount);
    setStakeAmount('');
  };

  const handleUnstake = (e) => {
    e.preventDefault();
    // Would handle unstaking logic here
    console.log('Unstaking:', unstakeAmount);
    setUnstakeAmount('');
  };

  const handleClaimRewards = () => {
    // Would handle claiming rewards logic here
    console.log('Claiming rewards');
  };

  return (
    <div className="stake">
      <h1 className="page-title">Stake Bees</h1>
      
      {isConnected ? (
        <>
          <section className="stake-overview">
            <div className="overview-card">
              <div className="overview-item">
                <div className="item-label">Total Bees Staked</div>
                <div className="item-value">{stakeData.totalStaked} BEES</div>
              </div>
              
              <div className="overview-item">
                <div className="item-label">Your Staked Bees</div>
                <div className="item-value">{stakeData.yourStaked} BEES</div>
              </div>
              
              <div className="overview-item">
                <div className="item-label">Your Bee Balance</div>
                <div className="item-value">{stakeData.beeBalance} BEES</div>
              </div>
              
              <div className="overview-item">
                <div className="item-label">Rewards Available</div>
                <div className="item-value">{stakeData.rewardsAvailable} BEES</div>
              </div>
              
              <div className="overview-item">
                <div className="item-label">Current APR</div>
                <div className="item-value highlight">{stakeData.apr}</div>
              </div>
              
              <button 
                className="btn btn-claim-rewards"
                onClick={handleClaimRewards}
                disabled={parseFloat(stakeData.rewardsAvailable) <= 0}
              >
                Claim Rewards
              </button>
            </div>
          </section>
          
          <section className="stake-actions">
            <div className="actions-grid">
              <div className="action-card">
                <h3>Stake Bees</h3>
                <form onSubmit={handleStake}>
                  <div className="form-group">
                    <label htmlFor="stakeAmount">Amount to Stake</label>
                    <div className="input-group">
                      <input
                        type="number"
                        id="stakeAmount"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="0.0"
                        min="0"
                        step="0.01"
                        required
                      />
                      <button type="button" className="btn-max" onClick={() => setStakeAmount(stakeData.beeBalance)}>
                        MAX
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-stake" disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}>
                    Stake Bees
                  </button>
                </form>
              </div>
              
              <div className="action-card">
                <h3>Unstake Bees</h3>
                <form onSubmit={handleUnstake}>
                  <div className="form-group">
                    <label htmlFor="unstakeAmount">Amount to Unstake</label>
                    <div className="input-group">
                      <input
                        type="number"
                        id="unstakeAmount"
                        value={unstakeAmount}
                        onChange={(e) => setUnstakeAmount(e.target.value)}
                        placeholder="0.0"
                        min="0"
                        step="0.01"
                        required
                      />
                      <button type="button" className="btn-max" onClick={() => setUnstakeAmount(stakeData.yourStaked)}>
                        MAX
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-unstake" disabled={!unstakeAmount || parseFloat(unstakeAmount) <= 0}>
                    Unstake Bees
                  </button>
                </form>
              </div>
            </div>
          </section>
          
          <section className="staking-info">
            <h2 className="section-title">Staking Information</h2>
            <div className="info-card">
              <p>Staking your BEE tokens allows you to earn additional rewards from the protocol.</p>
              <p>The current APR is <span className="highlight">{stakeData.apr}</span>, which means for every 100 BEES staked, you'll earn approximately {parseInt(stakeData.apr)} BEES per year.</p>
              <p>You can unstake your BEES at any time with no penalty.</p>
              <p>Rewards are distributed continuously and can be claimed at any time.</p>
              <p className="note">Note: Staking does not affect your hive emissions. You will continue to earn BEES from your hives while staking.</p>
            </div>
          </section>
        </>
      ) : (
        <div className="connect-prompt">
          <h2>Connect your wallet to stake</h2>
          <p>Connect your wallet to stake your BEE tokens and earn rewards.</p>
        </div>
      )}
    </div>
  );
};

export default Stake; 