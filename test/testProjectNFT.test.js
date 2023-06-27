const ProjectNFT = artifacts.require("ProjectNFT");
const assert = require('assert');
const truffleAssert = require("truffle-assertions");

require('dotenv').config();

const {HOST_MACHINE_IP, ORACLE, JOBID_1, JOBID_2} = process.env;

contract("ProjectNFT", (accounts) => {
    let contractInstance;
    const platformAddress = accounts[0];
    const sender = accounts[1];

    const price = 1000;
    const royaltyPrice = 100;
    const projectHash = "hash";
    const components = [];

    beforeEach(async () => {
        contractInstance = await ProjectNFT.new(platformAddress, HOST_MACHINE_IP, ORACLE, JOBID_1, JOBID_2);
    });

    it("should mint a token successfully", async () => {
        const result = await contractInstance.mintToken(sender, price, royaltyPrice, projectHash, components, { from: sender });
        const tokenId = result.logs[0].args.tokenId;
        assert.strictEqual(tokenId.toString(), '1');
    });

    it("should fail if projectHash already exists", async () => {
        await contractInstance.mintToken(sender, price, royaltyPrice, projectHash, components, { from: sender });
        await truffleAssert.reverts(
            contractInstance.mintToken(sender, price, royaltyPrice, projectHash, components, { from: sender }),
            "Project already exists"
        );
    });

    it("should return correct token price", async () => {
        await contractInstance.mintToken(sender, price, royaltyPrice, projectHash, components, { from: sender });
        const tokenPrice = await contractInstance.getTokenPrice(1);
        assert.equal(tokenPrice, price);
    });

    // Add more tests here according to your contract functionalities
});
