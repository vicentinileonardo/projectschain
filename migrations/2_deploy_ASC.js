const DesignerNFT = artifacts.require("DesignerNFT");
const AccessSmartContract = artifacts.require("AccessSmartContract");

module.exports = async function (deployer) {
    const DesignerNFT = await DesignerNFT.deployed();
    await deployer.deploy(AccessSmartContract, DesignerNFT.address);
};
