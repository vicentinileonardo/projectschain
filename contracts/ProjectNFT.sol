// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import '../node_modules/@openzeppelin/contracts/utils/Counters.sol';
import '../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

contract ProjectNFT is ERC721URIStorage {
  uint256 public tokenCounter;

  // Maps tokenId to project's price
  mapping(uint256 => uint256) private tokenIdToPrice;

  // Maps tokenId to royalty price
  mapping(uint256 => uint256) private tokenIdToRoyaltyPrice;

  // Maps tokenId to hash of project
  mapping(uint256 => string) private tokenIdToHash;

  // Maps tokenId to list of components of project
  mapping(uint256 => uint256[]) private tokenIdToComponents;

  constructor() ERC721('DesignerNFT', 'DNFT') {
    tokenCounter = 1;
  }

  function mintToken(
    address sender,
    uint256 price,
    uint256 royaltyPrice,
    string calldata projectHash,
    uint256[] calldata components
  ) public returns (uint256) {
    // Check NFT parameters:
    // Check components exists
    for (uint i = 0; i < components.length; i++) {
      require(components[i] < tokenCounter, 'Component is not a valid project');
    }
    
    // Get NFT id
    uint256 newItemId = tokenCounter;

    // Mint new token (openzeppelin)
    _mint(sender, newItemId);

    // Build uri from base + tokenId
    string memory baseUri = "localhost:3000/nfts/";
    string memory uri = string.concat(baseUri, Strings.toString(newItemId));
    _setTokenURI(newItemId, uri);

    // Set NFT parameters
    tokenIdToPrice[newItemId] = price;
    tokenIdToRoyaltyPrice[newItemId] = royaltyPrice;
    tokenIdToHash[newItemId] = projectHash;
    tokenIdToComponents[newItemId] = components;

    // Increment token counter
    tokenCounter = tokenCounter + 1;

    return newItemId;
  }

  function getTokenPrice(uint256 tokenId) public view returns (uint256) {
    require(tokenId < tokenCounter);
    return tokenIdToPrice[tokenId];
  }

  function getTokenRoyaltyPrice(uint256 tokenId) public view returns (uint256) {
    require(tokenId < tokenCounter);
    return tokenIdToRoyaltyPrice[tokenId];
  }

  function getTokenBuyPrice(uint256 tokenId) public view returns (uint256) {
    require(tokenId < tokenCounter);

    // Return token buy price plus royalties of all its components
    uint256 total = 0;
    total = total + tokenIdToPrice[tokenId];
    for (uint256 i=0; i < tokenIdToComponents[tokenId].length; i++) {
      total = total + tokenIdToPrice[tokenIdToComponents[tokenId][i]];
    }
    return total;
  }

  function getTokenComponents(uint256 tokenId) public view returns (uint256[] memory) {
    require(tokenId < tokenCounter);
    return tokenIdToComponents[tokenId];
  }

}
