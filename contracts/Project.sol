// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Project {

    // UUID / hash of project
    string private projectId;

    // Address of owner that created the project
    address private owner;
    
    // Components used by this project (other projects)
    Project[] private components;

    // List of manufacturers that produce this project
    address[] private manufacturers;

    // Retrieve owner of project
    function getOwner() public view returns (address) {
        return owner;
    }

}