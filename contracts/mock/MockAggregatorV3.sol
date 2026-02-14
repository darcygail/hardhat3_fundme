// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// solhint-disable-next-line max-line-length
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/// @title MockAggregatorV3
/// @notice A mock implementation of Chainlink's AggregatorV3Interface for testing
/// @dev Used to simulate price feed behavior without requiring external oracle data
contract MockAggregatorV3 is AggregatorV3Interface {
  uint8 private _decimals;
  int256 private _answer;

  /// @notice Initializes the mock aggregator with decimals and initial price
  /// @param decimals_ Number of decimal places for the price (typically 8)
  /// @param initialAnswer_ The initial price value
  constructor(uint8 decimals_, int256 initialAnswer_) {
    _decimals = decimals_;
    _answer = initialAnswer_;
  }

  /// @notice Returns the number of decimals for the price
  /// @return The decimal precision of the price value
  function decimals() external view override returns (uint8) {
    return _decimals;
  }

  /// @notice Returns a description of the price feed
  /// @return A string describing the mock aggregator
  function description() external pure override returns (string memory) {
    return "Mock Aggregator V3";
  }

  /// @notice Returns the version of the aggregator
  /// @return The version number
  function version() external pure override returns (uint256) {
    return 1;
  }

  /// @notice Returns the price data for a specific round
  /// @param _roundId The round ID to retrieve data for
  /// @return roundId The round ID
  /// @return answer The price answer
  /// @return startedAt The timestamp when the round started
  /// @return updatedAt The timestamp when the round was updated
  /// @return answeredInRound The round ID where the answer was computed
  function getRoundData(uint80 _roundId)
    external
    view
    override
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    )
  {
    return (_roundId, _answer, block.timestamp, block.timestamp, _roundId);
  }

  /// @notice Returns the most recent price round data
  /// @return roundId The current round ID
  /// @return answer The current price answer
  /// @return startedAt The timestamp when the current round started
  /// @return updatedAt The timestamp when the current round was updated
  /// @return answeredInRound The round ID where the current answer was computed
  function latestRoundData()
    external
    view
    override
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    )
  {
    return (1, _answer, block.timestamp, block.timestamp, 1);
  }

  /// @notice Updates the mock price to a new value
  /// @param newAnswer The new price value to set
  function setLatestAnswer(int256 newAnswer) external {
    _answer = newAnswer;
  }
}
