// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import './ProjectNFT.sol';
import "truffle/Console.sol";

contract AccessSmartContract {
    ProjectNFT private projectNFT;

    address private _owner;
    modifier onlyOwner() {
        require(msg.sender == _owner, "Caller is not the owner of the contract");
        _;
    }

    address private _masterContract; //is the only one authorized to buyProject
    modifier onlyMasterContract() {
        require(msg.sender == _masterContract, "Caller is not the master contract");
        _;
    }

    // Maps owner address to bought tokens
    mapping(address => mapping(uint256 => bool)) private _addressToTokens;

    // Maps ownership to expiration date
    // Key is hash of tuple (address, uint256) for address of owner and tokenId
    mapping(bytes32 => uint256) private _ownershipExpirationTime;
    
    constructor(address projectNFTAddress){
        projectNFT = ProjectNFT(projectNFTAddress);
        _owner = msg.sender;
    }

    function setMasterContract(address masterContract) public onlyOwner(){
        _masterContract = masterContract;
    }

    function buyProject(uint256 tokenId, address projectBuyer) public payable onlyMasterContract returns (address) {
        console.log("New buy project from user ", projectBuyer);
        console.log("For token ", tokenId);
        console.log("With pay amount: ", msg.value);
        
        // Check user has not already bought project
        require(!_addressToTokens[projectBuyer][tokenId], 'User has already bought this project');

        // Pay projects owner
        // Will also make approriate checks on token id and price
        projectNFT.transferPayment{value: msg.value}(tokenId, projectBuyer);
        
        console.log("-> Payment transfer to creator completed, will set ownership of project");

        // Set ownership
        _addressToTokens[projectBuyer][tokenId] = true;

        // Set expiration time
        uint256 expirationTime = block.timestamp + 60*60*24*31*3; // add 3 months
        _ownershipExpirationTime[keccak256(abi.encodePacked(projectBuyer, tokenId))] = expirationTime;

        return projectBuyer;
    }


    function getTokensBought(address buyer) public view returns (uint256[] memory) {
        uint256[] memory tokensOwned;
        uint256 counter = 0;
        for (uint256 i = 0; i <= projectNFT.totalSupply(); i++) {
            
            //check if not expired using _ownershipExpirationTime mapping
            if (_addressToTokens[buyer][i]){
                if (_ownershipExpirationTime[keccak256(abi.encodePacked(buyer, i))] > block.timestamp) {
                    
                    tokensOwned[counter] = i;
                    counter++;
                }
                else {
                    //remove ownership
                    //temporary solution, better if done in automatic way
                    //commented since we need a view function since it will be heaviliy used
                    //_addressToTokens[buyer][i] = false;
                }
            }            
        }
        return tokensOwned;
    }
}
