// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import './ProjectNFT.sol';
import './AccessSmartContract.sol';

contract Master {
  ProjectNFT private projectNFT;
  AccessSmartContract private accessContract;

  event NewToken(address owner, uint256 tokenId);

  constructor(address projectNFTAddress, address accessContractAddress) {
    projectNFT = ProjectNFT(projectNFTAddress);
    accessContract = AccessSmartContract(accessContractAddress);
  }

  function mintToken(
    uint256 price,
    uint256 royaltyPrice,
    string calldata projectHash,
    uint256[] calldata components
  ) public {
    //TODO: check if the caller is authorized?

    uint256 tokenId = projectNFT.mintToken(msg.sender, price, royaltyPrice, projectHash, components);

    emit NewToken(msg.sender, tokenId);
  }

  function buyToken() public {
    // TODO
  }
}
