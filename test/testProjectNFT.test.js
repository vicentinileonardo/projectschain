const ProjectNFT = artifacts.require("ProjectNFT");
const Master = artifacts.require("Master");
const AccessSmartContract = artifacts.require("AccessSmartContract");
const assert = require('assert');
const Web3 = require('web3');
const truffleAssert = require("truffle-assertions");
const fetch = require('node-fetch');


require('dotenv').config();

const {HOST_MACHINE_IP, ORACLE, JOBID_1, JOBID_2} = process.env;

contract("ProjectNFT", (accounts) => {
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

    beforeEach(async () => {
        projectNFTInstance = await ProjectNFT.new(platformAddress, HOST_MACHINE_IP, ORACLE, JOBID_1, JOBID_2);
        accessSmartContractInstance = await AccessSmartContract.new(projectNFTInstance.address);
        masterInstance = await Master.new(projectNFTInstance.address,accessSmartContractInstance.address);
        await accessSmartContractInstance.setMasterContract(masterInstance.address);
        await projectNFTInstance.setMasterContract(masterInstance.address);
        await projectNFTInstance.setAccessContract(accessSmartContractInstance.address);
    });

    it("should return the right project price", async () => {

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
        let v = parseInt(signature[0].toString());
        let r = signature[1].toString();
        let s = signature[2].toString();

        await masterInstance.mintToken(project1.price, project1.royaltyPrice, projectHash, project1.components, v,r,s, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        const tokenPrice = await projectNFTInstance.getTokenPrice(1);
        assert.equal(tokenPrice, project1.price);
    });

    it("should return the right project royalty price", async () => {

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
        let v = parseInt(signature[0].toString());
        let r = signature[1].toString();
        let s = signature[2].toString();

        await masterInstance.mintToken(project1.price, project1.royaltyPrice, projectHash, project1.components, v,r,s, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        const tokenRoyaltyPrice = await projectNFTInstance.getTokenRoyaltyPrice(1);
        assert.equal(tokenRoyaltyPrice, project1.royaltyPrice);
    });

    it("should return the right project hash", async () => {

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
        let v = parseInt(signature[0].toString());
        let r = signature[1].toString();
        let s = signature[2].toString();

        await masterInstance.mintToken(project1.price, project1.royaltyPrice, projectHash, project1.components, v,r,s, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        const tokenHash = await projectNFTInstance.getProjectHash(1);
        assert.equal(tokenHash, projectHash);
    });

    it("should return the right project components", async () => {

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
        let v = parseInt(signature[0].toString());
        let r = signature[1].toString();
        let s = signature[2].toString();

        await masterInstance.mintToken(project1.price, project1.royaltyPrice, projectHash, project1.components, v,r,s, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});

        const tokenComponents = await projectNFTInstance.getTokenComponents(1);

        assert.deepEqual(tokenComponents, project1.components);
    });

    it("should revert on mintToken because doesn't allowed to call it", async () => {
        await truffleAssert.reverts(
            projectNFTInstance.mintToken(sender, project1.price, project1.royaltyPrice, project1.projectHash, project1.components, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))}),
            "Caller is not the master contract"
        );
    });

    it("should revert on transferPayment because doesn't allowed to call it", async () => {
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
        let v = parseInt(signature[0].toString());
        let r = signature[1].toString();
        let s = signature[2].toString();

        await masterInstance.mintToken(project1.price, project1.royaltyPrice, projectHash, project1.components, v,r,s, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});

        var buyPrice=(project1.price*105/100).toString(10);
        await truffleAssert.reverts(
            projectNFTInstance.transferPayment(1,sender2, { from: sender2, value: web3.utils.toHex(web3.utils.toWei(buyPrice, 'ether'))}),
            "Caller is not the access contract"
        );
    });
});
