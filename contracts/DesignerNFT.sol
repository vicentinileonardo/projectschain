// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./BaseNFT.sol";

contract DesignerNFT is BaseNFT {
    uint256 public tokenCounter;
    
    mapping(uint256 => uint256) private tokenIdToPrice;
    mapping(string => uint256) private tokenIdtoHash; // change data type

    constructor () ERC721 ("DesignerNFT", "DNFT"){
        tokenCounter = 1;
    }

    function mintToken(address sender, string memory uri, uint256 price) public returns (uint256) {

        //base_uri

        uint256 newItemId = tokenCounter;

        _mint(sender, newItemId);

        //uri = base_uri + newItemId
        _setTokenURI(newItemId, uri);

        tokenCounter = tokenCounter + 1;

        setTokenPrice(newItemId, price);

        return newItemId;

    }

    function getTokenPrice(uint256 tokenId) public view returns (uint256) {
        return tokenIdToPrice[tokenId];
    }

    function setTokenPrice(uint256 tokenId, uint256 price) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Caller is not owner nor approved");
        tokenIdToPrice[tokenId] = price;
    }
}
