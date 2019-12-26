pragma solidity 0.5.14;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract ContractForDaoTestsV1 is Initializable, Ownable {

    uint256 public val;
    bool public aaa;

    function initialize(
        uint256 _val, 
        address _manager
    ) initializer public {
        val = _val;
        _transferOwnership(_manager);
    }
    
    function getValue() external view returns (uint256) {
        return val;
    }

    function setA(bool a) external {
        aaa = a;
    }
}