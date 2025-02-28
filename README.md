# BeeHive Ecosystem

The BeeHive Ecosystem is a decentralized platform for creating and managing virtual beehives, staking tokens, and earning rewards.

## Contract Architecture

The BeeHive ecosystem consists of several contracts that work together to provide a complete DeFi experience. To address the contract size limitations of the Ethereum Virtual Machine (EVM), we've split the deployment into multiple factory contracts:

### Factory Contracts

1. **BeeTokenFactory**: Deploys the token contracts
   - BeeToken
   - HunyToken

2. **BeeEcosystemFactory**: Deploys the core ecosystem contracts
   - HiveManager
   - QueenColony
   - Marketplace
   - EmissionsController

3. **BeeHivesFactory**: Deploys the hive and staking contracts
   - BeeHives
   - BeeStaking

### Core Contracts

- **BeeToken**: The primary utility token of the ecosystem
- **HunyToken**: Secondary token used for special features
- **HiveManager**: Manages the creation and tracking of hives
- **QueenColony**: Special hives with enhanced capabilities
- **Marketplace**: Allows trading of hives and tokens
- **EmissionsController**: Controls token emission rates
- **BeeHives**: Manages the creation and rewards of standard hives
- **BeeStaking**: Allows users to stake BEE tokens for rewards

## Deployment Strategy

The deployment is split into multiple steps to avoid contract size limitations:

1. Deploy BeeTokenFactory
2. Use BeeTokenFactory to deploy BeeToken and HunyToken
3. Deploy BeeEcosystemFactory
4. Use BeeEcosystemFactory to deploy core ecosystem contracts
5. Deploy BeeHivesFactory
6. Use BeeHivesFactory to deploy BeeHives and BeeStaking
7. Set up permissions and roles between contracts

This approach ensures that each factory contract remains under the EVM size limit of 24KB while still providing a streamlined deployment process.

## Development

### Prerequisites

- Node.js v14+ and npm
- Hardhat

### Installation

```bash
npm install
```

### Testing

```bash
npx hardhat test
```

### Deployment

```bash
npx hardhat run scripts/deploy.js --network bscTestnet
```

## Contract Size Optimization

To address the contract size limitations, we've implemented the following strategies:

1. **Split Factory Pattern**: Dividing deployment logic across multiple factory contracts
2. **Modular Design**: Each contract has a specific purpose and minimal dependencies
3. **Optimizer Settings**: Using the Solidity optimizer with low runs value (1) to prioritize deployment size over runtime efficiency

## Security Considerations

- All contracts use OpenZeppelin's security libraries
- Reentrancy protection is implemented for all state-changing functions
- Role-based access control for privileged operations
- Thorough testing of all contract interactions

## License

MIT 