// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AccessSmartContract {
    address public DesignerNFTAddress;

    constructor(address _contractAAddress) {
        DesignerNFTAddress = _contractAAddress;
    }

    
}