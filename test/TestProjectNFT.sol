// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/ProjectNFT.sol";

contract TestProjectNFT {

    function testShouldPayOwner() public {
        ProjectNFT projectNFT = ProjectNFT(DeployedAddresses.ProjectNFT());
    }

}