require('dotenv').config();

const pluginAddress = process.env.PLUGIN_ADDRESS; //"our" address where the commissions for the operations will be transferred
const ProjectNFT = artifacts.require("ProjectNFT");
const Master = artifacts.require("Master");
const AccessSmartContract = artifacts.require("AccessSmartContract");
const Counter = artifacts.require("Counter");

module.exports = async function (deployer) {
    await deployer.deploy(ProjectNFT,pluginAddress);
    const projectNftDeployed = await ProjectNFT.deployed();
    await deployer.deploy(AccessSmartContract, projectNftDeployed.address);
    const accessContractDeployed = await AccessSmartContract.deployed();
    await deployer.deploy(Master, projectNftDeployed.address, accessContractDeployed.address);

    // TODO remove counter address, was added for testing
    await deployer.deploy(Counter);
};
