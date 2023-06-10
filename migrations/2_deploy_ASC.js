const DesignerNFT = artifacts.require("DesignerNFT");
const Master = artifacts.require("Master");
//const AccessSmartContract = artifacts.require("AccessSmartContract");

module.exports = async function (deployer) {
    deployer.deploy(DesignerNFT).then(function() {
        return deployer.deploy(Master, DesignerNFT.address);
    });
};
