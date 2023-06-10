// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DesignerNFT.sol";

contract Master {
    address public DesignerNFTAddress;

    constructor(address _contractAAddress) {
        DesignerNFTAddress = _contractAAddress;
    }

    //from the address of the contract A, we can call the function mintToken
    function mintToken(string memory uri, uint256 price) public returns (bool){
        //TODO: check if the caller is authorized
        
        (bool success, bytes memory result) = DesignerNFTAddress.call(abi.encodeWithSignature("mintToken(address,string, uint256)", msg.sender, uri, price));
        require(success, "Failed to call mintToken on DesignerNFT");
        //address sender = abi.decode(result, (address));
        return success;
    }

}
