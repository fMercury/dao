pragma solidity 0.5.14;

import "./ContractForDaoTestsV1.sol";


contract ContractForDaoTestsV2 is ContractForDaoTestsV1 {

    // new function added
    function newFunction() public pure returns(uint256) {
        return 100;
    }
}