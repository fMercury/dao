pragma solidity 0.5.14;

import "./ContractForDaoTestsV1.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract ContractForDaoTestsV2 is ContractForDaoTestsV1, Ownable {

    function setOwner(address _manager) public {
        _transferOwnership(_manager);
    }

    // new function added
    function setVal(uint256 _val) public onlyOwner {
        val = _val;
    }
}