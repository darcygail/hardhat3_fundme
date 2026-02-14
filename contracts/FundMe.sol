// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract FundMe {
  address public owner;

  AggregatorV3Interface public immutable priceFeed;
  uint256 public constant MIN_USD = 50 * 1e8; // $50, 8 decimals

  mapping(address => uint256) public donations;
  address[] public donors;

  event Funded(address indexed donor, uint256 amount);
  event Withdrawn(address indexed to, uint256 amount);

  constructor(address priceFeedAddress) {
    owner = msg.sender;
    priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "FundMe: caller is not the owner");
    _;
  }

  function fund() external payable {
    require(msg.value > 0, "FundMe: amount must be greater than 0");
    uint256 usdValue = getUsdValue(msg.value);
    require(
      usdValue >= MIN_USD,
      string(
        abi.encodePacked(
          "FundMe: minimum is $50, current value is $",
          Strings.toString(usdValue / 1e8)
        )
      )
    );

    if (donations[msg.sender] == 0) {
      donors.push(msg.sender);
    }

    donations[msg.sender] += msg.value;
    emit Funded(msg.sender, msg.value);
  }

  function withdraw() external onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, "FundMe: no funds to withdraw");

    (bool success, ) = payable(owner).call{value: balance}("");
    require(success, "FundMe: withdraw failed");

    emit Withdrawn(owner, balance);
  }

  function donorsCount() external view returns (uint256) {
    return donors.length;
  }

  function getUsdValue(uint256 ethAmount) public view returns (uint256) {
    (, int256 answer, , , ) = priceFeed.latestRoundData();
    require(answer > 0, "FundMe: invalid price");
    uint256 price = uint256(answer); // 8 decimals
    return (ethAmount * price) / 1e18; // returns USD with 8 decimals
  }
}
