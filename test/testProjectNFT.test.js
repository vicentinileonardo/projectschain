const ProjectNFT = artifacts.require("ProjectNFT");
const assert = require('assert');
const Web3 = require('web3');
const truffleAssert = require("truffle-assertions");

require('dotenv').config();

const {HOST_MACHINE_IP, ORACLE, JOBID_1, JOBID_2} = process.env;

contract("ProjectNFT", (accounts) => {
    let contractInstance;
    const platformAddress = accounts[0];
    const sender = accounts[1];
    const sender2 = accounts[2];
    const web3 = new Web3('http://localhost:8545');

    const project1 = {
        price: 100,
        royaltyPrice: 10,
        projectHash: "0x123",
        components: []
    };

    beforeEach(async () => {
        contractInstance = await ProjectNFT.new(platformAddress, HOST_MACHINE_IP, ORACLE, JOBID_1, JOBID_2);
    });

    it("should revert for unknown component", async () => {
        await truffleAssert.reverts(
            contractInstance.mintToken(sender, project1.price, project1.royaltyPrice, project1.projectHash, [42],{ from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))}),
        "Component not valid");    
    });

    it("should revert for not sufficient value sent", async () => {
        await truffleAssert.reverts(
            contractInstance.mintToken(sender, project1.price, project1.royaltyPrice, project1.projectHash, [42],{ from: sender, value: web3.utils.toHex(web3.utils.toWei('0', 'ether'))}),
        "Pay amount is not price of mint commissions");    
    });

    it("should mint a token successfully", async () => {
        const result = await contractInstance.mintToken(sender, project1.price, project1.royaltyPrice, project1.projectHash, project1.components, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        const tokenId = result.logs[0].args.tokenId;
        assert.strictEqual(tokenId.toString(), '1');
    });

    it("should fail if projectHash already exists", async () => {
        await contractInstance.mintToken(sender, project1.price, project1.royaltyPrice, project1.projectHash, project1.components, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        await truffleAssert.reverts(
            contractInstance.mintToken(sender, project1.price, project1.royaltyPrice, project1.projectHash, project1.components, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))}),
            "Project already exists"
        );
    });

    it("should return correct token price", async () => {
        await contractInstance.mintToken(sender, project1.price, project1.royaltyPrice, project1.projectHash, project1.components, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        const tokenPrice = await contractInstance.getTokenPrice(1);
        assert.equal(tokenPrice, project1.price);
    });

    it("should not pass id check when getting price (id:0)", async () => {
        await truffleAssert.reverts(
            contractInstance.getTokenPrice(0),
            "Token does not exist"
        );
    });

    it("should not pass id check when getting price (id:2)", async () => {
        await truffleAssert.reverts(
            contractInstance.getTokenPrice(2),
            "Token does not exist"
        );
    });

    it("should return correct token royalty price", async () => {
        await contractInstance.mintToken(sender, project1.price, project1.royaltyPrice, project1.projectHash, project1.components, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        const tokenRoyaltyPrice = await contractInstance.getTokenRoyaltyPrice(1);
        assert.equal(tokenRoyaltyPrice, project1.royaltyPrice);
    });

    it("should return correct project hash", async () => {
        await contractInstance.mintToken(sender, project1.price, project1.royaltyPrice, project1.projectHash, project1.components, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        const projectHash = await contractInstance.getProjectHash(1);
        assert.equal(projectHash, project1.projectHash);
    });

    it("should return correct project components (empty)", async () => {
        await contractInstance.mintToken(sender, project1.price, project1.royaltyPrice, project1.projectHash, project1.components, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        const projectComponents = await contractInstance.getTokenComponents(1);
        assert.deepEqual(projectComponents, project1.components);
    });

    it("should return correct project buy price when owner != buyer", async () => {
        await contractInstance.mintToken(sender, project1.price, project1.royaltyPrice, project1.projectHash, project1.components, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        const buyPrice = await contractInstance.getTokenBuyPrice(1, sender2);
        const estimatedByPrice = project1.price+project1.price*5/100;
        assert.equal(estimatedByPrice, buyPrice.words[0]);
    });

    it("should return correct project buy price when owner == buyer", async () => {
        await contractInstance.mintToken(sender, project1.price, project1.royaltyPrice, project1.projectHash, project1.components, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        const buyPrice = await contractInstance.getTokenBuyPrice(1, sender);
        assert.equal(0, buyPrice.words[0]);
    });

    it("should return correct project buy price when owner == buyer for some subcomponents", async () => {
        const result = await contractInstance.mintToken(sender2, project1.price, project1.royaltyPrice, "a", project1.components, { from: sender2, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        await contractInstance.mintToken(sender, project1.price, project1.royaltyPrice, "b", [result.logs[0].args.tokenId], { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});

        const buyPrice = await contractInstance.getTokenBuyPrice(2, sender);
        const estimatedByPrice = Math.floor(project1.royaltyPrice+project1.royaltyPrice*5/100);

        assert.equal(estimatedByPrice, buyPrice.words[0]);
    });

    it("should return correct project buy price when owner == buyer for some subcomponents [effective commissions == 0]", async () => {
        const result = await contractInstance.mintToken(sender2, project1.price, project1.royaltyPrice, "a", project1.components, { from: sender2, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        await contractInstance.mintToken(sender, project1.price, project1.royaltyPrice, "b", [result.logs[0].args.tokenId], { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});

        const buyPrice = await contractInstance.getTokenBuyPrice(2, sender);
        const estimatedByPrice = Math.floor(project1.royaltyPrice+project1.royaltyPrice*5/100);

        assert.equal(estimatedByPrice, buyPrice.words[0]);
    });

    it("should return correct project buy price when owner == buyer for some subcomponents [effective commissions != 0]", async () => {
        const result = await contractInstance.mintToken(sender2, project1.price, 30, "a", project1.components, { from: sender2, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        await contractInstance.mintToken(sender, project1.price, project1.royaltyPrice, "b", [result.logs[0].args.tokenId], { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});

        const buyPrice = await contractInstance.getTokenBuyPrice(2, sender);
        const estimatedByPrice = Math.floor(30+30*5/100);

        assert.equal(estimatedByPrice, buyPrice.words[0]);
    });

    it("should return correct project buy price when owner == buyer in all subcomponents", async () => {
        const result = await contractInstance.mintToken(sender, project1.price, project1.royaltyPrice, "a", project1.components, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        await contractInstance.mintToken(sender, project1.price, project1.royaltyPrice, "b", [result.logs[0].args.tokenId], { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});

        const buyPrice = await contractInstance.getTokenBuyPrice(2, sender);
        assert.equal(0, buyPrice.words[0]);
    });


    // Add more tests here according to your contract functionalities
});
