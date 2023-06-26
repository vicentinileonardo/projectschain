// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

contract ProjectNFT is ERC721URIStorage {
  uint256 public tokenCounter;
  address payable pluginAddress; //where to pay commissions

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

  constructor(address payable _pluginAddress) ERC721('DesignerNFT', 'DNFT') {
    pluginAddress = _pluginAddress;
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

  /*
  //OBSOLETED to avoid to pay if sender is also owner
  //assuming all the subcomponents already present in the project given (maybe is the best idea)
  function getTokenBuyPrice(uint256 tokenId) public view returns (uint256) {
    require(tokenId < tokenCounter, 'Token with this id does not exit');

    // Return token buy price plus royalties of all its components
    uint256 total = 0;
    total = total + _tokenIdToPrice[tokenId];
    for (uint256 i=0; i < _tokenIdToComponents[tokenId].length; i++) {
      total = total + _tokenIdToPrice[_tokenIdToComponents[tokenId][i]];
    }
    return total;
  } */

  function getTokenBuyPrice(uint256 tokenId, address buyerProject) public view returns (uint256) {
    require(tokenId < tokenCounter, 'Token with this id does not exit');
    
    uint256 amount;
    if(buyerProject==ownerOf(tokenId)){ //buyer and token owner are the same
      amount = 0;
    } else {
      amount = getTokenPrice(tokenId);
      amount = amount + (getTokenPrice(tokenId)*5/100); //commissions
    }

    for (uint256 i=0; i < _tokenIdToComponents[tokenId].length; i++) {
      uint256 componentTokenId = _tokenIdToComponents[tokenId][i];

      if(buyerProject != ownerOf(componentTokenId)){ //buyer and component owner are NOT the same
        amount = amount + _tokenIdToRoyaltyPrice[componentTokenId];
        amount = amount + (_tokenIdToRoyaltyPrice[componentTokenId]*5/100); //commissions
      }
    }

    return amount;
  }

  function getProjectHash(uint256 tokenId) public view returns (string memory) {
    require(tokenId < tokenCounter, 'Token with this id does not exit');
    return _tokenIdToHash[tokenId];
  }

  function getTokenComponents(uint256 tokenId) public view returns (uint256[] memory) {
    require(tokenId < tokenCounter, 'Token with this id does not exit');
    return _tokenIdToComponents[tokenId];
  }

  function transferPayment(uint256 tokenId, uint256 amount, address buyerProject) public {
    require(tokenId < tokenCounter, 'Token with this id does not exit');

    uint256 amountToPay = getTokenBuyPrice(tokenId,buyerProject);
    require(amount == amountToPay, 'Pay amount is not price of project');

    address payable owner = payable(ownerOf(tokenId));

    if(buyerProject != owner){
      owner.transfer(_tokenIdToPrice[tokenId]);
      amount = amount - _tokenIdToPrice[tokenId];

      pluginAddress.transfer(_tokenIdToPrice[tokenId]*5/100); //commissions
      amount = amount - (_tokenIdToPrice[tokenId]*5/100);
    }

    for (uint256 i=0; i < _tokenIdToComponents[tokenId].length; i++) {
      uint256 componentTokenId = _tokenIdToComponents[tokenId][i];
      address payable componentOwner = payable(ownerOf(componentTokenId));

      if(buyerProject != componentOwner){
        componentOwner.transfer(_tokenIdToRoyaltyPrice[componentTokenId]);
        amount = amount - _tokenIdToRoyaltyPrice[componentTokenId];

        pluginAddress.transfer(_tokenIdToRoyaltyPrice[componentTokenId]*5/100);
        amount = amount - (_tokenIdToRoyaltyPrice[componentTokenId]*5/100);
      }
    }
  }

}