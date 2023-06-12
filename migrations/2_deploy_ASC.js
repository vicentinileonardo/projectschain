const DesignerNFT = artifacts.require("DesignerNFT");
const Master = artifacts.require("Master");
const { setEnvValue } = require('./functionsMigration.js');
//const AccessSmartContract = artifacts.require("AccessSmartContract");

module.exports = async function (deployer) {
    deployer.deploy(DesignerNFT).then(function() {
        setEnvValue("DESIGNERNFT_CONTRACT_ADDRESS", DesignerNFT.address);

        return deployer.deploy(Master, DesignerNFT.address).then(function() {
            setEnvValue("MASTER_CONTRACT_ADDRESS", Master.address);
        });
    });
};
