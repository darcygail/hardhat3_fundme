# FundMe - Smart Contract Fundraising Platform

🌐 **Languages**: [English](README.md) | [中文](README.zh-CN.md)

> 📚 **Based on**: [Full Blockchain Solidity Course - Lesson 6: Hardhat Simple Storage](https://github.com/smartcontractkit/full-blockchain-solidity-course-js?tab=readme-ov-file#lesson-6-hardhat-simple-storage)
>
> 🔧 **Version**: Hardhat 3.x implementation

A decentralized fundraising smart contract built with Solidity that allows users to fund in ETH with a minimum USD requirement using Chainlink price feeds for real-time price data.

## 🌐 Live Deployment

- **Network**: Sepolia Testnet
- **Contract Address**: [0x3b0C7406462A73b51e7E8a4cB945B3Cd11b50Beb](https://sepolia.etherscan.io/address/0x3b0C7406462A73b51e7E8a4cB945B3Cd11b50Beb)
- **Block Explorer**: Etherscan Sepolia

## 📋 Features

- ✅ **ETH Funding**: Users can fund the contract in Ether
- ✅ **USD Minimum Requirement**: Enforces a minimum funding amount of $50 USD using Chainlink price feeds
- ✅ **Donor Tracking**: Maintains a list of all donors and their contribution amounts
- ✅ **Owner Withdrawal**: Only the contract owner can withdraw accumulated funds
- ✅ **Price Feed Integration**: Real-time ETH/USD price conversion using Chainlink Data Feeds
- ✅ **Event Logging**: Emits events for funding and withdrawal activities

## 🏗️ Project Structure

```
hardhat3-fundme/
├── contracts/
│   ├── FundMe.sol                # Main contract
│   ├── FundMe.t.sol              # Unit tests (Solidity)
│   ├── interfaces/
│   │   └── AggregatorV3Interface.sol
│   ├── mock/
│   │   └── MockAggregatorV3.sol  # Local testing mock
├── ignition/
│   ├── modules/
│   │   └── FundMe.ts             # Deployment module
│   └── parameters/
│       └── mockPriceFeed.json    # Mock Price Feed parameters
├── scripts/
│   ├── fund.ts                   # Fund script (with failure test)
│   ├── fund-success.ts           # Successful fund script
│   ├── withdraw.ts               # Withdraw script
│   └── _fundme-helpers.ts        # Helper functions
├── test/
│   ├── FundMe.integration.ts     # Integration tests
│   └── FundMe.ts                 # TS unit tests (archived)
├── hardhat.config.ts             # Hardhat configuration
├── .env                          # Environment variables
└── .prettierrc                   # Code formatting rules
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hardhat-tutorial

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your RPC URLs and private keys
```

### Environment Variables

Create a `.env` file in the root directory:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
SEPOLIA_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 🧪 Testing

### Run Unit Tests

```bash
# Solidity unit tests + TS integration tests
npx hardhat test 
```

### Run Integration Tests

```bash
# Solidity unit tests + TS integration tests
npx hardhat test nodejs
```

### Test Coverage

The project includes:
- **11 Solidity Unit Tests** covering:
  - Owner verification
  - Fund success/failure scenarios
  - Donor tracking
  - USD minimum requirements
  - Withdraw functionality
  - Access control

- **1 Integration Test** covering:
  - Complete fund → withdraw flow
  - Multiple fundings from same account
  - Balance verification

## 🚢 Deployment

### Deploy to Localhost

```bash
# Start local Hardhat node
npx hardhat node

# Deploy (in another terminal)
npx hardhat ignition deploy ./ignition/modules/FundMe.ts --network localhost --parameters ignition/parameters/mockPriceFeed.json
```

### Deploy to Sepolia

```bash
npx hardhat ignition deploy ./ignition/modules/FundMe.ts --network sepolia
```

## 💼 Scripts

### Fund Script (with failure test)

```bash
# Fund with account index 0 (default)
npx hardhat run scripts/fund.ts --network localhost

# Fund with specific account
FUND_ACCOUNT_INDEX=1 npx hardhat run scripts/fund.ts --network localhost
```

### Successful Fund Script

```bash
# Fund 10 ETH with account index 0
npx hardhat run scripts/fund-success.ts --network localhost

# Fund with specific account
FUND_ACCOUNT_INDEX=2 npx hardhat run scripts/fund-success.ts --network localhost
```

### Withdraw Script

```bash
# Withdraw as owner (account 0)
npx hardhat run scripts/withdraw.ts --network localhost
```

## 📦 Dependencies

- `@nomicfoundation/hardhat-toolbox-viem`: Hardhat + viem integration
- `@nomicfoundation/hardhat-ignition`: Deployment framework
- `@chainlink/contracts`: Chainlink price feed interfaces
- `@openzeppelin/contracts`: OpenZeppelin utilities

## 🛠️ Development

### Format Code

```bash
npx prettier --write "**/*.ts" "**/*.sol"
```

### Compile Contracts

```bash
npx hardhat compile
```

## 📚 Resources

- [Hardhat Documentation](https://hardhat.org/)
- [Chainlink Data Feeds](https://docs.chain.link/data-feeds)
- [Viem Documentation](https://viem.sh/)
- [Solidity Documentation](https://docs.soliditylang.org/)

## 🎯 Minimum Funding Requirements

At current market prices (ETH/USD from Chainlink):

| ETH Amount | USD Value |
|-----------|-----------|
| 0.025 ETH | ~$50 USD  |
| 0.05 ETH  | ~$100 USD |
| 0.1 ETH   | ~$200 USD |

*Prices depend on real-time Chainlink data feeds*

## ⚠️ Security Considerations

- Contract uses `call` for ETH transfer (recommended over `transfer`)
- Owner-only functions protected with `onlyOwner` modifier
- Input validation on fund amounts
- No reentrancy issues as withdraw is the only ETH-sending function

## 📄 License

UNLICENSED

## 👨‍💻 Author

darcy.cj51@gmail.com

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

**Note**: This is a tutorial/demo contract. Do thorough security audits before using in production.
