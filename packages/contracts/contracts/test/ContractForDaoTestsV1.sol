pragma solidity 0.5.14;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract ContractForDaoTestsV1 is Initializable, Ownable {

    function initialize() initializer public { }
    
    function value() external pure returns (uint256) {
        return 5;
    }
}