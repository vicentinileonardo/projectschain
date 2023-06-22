const ProjectNFT = artifacts.require("ProjectNFT");
const Master = artifacts.require("Master");
const AccessSmartContract = artifacts.require("AccessSmartContract");
const Counter = artifacts.require("Counter");

module.exports = async function (deployer) {
    await deployer.deploy(ProjectNFT);
    const projectNftDeployed = await ProjectNFT.deployed();
    await deployer.deploy(AccessSmartContract, projectNftDeployed.address);
    const accessContractDeployed = await AccessSmartContract.deployed();
    await deployer.deploy(Master, projectNftDeployed.address, accessContractDeployed.address);

    // TODO remove counter address, was added for testing
    await deployer.deploy(Counter);
};
