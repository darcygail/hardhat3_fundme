// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { FundMe } from "./FundMe.sol";
import { MockAggregatorV3 } from "./mock/MockAggregatorV3.sol";

contract FundMeTest {
  FundMe fundMe;
  MockAggregatorV3 mockAggregator;

  address owner = address(1);
  address user1 = address(2);

  uint8 constant MOCK_DECIMALS = 8;
  int256 constant MOCK_PRICE = 2000e8; // $2000 per ETH

  function setUp() public {
    mockAggregator = new MockAggregatorV3(MOCK_DECIMALS, MOCK_PRICE);
    fundMe = new FundMe(address(mockAggregator));
  }

  // Allow contract to receive ETH
  receive() external payable {}

  function test_OwnerSetCorrectly() public view {
    require(fundMe.owner() == address(this), "Owner should be set to deployer");
  }

  function test_MinUsdConstant() public view {
    require(fundMe.MIN_USD() == 50 * 1e8, "MIN_USD should be 50e8");
  }

  function test_FundSuccessWithSufficientAmount() public {
    uint256 sendAmount = 0.1 ether;
    fundMe.fund{ value: sendAmount }();

    require(
      fundMe.donations(address(this)) == sendAmount,
      "Donation amount should be recorded"
    );
    require(fundMe.donorsCount() == 1, "Should have 1 donor");
  }

  function test_FundFailsWithInsufficientAmount() public {
    uint256 sendAmount = 0.001 ether; // Too small

    try fundMe.fund{ value: sendAmount }() {
      require(false, "Should have reverted");
    } catch {
      // Expected revert
    }
  }

  function test_FundWithZeroAmount() public {
    try fundMe.fund{ value: 0 }() {
      require(false, "Should have reverted");
    } catch {
      // Expected revert
    }
  }

  function test_DonorTracking() public {
    uint256 sendAmount = 0.025 ether; // Exactly $50

    fundMe.fund{ value: sendAmount }();

    require(
      fundMe.donations(address(this)) == sendAmount,
      "First donation should be tracked"
    );
    require(fundMe.donorsCount() == 1, "Should have 1 donor");

    // Fund again with same account
    fundMe.fund{ value: sendAmount }();

    require(
      fundMe.donations(address(this)) == sendAmount * 2,
      "Second donation should be added"
    );
    require(fundMe.donorsCount() == 1, "Should still have 1 donor");
  }

  function test_GetUsdValue() public view {
    // 0.025 ETH * $2000/ETH = $50 = 50e8
    uint256 ethAmount = 0.025 ether;
    uint256 usdValue = fundMe.getUsdValue(ethAmount);

    require(usdValue == 50e8, "USD value calculation is incorrect");
  }

  function test_MinimumUsdRequirement() public {
    // Need $50, at $2000/ETH = 0.025 ETH
    uint256 minAmount = 0.025 ether;

    // Just below minimum should fail
    try fundMe.fund{ value: minAmount - 1 wei }() {
      require(false, "Should have reverted for insufficient amount");
    } catch {
      // Expected revert
    }

    // At minimum should succeed
    fundMe.fund{ value: minAmount }();

    require(
      fundMe.donations(address(this)) == minAmount,
      "Fund at minimum should succeed"
    );
  }

  function test_WithdrawSuccessful() public {
    uint256 fundAmount = 0.1 ether;
    fundMe.fund{ value: fundAmount }();

    uint256 contractBalanceBefore = address(fundMe).balance;
    require(
      contractBalanceBefore == fundAmount,
      "Contract should have funded amount"
    );

    fundMe.withdraw();

    uint256 contractBalanceAfter = address(fundMe).balance;
    require(contractBalanceAfter == 0, "Contract balance should be 0 after withdraw");
  }

  function test_WithdrawFailsIfNoFunds() public {
    try fundMe.withdraw() {
      require(false, "Should have reverted");
    } catch {
      // Expected revert
    }
  }

  function test_OnlyOwnerCanWithdraw() public {
    fundMe.fund{ value: 0.1 ether }();
    require(fundMe.owner() == address(this), "Owner should be this contract");
  }
}
