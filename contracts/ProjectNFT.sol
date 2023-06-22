// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

contract ProjectNFT is ERC721URIStorage {
  uint256 public tokenCounter;

  // Maps tokenId to project's price
  mapping(uint256 => uint256) private _tokenIdToPrice;

  // Maps tokenId to royalty price
  mapping(uint256 => uint256) private _tokenIdToRoyaltyPrice;

  // Maps tokenId to hash of project
  mapping(uint256 => string) private _tokenIdToHash;

  // Maps tokenId to list of components of project
  mapping(uint256 => uint256[]) private _tokenIdToComponents;

  // Map to check hashes are unique
  mapping(string => bool) private _hashes;

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
    
    // Check hash is unique
    require(!_hashes[projectHash], 'A project with this hash already exists');

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
    _tokenIdToPrice[newItemId] = price;
    _tokenIdToRoyaltyPrice[newItemId] = royaltyPrice;
    _tokenIdToHash[newItemId] = projectHash;
    _hashes[projectHash] = true;
    _tokenIdToComponents[newItemId] = components;

    // Increment token counter
    tokenCounter = tokenCounter + 1;

    return newItemId;
  }

  function getTokenPrice(uint256 tokenId) public view returns (uint256) {
    require(tokenId < tokenCounter, 'Token with this id does not exit');
    return _tokenIdToPrice[tokenId];
  }

  function getTokenRoyaltyPrice(uint256 tokenId) public view returns (uint256) {
    require(tokenId < tokenCounter, 'Token with this id does not exit');
    return _tokenIdToRoyaltyPrice[tokenId];
  }

  function getTokenBuyPrice(uint256 tokenId) public view returns (uint256) {
    require(tokenId < tokenCounter, 'Token with this id does not exit');

    // Return token buy price plus royalties of all its components
    uint256 total = 0;
    total = total + _tokenIdToPrice[tokenId];
    for (uint256 i=0; i < _tokenIdToComponents[tokenId].length; i++) {
      total = total + _tokenIdToPrice[_tokenIdToComponents[tokenId][i]];
    }
    return total;
  }

  function getProjectHash(uint256 tokenId) public view returns (string memory) {
    require(tokenId < tokenCounter, 'Token with this id does not exit');
    return _tokenIdToHash[tokenId];
  }

  function getTokenComponents(uint256 tokenId) public view returns (uint256[] memory) {
    require(tokenId < tokenCounter, 'Token with this id does not exit');
    return _tokenIdToComponents[tokenId];
  }

  function transferPayment(uint256 tokenId, uint256 amount) public {
    require(tokenId < tokenCounter, 'Token with this id does not exit');
    require(amount == getTokenPrice(tokenId), 'Pay amount is not price of project');

    address payable owner = payable(ownerOf(tokenId));
    owner.transfer(amount - _tokenIdToPrice[tokenId]);
    amount = amount - _tokenIdToPrice[tokenId];

    for (uint256 i=0; i < _tokenIdToComponents[tokenId].length; i++) {
      uint256 componentTokenId = _tokenIdToComponents[tokenId][i];
      address payable componentOwner = payable(ownerOf(componentTokenId));
      componentOwner.transfer(amount - _tokenIdToRoyaltyPrice[componentTokenId]);
      amount = amount - _tokenIdToRoyaltyPrice[componentTokenId];
    }
  }

}
