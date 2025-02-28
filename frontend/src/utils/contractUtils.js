import { ethers } from 'ethers';
import BeeTokenABI from '../artifacts/contracts/BeeToken.sol/BeeToken.json';
import BeeKeeperABI from '../artifacts/contracts/BeeHives.sol/BeeHives.json';
import MockUSDCABI from '../artifacts/contracts/mocks/MockERC20.sol/MockERC20.json';

// Contract addresses - these will be populated after deployment
const CONTRACT_ADDRESSES = {
  BeeToken: process.env.REACT_APP_BEE_TOKEN_ADDRESS || '',
  BeeKeeper: process.env.REACT_APP_BEE_HIVES_ADDRESS || '',
  MockUSDC: process.env.REACT_APP_MOCK_USDC_ADDRESS || ''
};

// Get contract instances
export const getBeeTokenContract = (providerOrSigner) => {
  return new ethers.Contract(
    CONTRACT_ADDRESSES.BeeToken,
    BeeTokenABI.abi,
    providerOrSigner
  );
};

export const getBeeKeeperContract = (providerOrSigner) => {
  return new ethers.Contract(
    CONTRACT_ADDRESSES.BeeKeeper,
    BeeKeeperABI.abi,
    providerOrSigner
  );
};

export const getUSDCContract = (providerOrSigner) => {
  return new ethers.Contract(
    CONTRACT_ADDRESSES.MockUSDC,
    MockUSDCABI.abi,
    providerOrSigner
  );
};

// Contract interaction functions
export const getUserHiveCount = async (address, provider) => {
  try {
    const beeKeeperContract = getBeeKeeperContract(provider);
    const count = await beeKeeperContract.userHives(address).length;
    return count;
  } catch (error) {
    console.error('Error getting user hive count:', error);
    return 0;
  }
};

export const calculateEmissions = async (address, provider) => {
  try {
    const beeKeeperContract = getBeeKeeperContract(provider);
    const emissions = await beeKeeperContract.calculateEmissions(address);
    return emissions;
  } catch (error) {
    console.error('Error calculating emissions:', error);
    return 0;
  }
};

export const claimEmissions = async (signer) => {
  try {
    const beeKeeperContract = getBeeKeeperContract(signer);
    const tx = await beeKeeperContract.claimEmissions();
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error claiming emissions:', error);
    return false;
  }
};

export const compoundEmissions = async (signer) => {
  try {
    const beeKeeperContract = getBeeKeeperContract(signer);
    const tx = await beeKeeperContract.compoundEmissions();
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error compounding emissions:', error);
    return false;
  }
};

export const populateHive = async (amount, signer) => {
  try {
    const beeKeeperContract = getBeeKeeperContract(signer);
    const beeTokenContract = getBeeTokenContract(signer);
    
    // First approve the BeeKeeper contract to spend BEE tokens
    const hivePrice = await beeKeeperContract.hivePrice();
    const totalCost = hivePrice * BigInt(amount);
    
    const approveTx = await beeTokenContract.approve(CONTRACT_ADDRESSES.BeeKeeper, totalCost);
    await approveTx.wait();
    
    // Then populate the hive
    const tx = await beeKeeperContract.populateHive(amount);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error populating hive with BEE:', error);
    return false;
  }
};

export const buyHiveWithUsdc = async (amount, signer) => {
  try {
    const beeKeeperContract = getBeeKeeperContract(signer);
    const usdcContract = getUSDCContract(signer);
    
    // Calculate USDC cost
    const usdcCost = await beeKeeperContract.calculateUsdcCost(amount);
    
    // First approve the BeeKeeper contract to spend USDC
    const approveTx = await usdcContract.approve(CONTRACT_ADDRESSES.BeeKeeper, usdcCost);
    await approveTx.wait();
    
    // Then buy the hive
    const tx = await beeKeeperContract.buyHiveWithUsdc(amount);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error buying hive with USDC:', error);
    return false;
  }
};

// Helper functions
export const formatBigNumber = (value, decimals = 18) => {
  return ethers.formatUnits(value, decimals);
};

export const parseBigNumber = (value, decimals = 18) => {
  return ethers.parseUnits(value.toString(), decimals);
}; 