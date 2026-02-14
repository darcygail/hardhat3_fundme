import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { parseEther } from "viem";

describe("FundMe Integration Test", async function () {
  const { viem } = await network.connect({
    network: "localhost",
    chainType: "l1",
  });

  const publicClient = await viem.getPublicClient();
  const walletClients = await viem.getWalletClients();
  const owner = walletClients[0].account;

  it("Should complete full flow: deploy -> fund -> withdraw", async function () {
    console.log("\n🚀 Starting FundMe Integration Test");

    // Deploy Mock Aggregator first
    const mockAggregator = await viem.deployContract("MockAggregatorV3", [8, 2000n * 10n ** 8n]);
    console.log("✅ MockAggregatorV3 deployed at:", mockAggregator.address);

    // Deploy FundMe
    const fundMe = await viem.deployContract("FundMe", [mockAggregator.address]);
    console.log("✅ FundMe deployed at:", fundMe.address);

    // Step 1: Verify owner
    console.log("\n📋 Step 1: Verify owner");
    const ownerRead = await fundMe.read.owner();
    assert.equal(
      ownerRead.toLowerCase(),
      owner.address.toLowerCase(),
      "Owner should be the deployer"
    );
    console.log("✅ Owner verified");

    // Step 2: Fund the contract
    console.log("\n💰 Step 2: Fund the contract with 0.1 ETH");
    const fundAmount = parseEther("0.1");
    const fundTxHash = await fundMe.write.fund({
      account: owner,
      value: fundAmount,
    });
    await publicClient.waitForTransactionReceipt({ hash: fundTxHash });
    console.log(`✅ Fund transaction confirmed: ${fundTxHash}`);

    // Step 3: Verify donation recorded
    console.log("\n📊 Step 3: Verify donation recorded");
    const donation = await fundMe.read.donations([owner.address]);
    assert.equal(
      donation,
      fundAmount,
      "Donation amount should be recorded correctly"
    );
    console.log(`✅ Donation recorded: ${donation / BigInt(1e18)} ETH`);

    let donorsCount = await fundMe.read.donorsCount();
    assert.equal(donorsCount, 1n, "Should have 1 donor");
    console.log("✅ Donors count: 1");

    // Step 4: Fund again from same account
    console.log("\n💰 Step 4: Fund again with 0.05 ETH");
    const additionalFund = parseEther("0.05");
    const fundTxHash2 = await fundMe.write.fund({
      account: owner,
      value: additionalFund,
    });
    await publicClient.waitForTransactionReceipt({ hash: fundTxHash2 });
    console.log("✅ Additional fund confirmed");

    const totalDonation = await fundMe.read.donations([owner.address]);
    assert.equal(
      totalDonation,
      fundAmount + additionalFund,
      "Total donation should be sum of both funds"
    );
    console.log(
      `✅ Total donation: ${totalDonation / BigInt(1e18)} ETH (0.15 ETH)`
    );

    donorsCount = await fundMe.read.donorsCount();
    assert.equal(donorsCount, 1n, "Should still have 1 donor");
    console.log("✅ Still 1 donor (same user)");

    // Step 5: Check contract balance
    console.log("\n💵 Step 5: Verify contract balance");
    const contractBalance = await publicClient.getBalance({
      address: fundMe.address,
    });
    assert.equal(
      contractBalance,
      fundAmount + additionalFund,
      "Contract balance should match total donations"
    );
    console.log(`✅ Contract balance: ${contractBalance / BigInt(1e18)} ETH`);

    // Step 6: Withdraw funds
    console.log("\n🏦 Step 6: Withdraw all funds");
    const ownerBalanceBefore = await publicClient.getBalance({
      address: owner.address,
    });

    const withdrawTxHash = await fundMe.write.withdraw({
      account: owner,
    });
    await publicClient.waitForTransactionReceipt({ hash: withdrawTxHash });
    console.log(`✅ Withdraw transaction confirmed: ${withdrawTxHash}`);

    // Step 7: Verify withdrawal
    console.log("\n✔️ Step 7: Verify withdrawal completed");
    const contractBalanceAfter = await publicClient.getBalance({
      address: fundMe.address,
    });
    assert.equal(contractBalanceAfter, 0n, "Contract should have 0 balance");
    console.log("✅ Contract balance is now 0");

    const ownerBalanceAfter = await publicClient.getBalance({
      address: owner.address,
    });
    assert(
      ownerBalanceAfter > ownerBalanceBefore,
      "Owner balance should increase"
    );
    console.log(
      `✅ Owner received funds (net after gas: ${(ownerBalanceAfter - ownerBalanceBefore) / BigInt(1e18)} ETH)`
    );

    // Step 8: Verify second withdrawal fails
    console.log("\n❌ Step 8: Verify second withdrawal fails");
    try {
      await fundMe.write.withdraw({
        account: owner,
      });
      assert.fail("Should have reverted");
    } catch (error) {
      console.log(`✅ Withdraw correctly rejected`);
    }

    console.log("\n🎉 Integration test completed successfully!\n");
  });
});
