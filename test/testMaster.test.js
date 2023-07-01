const ProjectNFT = artifacts.require("ProjectNFT");
const Master = artifacts.require("Master");
const AccessSmartContract = artifacts.require("AccessSmartContract");
const assert = require('assert');
const Web3 = require('web3');
const truffleAssert = require("truffle-assertions");

require('dotenv').config();

const {HOST_MACHINE_IP, ORACLE, JOBID_1, JOBID_2} = process.env;

contract("Master", (accounts) => {
    let masterInstance;
    let projectNFTInstance;
    let accessSmartContractInstance;
    const platformAddress = accounts[0];
    const sender = accounts[1];
    const sender2 = accounts[2];
    const web3 = new Web3('http://localhost:8545');

    const project1 = {
        price: 1,
        royaltyPrice: 10,
        projectHash: "0x123",
        components: []
    };

    beforeEach(async () => {
        projectNFTInstance = await ProjectNFT.new(platformAddress, HOST_MACHINE_IP, ORACLE, JOBID_1, JOBID_2);
        accessSmartContractInstance = await AccessSmartContract.new(projectNFTInstance.address);
        masterInstance = await Master.new(projectNFTInstance.address,accessSmartContractInstance.address);
    });

    it("should revert for unknown component on mint", async () => {
        await truffleAssert.reverts(
            masterInstance.mintToken(project1.price, project1.royaltyPrice, project1.projectHash, [42],{ from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))}),
        "Component not valid");    
    });

    it("should revert for not sufficient value sent on mint", async () => {
        await truffleAssert.reverts(
            masterInstance.mintToken(project1.price, project1.royaltyPrice, project1.projectHash, project1.components,{ from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0001', 'ether'))}),
        "Pay amount is not price of mint commissions");
    }); 

    it("should mint a token successfully", async () => {
        const result = await masterInstance.mintToken(project1.price, project1.royaltyPrice, project1.projectHash, project1.components, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        const tokenId = result.logs[0].args.tokenId;
        assert.strictEqual(tokenId.toString(), '1');
    });

    // Add more tests here according to your contract functionalities
});
