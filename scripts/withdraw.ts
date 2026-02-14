import { getFundMeContext } from "./_fundme-helpers.js";

async function main() {
    const { publicClient, walletClients, fundMe, fundMeAddress } = await getFundMeContext();

    const owner = walletClients[0].account;

    console.log("FundMe:", fundMeAddress);
    console.log("Owner Account:", owner.address);
    console.log("\nOwner withdraw");

    const txHash = await fundMe.write.withdraw({ account: owner });
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    console.log("Withdraw success");
    const balance = await publicClient.getBalance({ address: owner.address });
    console.log("Owner balance after withdraw:", Number(balance) / 1e18, "ETH");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
