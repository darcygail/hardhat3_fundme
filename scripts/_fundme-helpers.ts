import { network } from "hardhat";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type HexAddress = `0x${string}`;

function getDeploymentId(chainIdHex: string): string {
    return `chain-${parseInt(chainIdHex, 16)}`;
}

function getDeployedAddress(deploymentId: string, contractKey: string): HexAddress {
    const deploymentPath = join(
        process.cwd(),
        "ignition",
        "deployments",
        deploymentId,
        "deployed_addresses.json"
    );

    const deployedAddresses = JSON.parse(readFileSync(deploymentPath, "utf-8"));
    const address = deployedAddresses[contractKey];

    if (!address) {
        throw new Error(`Contract ${contractKey} not found in ${deploymentId}`);
    }

    if (typeof address !== "string" || !address.startsWith("0x")) {
        throw new Error(`Invalid address for ${contractKey} in ${deploymentId}`);
    }

    return address as HexAddress;
}

export async function getFundMeContext() {
    const { viem, provider } = await network.connect({
        network: process.env.HARDHAT_NETWORK ?? "localhost",
        chainType: "l1",
    });

    const chainIdHex = (await provider.request({
        method: "eth_chainId",
    })) as string;
    const deploymentId = getDeploymentId(chainIdHex);
    const fundMeAddress = getDeployedAddress(deploymentId, "FundMeModule#FundMe");

    const publicClient = await viem.getPublicClient();
    const walletClients = await viem.getWalletClients();

    if (!walletClients[0]?.account) {
        throw new Error("No wallet accounts available from Hardhat");
    }

    const fundMe = await viem.getContractAt("FundMe", fundMeAddress);

    return {
        publicClient,
        walletClients,
        fundMe,
        fundMeAddress,
    };
}

export function pickWalletAccount(
    walletClients: Array<{ account: { address: HexAddress } }>,
    index: number
) {
    if (!Number.isInteger(index) || index < 0) {
        throw new Error(`Invalid account index: ${index}`);
    }
    const client = walletClients[index];
    if (!client?.account) {
        throw new Error(`No account at index ${index}`);
    }
    return client.account;
}
