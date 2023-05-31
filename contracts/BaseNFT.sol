// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

abstract contract BaseNFT is ERC721URIStorage {

    // UUID / hash of project
    string private projectId;

    // Address of owner that created the project
    address private owner;
    
    // Components used by this project (other projects)
    address[] private components;

    
    function getProjectId() public view returns (string memory) {
        return projectId;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getComponents() public view returns (address[] memory) {
        return components;
    }

    function setProjectId(string memory _projectId) public {
        projectId = _projectId;
    }

    function setOwner(address _owner) public {
        owner = _owner;
    }

    function setComponents(address[] memory _components) public {
        components = _components;
    }


}
