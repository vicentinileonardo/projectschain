// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import './ProjectNFT.sol';

contract Master {
  address public projectNFTAddress;
  ProjectNFT private projectNFT;

  constructor(address _contractAddress) {
    projectNFTAddress = _contractAddress;
    projectNFT = ProjectNFT(projectNFTAddress);
  }

  //from the address of the contract A, we can call the function mintToken
  function mintToken(
    uint256 price,
    uint256 royaltyPrice,
    string calldata projectHash,
    uint256[] calldata components
  ) public returns (bool) {
    //aggiungere hash
    //TODO: check if the caller is authorized

    projectNFT.mintToken(msg.sender, price, royaltyPrice, projectHash, components);

    /*
    (bool success, bytes memory result) = projectNFTAddress.call(
      abi.encodeWithSignature('mintToken(address, uint256, uint256, string, uint256[])',
       msg.sender, price, royaltyPrice, projectHash, components)
    );
    require(success, 'Failed to call mintToken on DesignerNFT');
    //address sender = abi.decode(result, (address));
    */

    return true;
  }
}
