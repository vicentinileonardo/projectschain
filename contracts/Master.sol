// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import './ProjectNFT.sol';
import './AccessSmartContract.sol';

import "@openzeppelin/contracts/utils/Strings.sol";

import "truffle/Console.sol";

contract Master {
  ProjectNFT private projectNFT;
  AccessSmartContract private accessContract;

  address private backendAccount = 0xdA9555ed6CB366BB53CA0714CF13bC526C732DEB;

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
    uint256[] calldata components,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) payable public {

    console.log("Starting minting");

    console.log("v", v);
    console.log("msg.sender", msg.sender);
    

    //check if the caller is authorized using the signature
    bytes32 hash = keccak256(abi.encodePacked(
                                              Strings.toString(price), 
                                              Strings.toString(royaltyPrice), 
                                              projectHash
                                              ));

    //v, r, s are the signature and are provided by the backend
    //only someone that used the pre mint on the backend can mint
    address signer = ecrecover(hash, v, r, s);
    
    console.log("signer", signer);

    require(signer == backendAccount, "Invalid signature");

    console.log("Signature is valid");

    uint256 tokenId = projectNFT.mintToken{value: msg.value}(msg.sender, price, royaltyPrice, projectHash, components);

    emit NewToken(msg.sender, tokenId);
  }

  function buyToken(uint256 tokenId) payable public {
    address buyerAddress = accessContract.buyProject{value: msg.value}(tokenId, msg.sender);

    emit NewBuyer(buyerAddress, tokenId);
  }
}
