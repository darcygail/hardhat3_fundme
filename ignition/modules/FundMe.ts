import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import hre from "hardhat";

const PRICE_FEEDS: Record<string, string> = {
  sepolia: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  mainnet: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  localhost: "",
};

export default buildModule("FundMeModule", (m) => {
  const networkName = hre.globalOptions.network;
  console.log("Current network:", networkName);

  const feedAddress = PRICE_FEEDS[networkName];

  const priceFeed = (() => {
    if (networkName === "localhost" && !feedAddress) {
      console.log(
        "No price feed address configured for localhost. Deploying mock price feed..."
      );
      const mockDecimals = m.getParameter("mockDecimals", 8);
      const mockPrice = m.getParameter("mockPrice", 2000n * 10n ** 8n);
      return m.contract("MockAggregatorV3", [mockDecimals, mockPrice]);
    }

    if (networkName === "sepolia") {
      return m.contractAt("MockAggregatorV3", PRICE_FEEDS[networkName]);
    }

    throw new Error(`Unsupported network for FundMeModule: ${networkName}`);
  })();

  const fundMe = m.contract("FundMe", [priceFeed]);

  return { fundMe, priceFeed };
});
