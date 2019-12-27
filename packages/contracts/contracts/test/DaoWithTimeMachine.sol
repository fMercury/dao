pragma solidity 0.5.14;

import "../Dao.sol";


/**
 * @dev Time machine features for the Dao
 * @author Kostiantyn Smyrnov <kostysh@gmail.com>
 */
contract DaoWithTimeMachine is Dao {
    uint256 internal _currentTime;

    /**
     * @dev This event will be emitted when contraact time changing
     * @param oldTime Time before the rewind
     * @param newTime New contract time
     */
    event TimeMachine(
        uint256 oldTime,
        uint256 newTime
    );

    /**
     * @dev Get current contract time
     * @return uint256
     */
    function currentTime() public view returns (uint256) {
        return time();
    }

    /**
     * @dev Set new contract time
     * @param time New time value
     */
    function setCurrentTime(uint256 time) external {
        emit TimeMachine(currentTime(), time);
        _currentTime = time;
    }

    /**
     * @dev Return current time
     * @dev uint256
     */
    function time() internal view returns (uint256) {
        return _currentTime == 0 ? now : _currentTime;// solhint-disable-line not-rely-on-time
    }
}