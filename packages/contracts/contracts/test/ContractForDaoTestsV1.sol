pragma solidity 0.5.14;

import "@openzeppelin/upgrades/contracts/Initializable.sol";


contract ContractForDaoTestsV1 is Initializable {

    uint256 public val;

    function initialize(uint256 _val) initializer public {
        val = _val;
    }
    
    function getValue() external view returns (uint256) {
        return val;
    }
}