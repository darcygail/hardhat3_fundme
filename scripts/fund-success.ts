import { parseEther } from "viem";
import { getFundMeContext, pickWalletAccount } from "./_fundme-helpers.js";

async function main() {
    const { publicClient, walletClients, fundMe, fundMeAddress } = await getFundMeContext();

    const index = 3;
    const user = pickWalletAccount(walletClients, index);

    console.log("FundMe:", fundMeAddress);
    console.log("Fund Account:", user.address, "(index", index, ")");
    console.log("\nFund: 10 ETH (expected to succeed)");

    const txHash = await fundMe.write.fund({
        account: user.address,
        value: parseEther("10"),
    });
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    const donorsCount = await fundMe.read.donorsCount();
    console.log("Fund success. donorsCount:", donorsCount);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
