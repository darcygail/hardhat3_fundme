# FundMe - 智能合约众筹平台

🌐 **语言**: [English](README.md) | [中文](README.zh-CN.md)

> 📚 **参考自**: [Full Blockchain Solidity Course - Lesson 6: Hardhat Simple Storage](https://github.com/smartcontractkit/full-blockchain-solidity-course-js?tab=readme-ov-file#lesson-6-hardhat-simple-storage)
>
> 🔧 **版本**: Hardhat 3.x 实现

一个去中心化的众筹智能合约，使用 Solidity 编写，允许用户用 ETH 进行捐赠，并通过 Chainlink 价格预言机实现美元最低要求的实时验证。

## 🌐 线上部署

- **网络**: Sepolia 测试网
- **合约地址**: [0x3b0C7406462A73b51e7E8a4cB945B3Cd11b50Beb](https://sepolia.etherscan.io/address/0x3b0C7406462A73b51e7E8a4cB945B3Cd11b50Beb)
- **区块浏览器**: Etherscan Sepolia

## 📋 功能特性

- ✅ **ETH 捐赠**: 用户可以向合约捐赠以太币
- ✅ **美元最低限制**: 通过 Chainlink 价格预言机强制实施最低捐赠额 $50 USD
- ✅ **捐赠者追踪**: 维护所有捐赠者及其捐赠金额的列表
- ✅ **所有者提取**: 仅合约所有者可以提取累积资金
- ✅ **价格源集成**: 使用 Chainlink Data Feeds 实时转换 ETH/USD 价格
- ✅ **事件日志**: 为捐赠和提取操作发出事件

## 🏗️ 项目结构

```
hardhat3-fundme/
├── contracts/
│   ├── FundMe.sol                # 主合约
│   ├── FundMe.t.sol              # 单元测试 (Solidity)
│   ├── interfaces/
│   │   └── AggregatorV3Interface.sol
│   ├── mock/
│   │   └── MockAggregatorV3.sol  # 本地测试用 Mock
├── ignition/
│   ├── modules/
│   │   └── FundMe.ts             # 部署模块
│   └── parameters/
│       └── mockPriceFeed.json    # Mock Price Feed parameters
├── scripts/
│   ├── fund.ts                   # 捐赠脚本（含失败测试）
│   ├── fund-success.ts           # 成功捐赠脚本
│   ├── withdraw.ts               # 提取脚本
│   └── _fundme-helpers.ts        # 辅助函数
├── test/
│   ├── FundMe.integration.ts     # 集成测试
│   └── FundMe.ts                 # TS 单元测试（已存档）
├── hardhat.config.ts             # Hardhat 配置
├── .env                          # 环境变量
└── .prettierrc                   # 代码格式化规则
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm 或 yarn

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd hardhat-tutorial

# 安装依赖
npm install

# 配置环境
cp .env.example .env
# 使用你的 RPC URL 和私钥编辑 .env
```

### 环境变量

在项目根目录创建 `.env` 文件：

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
SEPOLIA_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 🧪 测试

### 运行所有测试

```bash
# Solidity 单元测试 + TS 集成测试
npx hardhat test
```

### 运行特定测试

```bash
# 仅 Solidity 单元测试
npx hardhat test contracts/FundMe.t.sol

# 仅集成测试
npx hardhat test test/FundMe.integration.ts
```

### 测试覆盖

项目包含：
- **11 个 Solidity 单元测试**，覆盖：
  - 所有者验证
  - 捐赠成功/失败场景
  - 捐赠者追踪
  - 美元最低要求
  - 提取功能
  - 访问控制

- **1 个集成测试**，覆盖：
  - 完整的捐赠 → 提取流程
  - 同账户多次捐赠
  - 余额验证

## 📝 合约详解

### FundMe.sol

#### 状态变量

- `owner`: 合约所有者（谁可以提取资金）
- `MIN_USD`: 最低美元值（$50 * 1e8）
- `priceFeed`: Chainlink AggregatorV3Interface
- `donations`: 用户地址到捐赠金额的映射
- `donors`: 所有捐赠者地址的数组

#### 关键函数

```solidity
// 用 ETH 捐赠合约（最少 $50 USD）
function fund() external payable

// 所有者提取所有资金
function withdraw() external onlyOwner

// 获取 ETH 金额的美元价值
function getUsdValue(uint256 ethAmount) public view returns (uint256)

// 获取捐赠者总数
function donorsCount() external view returns (uint256)
```

#### 事件

```solidity
event Funded(address indexed donor, uint256 amount);
event Withdrawn(address indexed to, uint256 amount);
```

## 🚢 部署

### 部署到本地

```bash
# 启动本地 Hardhat 节点
npx hardhat node

# 部署（在另一个终端）
npx hardhat ignition deploy ./ignition/modules/FundMe.ts --network localhost
```

### 部署到 Sepolia

```bash
npx hardhat ignition deploy ./ignition/modules/FundMe.ts --network sepolia
```

部署工件保存在:
```
ignition/deployments/chain-{chainId}/
```

## 💼 脚本

### 捐赠脚本（含失败测试）

```bash
# 用账户索引 0 捐赠（默认）
npx hardhat run scripts/fund.ts --network localhost

# 用指定账户捐赠
FUND_ACCOUNT_INDEX=1 npx hardhat run scripts/fund.ts --network localhost
```

### 成功捐赠脚本

```bash
# 用账户索引 0 捐赠 10 ETH
npx hardhat run scripts/fund-success.ts --network localhost

# 用指定账户捐赠
FUND_ACCOUNT_INDEX=2 npx hardhat run scripts/fund-success.ts --network localhost
```

### 提取脚本

```bash
# 以所有者身份提取（账户 0）
npx hardhat run scripts/withdraw.ts --network localhost
```

## 🔌 使用 FundMe

### 捐赠合约

```typescript
import { parseEther } from "viem";

const fundMe = await viem.getContractAt("FundMe", fundMeAddress);

// 捐赠 0.1 ETH
const txHash = await fundMe.write.fund({
  account: userAccount,
  value: parseEther("0.1"),
});
```

### 查询捐赠

```typescript
const donation = await fundMe.read.donations([userAddress]);
console.log(`用户捐赠: ${donation / BigInt(1e18)} ETH`);
```

### 获取美元价值

```typescript
const ethAmount = parseEther("0.025"); // 0.025 ETH
const usdValue = await fundMe.read.getUsdValue([ethAmount]);
console.log(`美元价值: ${usdValue / BigInt(1e8)} USD`); // $50
```

### 提取资金

```typescript
// 仅所有者可以提取
const txHash = await fundMe.write.withdraw({
  account: ownerAccount,
});
```

## 🔗 价格源详情

- **Chainlink Data Feed**: Sepolia 上的 ETH/USD
- **精度**: 8 位小数（Chainlink 标准）
- **价格示例**: $2000/ETH = 2000e8

## 📦 依赖

- `@nomicfoundation/hardhat-toolbox-viem`: Hardhat + viem 集成
- `@nomicfoundation/hardhat-ignition`: 部署框架
- `@chainlink/contracts`: Chainlink 价格源接口
- `@openzeppelin/contracts`: OpenZeppelin 工具库

## 🛠️ 开发

### 格式化代码

```bash
npx prettier --write "**/*.ts" "**/*.sol"
```

### 编译合约

```bash
npx hardhat compile
```

### 查看账户

```bash
npx hardhat accounts
```

## 📚 资源

- [Hardhat 文档](https://hardhat.org/)
- [Chainlink Data Feeds](https://docs.chain.link/data-feeds)
- [Viem 文档](https://viem.sh/)
- [Solidity 文档](https://docs.soliditylang.org/)

## 🎯 最低捐赠要求

根据当前市场价格（Chainlink ETH/USD）：

| ETH 金额  | 美元价值  |
|----------|----------|
| 0.025 ETH | ~$50 USD  |
| 0.05 ETH  | ~$100 USD |
| 0.1 ETH   | ~$200 USD |

*价格取决于实时 Chainlink 数据源*

## ⚠️ 安全考虑

- 合约使用 `call` 进行 ETH 转账（推荐方式，优于 `transfer`）
- 仅所有者函数受 `onlyOwner` 修饰符保护
- 捐赠金额的输入验证
- 无重入风险，因为 withdraw 是唯一发送 ETH 的函数

## 📄 许可证

UNLICENSED

## 👨‍💻 作者

darcy.cj51@gmail.com

## 🤝 贡献

欢迎贡献！请随时提交问题或拉取请求。

---

**注意**: 这是一个教程/演示合约。在生产环境使用前请进行全面的安全审计。
