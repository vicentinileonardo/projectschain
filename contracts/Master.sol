// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DesignerNFT.sol";

contract Master {
    address public DesignerNFTAddress;

    constructor(address _contractAAddress) {
        DesignerNFTAddress = _contractAAddress;
    }

    //from the address of the contract A, we can call the function mintToken
    function mintToken() public returns (uint256){
        (bool success, bytes memory result) = DesignerNFTAddress.call(abi.encodeWithSignature("getTokenPrice()"));
        require(success, "Failed to call getTokenPrice on DesignerNFT");
        uint256 price = abi.decode(result, (uint256));
        return price;
    }

}