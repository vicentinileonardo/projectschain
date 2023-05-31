// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./BaseNFT.sol";

contract DesignerNFT is BaseNFT {
    
    constructor(string memory _projectId, address _owner, address[] memory _components) ERC721("DesignerNFT", "DNFT") {
        setProjectId(_projectId);
        setOwner(_owner);
        setComponents(_components);
    }



    function mint(string memory tokenURI) public returns (uint256) {
        string memory projectId = getProjectId();
        bytes32 hash = keccak256(abi.encodePacked(projectId));
        uint256 newTokenId = uint256(hash);
        //_safeMint(to, newTokenId);
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        return newTokenId;
    }


}

