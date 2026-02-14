import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import { defineConfig } from "hardhat/config";
import { allTasks } from "./tasks/index.js";
import "dotenv/config";

// For localhost and hardhat networks, we use a common private key and mnemonic for testing.
const LOCALHOST_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const LOCALHOST_MNEMONIC =
  "test test test test test test test test test test test junk";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin, hardhatVerify],
  tasks: allTasks,
  solidity: {
    profiles: {
      default: {
        version: "0.8.20",
      },
      production: {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY!,
      enabled: true,
    },
  },
  networks: {
    localhost: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:8545",
    },
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
      accounts: {
        mnemonic: LOCALHOST_MNEMONIC,
      },
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
      accounts: {
        mnemonic: LOCALHOST_MNEMONIC,
      },
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: process.env.SEPOLIA_RPC_URL!,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY!],
    },
  },
});
