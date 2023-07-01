const ProjectNFT = artifacts.require("ProjectNFT");
const AccessSmartContract = artifacts.require("AccessSmartContract");
const assert = require('assert');
const Web3 = require('web3');
const truffleAssert = require("truffle-assertions");

require('dotenv').config();

const {HOST_MACHINE_IP, ORACLE, JOBID_1, JOBID_2} = process.env;

contract("AccessSmartContract", (accounts) => {
    let AccessSmartContractInstance;
    let projectNFTInstance;
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
        AccessSmartContractInstance = await AccessSmartContract.new(projectNFTInstance.address);
    });

    it("should not pass id check when getting price (id:2)", async () => {
        await truffleAssert.reverts(
            AccessSmartContractInstance.buyProject(2,sender),
            "Token does not exist"
        );
    });

    it("should revert for not sufficient value sent", async () => {
        const result = await projectNFTInstance.mintToken(sender2, project1.price, project1.royaltyPrice, project1.projectHash, project1.components, { from: sender2, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        const tokenId = result.logs[0].args.tokenId;
        await truffleAssert.reverts(
            AccessSmartContractInstance.buyProject(tokenId,sender),
            "Need to pay buy price to buy token"
        );
    }); 

    // Add more tests here according to your contract functionalities
});
