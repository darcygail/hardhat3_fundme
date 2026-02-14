import { parseEther } from "viem";
import { getFundMeContext, pickWalletAccount } from "./_fundme-helpers.js";

async function main() {
    const { publicClient, walletClients, fundMe, fundMeAddress } = await getFundMeContext();
    const index = 1;
    const user = pickWalletAccount(walletClients, index);

    console.log("FundMe:", fundMeAddress);
    console.log("Fund Account:", user.address, "(index", index, ")");
    console.log("\nFund: attempt with 0.01 ETH (expected to fail)");

    try {
        const txHash = await fundMe.write.fund({
            account: user.address,
            value: parseEther("0.01"),
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        console.log("Fund success (unexpected)");
    } catch (error) {
        console.log("Fund failed (expected):", (error as Error).message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
