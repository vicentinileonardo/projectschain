// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./BaseNFT.sol";

contract DesignerNFT is BaseNFT {
    uint256 public tokenCounter;
    
    mapping(string => uint256) private tokenURIToTokenId;
    mapping(uint256 => uint256) private tokenIdToPrice;

    constructor () ERC721 ("DesignerNFT", "DNFT"){
        tokenCounter = 1;
    }

    function mintToken(address sender, string memory uri, uint256 price) public returns (uint256) {
        //require that the token URI hasn't been used before
        require(tokenURIToTokenId[uri] == 0, "Token URI already used");

        uint256 newItemId = tokenCounter;

        _mint(sender, newItemId);
        _setTokenURI(newItemId, uri);

        tokenCounter = tokenCounter + 1;
        tokenURIToTokenId[uri] = newItemId;

        setTokenPrice(newItemId, price);

        return newItemId;

    }

    function getTokenCounter() public view returns (uint256) {
        return tokenCounter;
    }

    function getTokenPrice(uint256 tokenId) public view returns (uint256) {
        return tokenIdToPrice[tokenId];
    }

    function setTokenPrice(uint256 tokenId, uint256 price) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Caller is not owner nor approved");
        tokenIdToPrice[tokenId] = price;
    }
}
