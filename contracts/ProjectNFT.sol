// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

import "./CustomChainlinkClient.sol";


contract ProjectNFT is ERC721URIStorage, CustomChainlinkClient {
    
    using Counters for Counters.Counter;
     
    Counters.Counter private tokenCounter;

    address payable _platformAddress; //where to pay commissions

    struct TokenInfo {
       uint256 price;
       uint256 royaltyPrice;
       string projectHash;
       uint256[] components;
    }

    mapping(uint256 => TokenInfo) private _tokenInfos;

    // Map to check hashes are unique
    mapping(string => bool) private _hashes;

    constructor(address payable platformAddress, string memory host_machine_ip, address oracle, string memory jobId_1, string memory jobId_2) ERC721('ProjectNFT', 'PNFT') CustomChainlinkClient(host_machine_ip, oracle, jobId_1, jobId_2)  {
      _platformAddress = platformAddress;
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
        require(!_hashes[projectHash], 'Project already exists');

        // Check components exists
        for (uint i = 0; i < components.length; i++) {
            require(components[i] < tokenCounter.current(), 'Component not valid');
        }

        tokenCounter.increment();

        uint256 newItemId = tokenCounter.current();
       
        // Mint new token (openzeppelin)
        _mint(sender, newItemId);

        // Build uri from base + tokenId
        string memory baseUri = string.concat(_base_url_1, _host_machine_ip, _base_url_2);
        string memory uri = string.concat(baseUri, Strings.toString(newItemId));
        _setTokenURI(newItemId, uri);

        // Set NFT parameters
        _tokenInfos[newItemId] = TokenInfo(price, royaltyPrice, projectHash, components);
        _hashes[projectHash] = true;

        //disable for testing
        //requestConfirmMinting(newItemId, projectHash);

        return newItemId;
        
    }

    function tokenIdCheck(uint256 tokenId) private view{
        require(_exists(tokenId), 'Token does not exist');
    }

    function getTokenPrice(uint256 tokenId) public view returns (uint256) {
        tokenIdCheck(tokenId);
        return _tokenInfos[tokenId].price;
    }

    function getTokenRoyaltyPrice(uint256 tokenId) public view returns (uint256) {
        tokenIdCheck(tokenId);
        return _tokenInfos[tokenId].royaltyPrice;
    }

    function getProjectHash(uint256 tokenId) public view returns (string memory) {
        tokenIdCheck(tokenId);
        return _tokenInfos[tokenId].projectHash;
    }

    function getTokenComponents(uint256 tokenId) public view returns (uint256[] memory) {
        tokenIdCheck(tokenId);
        return _tokenInfos[tokenId].components;
    }

    function getTokenBuyPrice(uint256 tokenId, address buyerProject) public view returns (uint256) {
        tokenIdCheck(tokenId);
        
        uint256 amount;
        if(buyerProject==ownerOf(tokenId)){ //buyer and token owner are the same
            amount = 0;
        } else {
            amount = getTokenPrice(tokenId);
            amount = amount + (getTokenPrice(tokenId)*5/100); //commissions
        }

        for (uint256 i=0; i < _tokenInfos[tokenId].components.length; i++) {
            uint256 componentTokenId = _tokenInfos[tokenId].components[i];

            if(buyerProject != ownerOf(componentTokenId)){ //buyer and component owner are NOT the same
                amount = amount + _tokenInfos[componentTokenId].royaltyPrice; //royalties
                amount = amount + (_tokenInfos[componentTokenId].royaltyPrice*5/100); //commissions
            }
        }

        return amount;
    }

    
    function transferPayment(uint256 tokenId, uint256 amount, address buyerProject) public {
        tokenIdCheck(tokenId);

        uint256 amountToPay = getTokenBuyPrice(tokenId,buyerProject);
        require(amount >= amountToPay, 'Pay amount is not price of project');

        address payable owner = payable(ownerOf(tokenId));

        if(buyerProject != owner){
            owner.transfer(_tokenInfos[tokenId].price);
            amount = amount - _tokenInfos[tokenId].price;

            _platformAddress.transfer(_tokenInfos[tokenId].price*5/100);
            amount = amount - (_tokenInfos[tokenId].price*5/100);
        }

        for (uint256 i=0; i < _tokenInfos[tokenId].components.length; i++) {
            uint256 componentTokenId = _tokenInfos[tokenId].components[i];
            address payable componentOwner = payable(ownerOf(componentTokenId));

            if(buyerProject != componentOwner){
            componentOwner.transfer(_tokenInfos[componentTokenId].royaltyPrice);
            amount = amount - _tokenInfos[componentTokenId].royaltyPrice;

            _platformAddress.transfer(_tokenInfos[componentTokenId].royaltyPrice*5/100);
            amount = amount - (_tokenInfos[componentTokenId].royaltyPrice*5/100);
            }
        }
    }

}
