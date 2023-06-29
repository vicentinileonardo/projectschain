// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import './ProjectNFT.sol';
import './AccessSmartContract.sol';

contract Master {
  ProjectNFT private projectNFT;
  AccessSmartContract private accessContract;

  event NewToken(address owner, uint256 tokenId);
  event NewBuyer(address buyer, uint256 tokenId);

  constructor(address projectNFTAddress, address accessContractAddress) {
    projectNFT = ProjectNFT(projectNFTAddress);
    accessContract = AccessSmartContract(accessContractAddress);
  }

  function mintToken(
    uint256 price,
    uint256 royaltyPrice,
    string calldata projectHash,
    uint256[] calldata components
  ) payable public {
    //TODO: check if the caller is authorized?

    uint256 tokenId = projectNFT.mintToken{value: msg.value}(msg.sender, price, royaltyPrice, projectHash, components);

    emit NewToken(msg.sender, tokenId);
  }

  function buyToken(uint256 tokenId) payable public {
    address buyerAddress = accessContract.buyProject{value: msg.value}(tokenId, msg.sender);

    emit NewBuyer(buyerAddress, tokenId);
  }
}
