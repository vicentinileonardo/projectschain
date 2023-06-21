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
    string calldata uri,
    uint256 price,
    uint256 royaltyPrice,
    string calldata projectHash,
    uint256[] calldata components
  ) public returns (uint256) {
    //base_uri

    uint256 newItemId = tokenCounter;

    _mint(sender, newItemId);

    //uri = base_uri + newItemId
    _setTokenURI(newItemId, uri);

    tokenCounter = tokenCounter + 1;

    setTokenHash(newItemId, projectHash);
    setTokenPrice(newItemId, price, royaltyPrice);
    setTokenComponents(newItemId, components);

    return newItemId;
  }

  function getTokenPrice(uint256 tokenId) public view returns (uint256) {
    return tokenIdToPrice[tokenId];
  }

  function setTokenPrice(uint256 tokenId, uint256 price, uint256 royaltyPrice) public {
    require(_isApprovedOrOwner(msg.sender, tokenId), 'Caller is not owner nor approved');
    tokenIdToPrice[tokenId] = price;
    tokenIdToRoyaltyPrice[tokenId] = royaltyPrice;
  }

  function setTokenHash(uint256 tokenId, string calldata hash) public {
    require(_isApprovedOrOwner(msg.sender, tokenId), 'Caller is not owner nor approved');
    tokenIdToHash[tokenId] = hash;
  }

  function setTokenComponents(uint256 tokenId, uint256[] calldata components) public {
    require(_isApprovedOrOwner(msg.sender, tokenId), 'Caller is not owner nor approved');
    // Check components exists
    for (uint i = 0; i < components.length; i++) {
        require(components[i] < tokenCounter);
    }
    tokenIdToComponents[tokenId] = components;
  }
}
