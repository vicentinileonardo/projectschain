// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ProjectNFT.sol";

contract Master {
    address public projectNFTAddress;

    constructor(address _contractAddress) {
        projectNFTAddress = _contractAddress;
    }

    //from the address of the contract A, we can call the function mintToken
    function mintToken(string memory uri, uint256 price) public returns (bool){ //aggiungere hash
        //TODO: check if the caller is authorized
        
        (bool success, bytes memory result) = projectNFTAddress.call(abi.encodeWithSignature("mintToken(address,string, uint256)", msg.sender, uri, price));
        require(success, "Failed to call mintToken on DesignerNFT");
        //address sender = abi.decode(result, (address));

        return success;
    }

}
