const ProjectNFT = artifacts.require("ProjectNFT");
const Master = artifacts.require("Master");
const AccessSmartContract = artifacts.require("AccessSmartContract");
const assert = require('assert');
const Web3 = require('web3');
const truffleAssert = require("truffle-assertions");
const fetch = require('node-fetch');


require('dotenv').config();

const {HOST_MACHINE_IP, ORACLE, JOBID_1, JOBID_2} = process.env;

contract("AccessSmartContract", (accounts) => {
    let masterInstance;
    let projectNFTInstance;
    let accessSmartContractInstance;
    const platformAddress = accounts[0];
    const sender = accounts[1];
    const sender2 = accounts[2];
    const web3 = new Web3('http://localhost:8545');

    const project1 = {
        price: 1000000000000000,
        royaltyPrice: 1000000000000000,
        projectHash: "0x123",
        components: [],
        owner: "0x46D72b1e93D5daaD3b68104F437Dbe0a4b00e18"
    };

    async function computeSignature() {
        let deleteResponse = await fetch(`http://localhost:3000/api/v1/nfts/`, {
            method: 'DELETE'});

        let preMinted = await fetch(`http://localhost:3000/api/v1/nfts/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "name": "test",
                "owner": project1.owner,
                "price": project1.price,
                "royaltyPrice": project1.royaltyPrice,
                "projectHash": project1.projectHash,
                "projectJSON": {
                    "components": project1.components,
                    "C2": "test",
                    "C3": "test"
                }
            })
        });

        let response = await preMinted.json();
        //console.log('preMinted', response);

        let projectHash = response.data.nft.hash;
        //console.log('projectHash', projectHash);

        let signature = response.data.nft.signature;
        var v = parseInt(signature[0].toString());
        var r = signature[1].toString();
        var s = signature[2].toString();
        return [v,r,s,projectHash];
    };

    function amountToValue(amount){
        let amountString = amount.toString();
        return web3.utils.toHex(web3.utils.toWei(amountString, 'ether'));
    };

    beforeEach(async () => {
        projectNFTInstance = await ProjectNFT.new(platformAddress, HOST_MACHINE_IP, ORACLE, JOBID_1, JOBID_2);
        accessSmartContractInstance = await AccessSmartContract.new(projectNFTInstance.address);
        masterInstance = await Master.new(projectNFTInstance.address,accessSmartContractInstance.address);
        await accessSmartContractInstance.setMasterContract(masterInstance.address);
        await projectNFTInstance.setMasterContract(masterInstance.address);
        await projectNFTInstance.setAccessContract(accessSmartContractInstance.address);
    });

    it("should revert on buyProject because doesn't allowed to call it", async () => {
        await truffleAssert.reverts(
            accessSmartContractInstance.buyProject(1,sender, { from: sender, value: amountToValue(0.006)}),
            "Caller is not the master contract"
        );
    });

    it("should get right tokens bought by an account", async () => {
        const resultSignature = await computeSignature();
        const v = resultSignature[0];
        const r = resultSignature[1];
        const s = resultSignature[2];
        const projectHash = resultSignature[3];

        const result = await masterInstance.mintToken(project1.price, project1.royaltyPrice, projectHash, project1.components, v,r,s, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        
        var buyPrice=(project1.price*105/100).toString(10);
        await masterInstance.buyToken(1,{ from: sender2, value: web3.utils.toHex(web3.utils.toWei(buyPrice, 'ether'))});

        const tokensBought = await accessSmartContractInstance.getTokensBought(sender2);

        assert.deepEqual(tokensBought, [1]);
    });
});
