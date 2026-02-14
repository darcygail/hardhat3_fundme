import { HardhatRuntimeEnvironment } from "hardhat/types/hre";

export default async function (
  _taskArguments: any,
  hre: HardhatRuntimeEnvironment
) {
  const { viem } = await hre.network.connect();
  const blockNumber = await (await viem.getPublicClient()).getBlockNumber();
  console.log("Current block number:", blockNumber);
}
