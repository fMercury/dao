pragma solidity 0.5.14;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


contract Erc20Token is ERC20 {

    string public name;
    string public symbol;
    uint public decimals;

    /**
     * @dev Token constructor
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _decimals Token decimals
     * @param _supply Total supply
     */
    constructor(string memory _name, string memory _symbol, uint _decimals, uint256 _supply) public {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _mint(msg.sender, _supply);
    }
}
