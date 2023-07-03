const ProjectNFT = artifacts.require("ProjectNFT");
const Master = artifacts.require("Master");
const AccessSmartContract = artifacts.require("AccessSmartContract");
const assert = require('assert');
const Web3 = require('web3');
const truffleAssert = require("truffle-assertions");
const fetch = require('node-fetch');


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

    it("should revert for invalid signature", async () => {
        await truffleAssert.reverts(
            masterInstance.mintToken(project1.price, project1.royaltyPrice, project1.projectHash, [42], 24, "0x123","0x234",{ from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))}),
        "Invalid signature");    
    });

    it("should revert for not sufficient value sent on mint", async () => {

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

        //console.log('v', v);
        //console.log('r', r);
        //console.log('s', s);

        await truffleAssert.reverts(
            masterInstance.mintToken(project1.price, project1.royaltyPrice, projectHash , project1.components, v,r,s, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0001', 'ether'))}),
        "Pay amount is not price of mint commissions");
    }); 

    it("should revert for already present hash on mint", async () => {

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

        //console.log('v', v);
        //console.log('r', r);
        //console.log('s', s);

        masterInstance.mintToken(project1.price, project1.royaltyPrice, projectHash , project1.components, v,r,s, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.006', 'ether'))}),

        await truffleAssert.reverts(
            masterInstance.mintToken(project1.price, project1.royaltyPrice, projectHash , project1.components, v,r,s, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.006', 'ether'))}),
        "Project already exists");
    }); 

    it("should revert for invalid component on mint", async () => {

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

        //console.log('v', v);
        //console.log('r', r);
        //console.log('s', s);

        await truffleAssert.reverts(
            masterInstance.mintToken(project1.price, project1.royaltyPrice, projectHash , [2], v,r,s, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.006', 'ether'))}),
        "Component not valid");
    }); 


    it("should mint a token successfully", async () => {

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

        const result = await masterInstance.mintToken(project1.price, project1.royaltyPrice, projectHash, project1.components, v,r,s, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        const tokenId = result.logs[0].args.tokenId;
        assert.strictEqual(tokenId.toString(), '1');
    });

    it("should revert for non-existing token", async () => {
        await truffleAssert.reverts(
            masterInstance.buyToken(1,{ from: sender2, value: web3.utils.toHex(web3.utils.toWei("0.001", 'ether'))}),
            "Token does not exist");
    });

    it("should buy a token successfully", async () => {

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

        const result = await masterInstance.mintToken(project1.price, project1.royaltyPrice, projectHash, project1.components, v,r,s, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        
        var buyPrice=(project1.price*105/100).toString(10);
        await masterInstance.buyToken(1,{ from: sender2, value: web3.utils.toHex(web3.utils.toWei(buyPrice, 'ether'))});
    });

    it("should revert on buyToken for not sufficient value sent", async () => {

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

        const result = await masterInstance.mintToken(project1.price, project1.royaltyPrice, projectHash, project1.components, v,r,s, { from: sender, value: web3.utils.toHex(web3.utils.toWei('0.0006', 'ether'))});
        
        await truffleAssert.reverts(
            masterInstance.buyToken(1,{ from: sender2, value: web3.utils.toHex(web3.utils.toWei("0", 'ether'))}),
            "Pay amount is not enough to pay for price of project");
    });

    // Add more tests here according to your contract functionalities
});