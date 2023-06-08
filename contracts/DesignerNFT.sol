// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./BaseNFT.sol";

contract DesignerNFT is BaseNFT {
    uint256 public tokenCounter;
    
    mapping(string => uint256) private tokenURIToTokenId;

    constructor () ERC721 ("DesignerNFT", "DNFT"){
        tokenCounter = 0;
    }

    function mintToken(string memory uri) public returns (uint256) {
        require(tokenURIToTokenId[uri] == 0); //the token URI is new, so the NFT about the same project wasn't already minted

        uint256 newItemId = tokenCounter;

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, uri);

        tokenCounter = tokenCounter + 1;
        tokenURIToTokenId[uri] = newItemId;

        return newItemId;
    }
}

