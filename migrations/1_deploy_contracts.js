require('dotenv').config();

const {PLUGIN_ADDRESS, HOST_MACHINE_IP, ORACLE, JOBID_1, JOBID_2} = process.env;

const ProjectNFT = artifacts.require("ProjectNFT");
const Master = artifacts.require("Master");
const AccessSmartContract = artifacts.require("AccessSmartContract");

module.exports = async function (deployer) {
    await deployer.deploy(ProjectNFT, PLUGIN_ADDRESS, HOST_MACHINE_IP, ORACLE, JOBID_1, JOBID_2);
    const projectNftDeployed = await ProjectNFT.deployed();
    await deployer.deploy(AccessSmartContract, projectNftDeployed.address);
    const accessContractDeployed = await AccessSmartContract.deployed();
    await deployer.deploy(Master, projectNftDeployed.address, accessContractDeployed.address);

};
