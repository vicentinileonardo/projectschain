const ProjectNFT = artifacts.require("ProjectNFT");
const Master = artifacts.require("Master");
const AccessSmartContract = artifacts.require("AccessSmartContract");
const Counter = artifacts.require("Counter");

module.exports = async function (deployer) {
    await deployer.deploy(ProjectNFT);
    const ProjectNFTdeployed = await ProjectNFT.deployed();
    await deployer.deploy(Master, ProjectNFTdeployed.address);
    await deployer.deploy(AccessSmartContract, ProjectNFTdeployed.address);
    await deployer.deploy(Counter);
};
