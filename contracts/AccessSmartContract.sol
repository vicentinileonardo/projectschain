// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import './ProjectNFT.sol';

contract AccessSmartContract {
    ProjectNFT private projectNFT;
    uint256 private tokenId;
    address private ManufacturerAddress;
    uint256 private expirationTime;
    

    constructor(address projectNFTAddress, uint256 _tokenId, address _manufacturerAddress){
        projectNFT = ProjectNFT(projectNFTAddress);

        projectNFT.getTokenPrice(_tokenId); //check if token exists

        tokenId=_tokenId;
        ManufacturerAddress = _manufacturerAddress;
        expirationTime = block.timestamp + 60*60*24*31*3; // add 3 months
    }

    function getTokenDetails() public view returns (string memory){
        //require(msg.sender==ManufacturerAddress || msg.sender==MASTER);
        require(expirationTime>block.timestamp);

        return projectNFT.getProjectHash(tokenId);
    }
}