pragma solidity 0.5.14;


/**
 * @title Voting utilities
 * @dev This library holds voting utilities
 * @author Kostiantyn Smyrnov <kostysh@gmail.com>
 */
library VotingLib {

    /**
     * @dev Returns a square root
     * @param x Source
     * @return square root from the x
     */
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        
        // solhint-disable-next-line no-inline-assembly
        assembly {
            let z := div(add(x, 1), 2)
            y := x
            for { } lt(z, y) { } {
                y := z
                z := div(add(div(x, z), z), 2)
            }
        }

        return y;
    }
}