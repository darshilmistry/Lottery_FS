// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

// error statements
error Lottery__NotEnoughEntryFee();
error Lottery__TransfureFailed();
error Lottery__LotteryClosed();
error Lottery__UpkeepNotNeeded(uint256 balance, uint256 players, uint256 state);

contract Lottery is VRFConsumerBaseV2, KeeperCompatibleInterface {
    enum LotterState {
        Open,
        Closed,
        Calculating,
        Maintainance
    }

    //  State Variables
    address payable[] private s_players;
    address private s_lastWinner;
    LotterState private s_state;
    uint256 private s_Timestamp;

    //  immutables
    VRFCoordinatorV2Interface private immutable i_vrfV2CI;
    uint64 private immutable i_subId;
    bytes32 private immutable i_gaslane;
    uint32 private immutable i_callbackGasLimit;
    uint256 private immutable i_interval;

    //  constants
    uint32 private constant WORDCOUNT = 1;
    uint16 private constant REQUEST_CONFIRMATIONS = 2;

    //  Events
    event LotteryEntry(address indexedPlayer);
    event RequestedWord(uint256 indexed RequestId);
    event WinnerPicked(address indexed winner);
    event LotteryCalculating();
    event PerformUpKeep();
    event UpKeepNotNeede();

    uint256 private immutable i_enteranceFee;

    constructor(
        address vrfCoordinatorV2,
        uint256 entryFee,
        bytes32 gaslane,
        uint64 subId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        s_state = LotterState.Open;
        s_Timestamp = block.timestamp;
        //---------------------------------------------------------------------
        i_vrfV2CI = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_enteranceFee = entryFee;
        i_gaslane = gaslane;
        i_subId = subId;
        i_callbackGasLimit = callbackGasLimit;
        i_interval = interval;
    }

    //  Functions

    function enterLottery() public payable {
        if (msg.value < i_enteranceFee) {
            revert Lottery__NotEnoughEntryFee();
        } else if (s_state == LotterState.Closed) {
            revert Lottery__LotteryClosed();
        } else {
            s_players.push(payable(msg.sender));
            emit LotteryEntry(msg.sender);
        }
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upKeepNeede, ) = checkUpkeep("");

        if (!upKeepNeede) {
            revert Lottery__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_state)
            );
            emit UpKeepNotNeede();
        }

        emit LotteryCalculating();
        s_state = LotterState.Calculating;
        uint256 requestId = i_vrfV2CI.requestRandomWords(
            i_gaslane,
            i_subId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            WORDCOUNT
        );
        emit RequestedWord(requestId);
    }

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        uint256 winnerIndex = randomWords[0] % s_players.length;
        address payable winner = s_players[winnerIndex];
        s_lastWinner = winner;
        (bool success, ) = winner.call{value: address(this).balance}("Congrates You Won!");
        if (!success) {
            revert Lottery__TransfureFailed();
        }
        emit WinnerPicked(winner);
        s_players = new address payable[](0);
        s_state = LotterState.Open;
        s_Timestamp = block.timestamp;
    }

    function checkUpkeep(
        bytes memory /* calldata */
    ) public override returns (bool upkeepNeeded, bytes memory /* performData */) {
        bool isOpen = (LotterState.Open == s_state);
        bool timeinterval = ((block.timestamp - s_Timestamp) >= i_interval);
        bool hasPlayers = (s_players.length > 0);
        bool hasBalance = address(this).balance > 0;

        upkeepNeeded = (isOpen && timeinterval && hasBalance && hasPlayers);
        if (upkeepNeeded) emit PerformUpKeep();
        else emit UpKeepNotNeede();

        return (upkeepNeeded, "0x0");
    }

    //    public view functions

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getEntryFee() public view returns (uint256) {
        return i_enteranceFee;
    }

    function getLastWinner() public view returns (address) {
        return s_lastWinner;
    }

    function getGasLane() public view returns (bytes32) {
        return i_gaslane;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getLotteryState() public view returns (LotterState) {
        return s_state;
    }

    function getPlayerCount() public view returns (uint256) {
        return s_players.length;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_Timestamp;
    }

    function getCallbackGasLimit() public view returns (uint256) {
        return i_callbackGasLimit;
    }

    function getReward() public view returns (uint256) {
        return address(this).balance;
    }
}
