import { parseEther } from "viem";
import { getFundMeContext, pickWalletAccount } from "./_fundme-helpers.js";

const RECIPIENT = "0x56e220b2F331130f515c39ddF6AA910986804b89";
const AMOUNT_ETH = "500";
const ACCOUNT_INDEX = Number(process.env.ACCOUNT_INDEX ?? 5);

async function main() {
    const { publicClient, walletClients } = await getFundMeContext();

    const sender = pickWalletAccount(walletClients, ACCOUNT_INDEX);

    console.log("Sender Account:", sender.address, "(index", ACCOUNT_INDEX, ")");
    console.log("Recipient:", RECIPIENT);
    console.log(`Send ${AMOUNT_ETH} ETH`);

    const txHash = await walletClients[ACCOUNT_INDEX].sendTransaction({
        account: sender.address,
        to: RECIPIENT,
        value: parseEther(AMOUNT_ETH),
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log("Transfer success. Tx:", txHash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
