// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import './ProjectNFT.sol';

contract AccessSmartContract {
    ProjectNFT private projectNFT;

    // Maps owner address to bought tokens
    mapping(address => mapping(uint256 => bool)) private _addressToTokens;

    // Maps ownership to expiration date
    // Key is hash of tuple (address, uint256) for address of owner and tokenId
    // See https://stackoverflow.com/questions/56292828/can-i-use-tuple-as-a-key-in-mapping
    mapping(bytes32 => uint256) private _ownershipExpirationTime;
    
    constructor(address projectNFTAddress){
        projectNFT = ProjectNFT(projectNFTAddress);
    }

    function buyProject(uint256 tokenId, address ownerAddress, uint256 price) public returns (string memory) {
        // TODO require token exists;
        projectNFT.getTokenPrice(tokenId); //check if token exists

        // TODO require price to pay is equal to total price of token

        // TODO pay buy price

        // Set ownership
        _addressToTokens[ownerAddress][tokenId] = true;

        // Set expiration time
        uint256 expirationTime = block.timestamp + 60*60*24*31*3; // add 3 months
        _ownershipExpirationTime[keccak256(abi.encodePacked(ownerAddress, tokenId))] = expirationTime;

        return getTokenDetails(tokenId, ownerAddress);
    }

    function getTokenDetails(uint256 tokenId, address ownerAddress) public view returns (string memory){
        // Requires to be owner and not expired
        require(_addressToTokens[ownerAddress][tokenId], 'Address does not own this project');
        require(_ownershipExpirationTime[keccak256(abi.encodePacked(ownerAddress, tokenId))] > block.timestamp);

        return projectNFT.getProjectHash(tokenId);
    }
}