pragma solidity 0.5.14;

import "../Dao.sol";


contract DaoWithTimeMachine is Dao {
    uint256 public currentTime;

    function setCurrentTime(uint256 time) external {
        currentTime = time;
    }

    function time() internal view returns (uint256) {
        return currentTime == 0 ? now : currentTime;// solhint-disable-line not-rely-on-time
    }
}