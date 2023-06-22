// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Master.sol";
import "../contracts/ProjectNFT.sol";

contract TestMaster {
    function testShouldMintToken() public {
        ProjectNFT projectNFT = ProjectNFT(DeployedAddresses.ProjectNFT());
        Master master = Master(DeployedAddresses.Master());

        string memory projectHash = "test";
        uint256 price = 100;
        uint256 royaltyPrice = 50;
        uint256[] memory components = new uint256[](1);

        master.mintToken(price, royaltyPrice, projectHash, components);

        Assert.equal(projectNFT.getTokenPrice(1), price, "Price is different");
    }
}
