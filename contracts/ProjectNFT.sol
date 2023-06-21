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
    //base_uri

    uint256 newItemId = tokenCounter;

    _mint(sender, newItemId);

    //uri = base_uri + newItemId
    string memory baseUri = "localhost:3000/nfts/";
    string memory uri = string.concat(baseUri, Strings.toString(newItemId));
    _setTokenURI(newItemId, uri);

    tokenCounter = tokenCounter + 1;

    setTokenHash(sender, newItemId, projectHash);
    setTokenPrice(sender, newItemId, price, royaltyPrice);
    setTokenComponents(sender, newItemId, components);

    return newItemId;
  }

  function setTokenPrice(address sender, uint256 tokenId, uint256 price, uint256 royaltyPrice) public {
    require(_ownerOf(tokenId) == sender, 'Caller is not owner');
    tokenIdToPrice[tokenId] = price;
    tokenIdToRoyaltyPrice[tokenId] = royaltyPrice;
  }

  function getTokenPrice(uint256 tokenId) public view returns (uint256) {
    require(tokenId < tokenCounter);
    return tokenIdToPrice[tokenId];
  }

  function setTokenHash(address sender, uint256 tokenId, string calldata hash) public {
    require(_ownerOf(tokenId) == sender, 'Caller is not owner');
    tokenIdToHash[tokenId] = hash;
  }

  function setTokenComponents(address sender, uint256 tokenId, uint256[] calldata components) public {
    require(_ownerOf(tokenId) == sender, 'Caller is not owner');
    // Check components exists
    for (uint i = 0; i < components.length; i++) {
        require(components[i] < tokenCounter);
    }
    tokenIdToComponents[tokenId] = components;
  }


}
