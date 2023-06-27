//const Repository = require('../controllers/redisClient');
const fetch = require('node-fetch');
const Hash = require('ipfs-only-hash');
const Moralis = require('moralis').default;
const fs = require('fs').promises;
const path = require('path');
const flatten = require('flat');

//const repository = await Repository.setupRepository();

const { error } = require('console');
const Web3Token = require('web3-token');

//Exposing a key-value table of owners and respective NFTs
module.exports = (app, repository, Moralis) => {

    const router = require('express').Router();

    //GET

    router.get('/nfts', async (req, res) => {

        try {
            let nfts = await repository.search().where('status').eq('minted').returnAll();

            if (nfts.length === 0) {
                let response = {};
                response['status'] = 'error';
                response['message'] = 'NFTs not found';
                res.status(404).send(response);
                return;
            }

            //unflatten the projectJSON
            nfts = unflattenJSONfield('projectJSON', nfts);

            //hide sensitive fields like projectJSON, hash, ipfsLink
            for (let i = 0; i < nfts.length; i++) {
                let check1 = await verifyIfOwner(nfts[i].owner, req.headers['authorization'])
                let check2 = await verifyIfManufacturer(nfts[i].manufacturers, req.headers['authorization'])
                if (!check1 && !check2) {
                    nfts[i] = hideField('hash', nfts[i]);
                    nfts[i] = hideField('ipfsLink', nfts[i]);
                    nfts[i] = hideField('projectJSON', nfts[i]);
                }
            }

            //hide entityId (redis key)
            for (let i = 0; i < nfts.length; i++) {
                nfts[i] = hideField('entityId', nfts[i]);
            }

            //TODO: keep fields in the query string if they exist, to reduce overfetching 

            let data = { nfts: nfts };

            let response = {};
            response['status'] = 'success';
            response['message'] = 'NFTs found';
            response['data'] = data;

            res.status(200).send(response);
            return;

        } catch (err) {
            let response = {};
            response['status'] = 'error';
            response['message'] = 'Error fetching NFTs';
            res.status(500).send(response);
            return;
        }
    });

    router.get('/nfts/catalog', async (req, res) => {

        try {
            if (!req.headers['authorization']) {
                let response = {};
                response['status'] = 'error';
                response['message'] = 'Authorization token missing';
                res.status(401).send(response);
                return;
            }

            let token = req.headers['authorization'];
            token = token.split(' ')[1];
            const { address, body } = await Web3Token.verify(token);

            let ownerAddress = address;

            console.log("ownerAddress: ", ownerAddress);

            //get all nfts from repository that have the owner different from the one in the request
            let nfts = await repository.search().where('status').eq('minted').and('owner').not.eq(ownerAddress).returnAll();

            let response = {};
            response['status'] = 'success';
            response['message'] = 'NFTs found';

            if (nfts.length === 0) {
                response['data'] = { nfts: []};
            } else {
                //unflatten the projectJSON
                nfts = unflattenJSONfield('projectJSON', nfts);

                //hide sensitive fields like projectJSON, hash, ipfsLink
                for (let i = 0; i < nfts.length; i++) {
                    let check1 = await verifyIfOwner(nfts[i].owner, req.headers['authorization'])
                    let check2 = await verifyIfManufacturer(nfts[i].manufacturers, req.headers['authorization'])
                    if (!check1 && !check2) {
                        nfts[i] = hideField('hash', nfts[i]);
                        nfts[i] = hideField('ipfsLink', nfts[i]);
                        nfts[i] = hideField('projectJSON', nfts[i]);
                    }
                }

                //hide entityId (redis key)
                for (let i = 0; i < nfts.length; i++) {
                    nfts[i] = hideField('entityId', nfts[i]);
                }

                let data = { nfts: nfts };

                response['data'] = data;
            }

            res.status(200).send(response);
            return;
        } catch (err) {
            console.log("err: ", err);

            let response = {};
            response['status'] = 'error';
            response['message'] = 'Error fetching NFTs';
            res.status(500).send(response);
            return;
        }
    });

    router.get('/owners/:ownerAddress/nfts', async (req, res) => {

        try {

            let ownerAddress = req.params.ownerAddress;
            if (ownerAddress === undefined) {
                let response = {};
                response['status'] = 'error';
                response['message'] = 'Owner address not found';
                res.status(404).send(response);
                return;
            }

            //get all nfts from repository that have the owner passed in the request
            let nfts = await repository.search().where('status').eq('minted').and('owner').eq(ownerAddress).returnAll();

            let response = {};
            response['status'] = 'success';
            response['message'] = 'NFTs found';

            if (nfts.length === 0) {
                response['data'] = { nfts: []};
            } else {

                //unflatten the projectJSON
                nfts = unflattenJSONfield('projectJSON', nfts);

                //hide sensitive fields like projectJSON, hash, ipfsLink
                for (let i = 0; i < nfts.length; i++) {
                    let check1 = await verifyIfOwner(nfts[i].owner, req.headers['authorization'])
                    let check2 = await verifyIfManufacturer(nfts[i].manufacturers, req.headers['authorization'])
                    if (!check1 && !check2) {
                        nfts[i] = hideField('hash', nfts[i]);
                        nfts[i] = hideField('ipfsLink', nfts[i]);
                        nfts[i] = hideField('projectJSON', nfts[i]);
                    }
                }

                //hide entityId (redis key)
                for (let i = 0; i < nfts.length; i++) {
                    nfts[i] = hideField('entityId', nfts[i]);
                }

                let data = { nfts: nfts };
                response['data'] = data;
            }

            res.status(200).send(response);
            return;
        } catch (err) {
            console.log("err: ", err);

            let response = {};
            response['status'] = 'error';
            response['message'] = 'Error fetching NFTs';
            res.status(500).send(response);
            return;
        }
    });

    router.get('/buyers/:manufacturerAddress/nfts', async (req, res) => {

        try {

            let manufacturerAddress = req.params.manufacturerAddress;
            if (manufacturerAddress === undefined) {
                let response = {};
                response['status'] = 'error';
                response['message'] = 'Buyer address not found';
                res.status(404).send(response);
                return;
            }

            //get all nfts from repository that have the owner passed in the request
            let nfts = await repository.search().where('status').eq('minted').and('manufacturers').contains(manufacturerAddress).returnAll();

            let response = {};
            response['status'] = 'success';
            response['message'] = 'NFTs found';

            if (nfts.length === 0) {
                response['data'] = { nfts: []};
            } else {
                //unflatten the projectJSON
                nfts = unflattenJSONfield('projectJSON', nfts);

                //hide sensitive fields like projectJSON, hash, ipfsLink
                for (let i = 0; i < nfts.length; i++) {
                    let check1 = await verifyIfOwner(nfts[i].owner, req.headers['authorization'])
                    let check2 = await verifyIfManufacturer(nfts[i].manufacturers, req.headers['authorization'])
                    if (!check1 && !check2) {
                        nfts[i] = hideField('hash', nfts[i]);
                        nfts[i] = hideField('ipfsLink', nfts[i]);
                        nfts[i] = hideField('projectJSON', nfts[i]);
                    }
                }

                //hide entityId (redis key)
                for (let i = 0; i < nfts.length; i++) {
                    nfts[i] = hideField('entityId', nfts[i]);
                }

                let data = { nfts: nfts };
                response['data'] = data;
            }

            res.status(200).send(response);
            return;
        } catch (err) {
            console.log("err: ", err);

            let response = {};
            response['status'] = 'error';
            response['message'] = 'Error fetching NFTs';
            res.status(500).send(response);
            return;
        }
    });

    router.get('/nfts/:tokenId', async (req, res) => {

        let tokenId = req.params.tokenId;
        if (!tokenId) {
            let response = {};
            response['status'] = 'fail';
            response['data'] = { tokenId: 'tokenId is required' };
            res.status(400).send(response);
            return;
        }
        //check that tokenId is a number
        if (isNaN(tokenId)) {
            let response = {};
            response['status'] = 'fail';
            response['data'] = { tokenId: "tokenId must be a number" };
            res.status(400).send(response);
            return;
        }

        let nfts = await repository.search().where('status').eq('minted').and('tokenId').eq(tokenId).returnAll();
        if (nfts.length === 0) {
            let response = {};
            response['status'] = 'error';
            response['message'] = 'NFT not found';
            res.status(404).send(response);
            return;
        }
        if (nfts.length > 1) {
            let response = {};
            response['status'] = 'error';
            response['message'] = 'Multiple NFTs found, something went wrong';
            res.status(500).send(response);
            return;
        }

        //unflatten the projectJSON
        nfts = unflattenJSONfield('projectJSON', nfts);

        //hide sensitive fields like projectJSON, hash, ipfsLink
        for (let i = 0; i < nfts.length; i++) {
            let check1 = await verifyIfOwner(nfts[i].owner, req.headers['authorization'])
            let check2 = await verifyIfManufacturer(nfts[i].manufacturers, req.headers['authorization'])
            if (!check1 && !check2) {
                nfts[i] = hideField('hash', nfts[i]);
                nfts[i] = hideField('ipfsLink', nfts[i]);
                nfts[i] = hideField('projectJSON', nfts[i]);
            }
        }

        //hide entityId (redis key)
        for (let i = 0; i < nfts.length; i++) {
            nfts[i] = hideField('entityId', nfts[i]);
        }

        let nft = nfts[0];

        let data = { nft: nft };

        let response = {};
        response['status'] = 'success';
        response['message'] = 'NFT found';
        response['data'] = data;

        res.status(200).send(response);
        return;
    });

    router.get('/nfts/:tokenId/buyPrice/:user', async (req, res) => {
        let user = req.params.user;
        let tokenId = req.params.tokenId;
        if (!tokenId) {
            let response = {};
            response['status'] = 'fail';
            response['data'] = { tokenId: 'tokenId is required' };
            res.status(400).send(response);
            return;
        }
        //check that tokenId is a number
        if (isNaN(tokenId)) {
            let response = {};
            response['status'] = 'fail';
            response['data'] = { tokenId: "tokenId must be a number" };
            res.status(400).send(response);
            return;
        }

        let nfts = await repository.search().where('status').eq('minted').and('tokenId').eq(tokenId).returnAll();
        if (nfts.length === 0) {
            let response = {};
            response['status'] = 'error';
            response['message'] = 'NFT not found';
            res.status(404).send(response);
            return;
        }
        if (nfts.length > 1) {
            let response = {};
            response['status'] = 'error';
            response['message'] = 'Multiple NFTs found, something went wrong';
            res.status(500).send(response);
            return;
        }

        nfts = unflattenJSONfield('projectJSON', nfts);

        let nft = nfts[0];

        console.log('getting buy price for NFT ' + nft.tokenId);
        console.log(`it has ${nft.projectJSON.components.length} components`);

        let royaltyPrice = 0;

        for (const c of nft.projectJSON.components) {

            let components = await repository.search().where('status').eq('minted').and('tokenId').eq(c).returnAll();
            let component = components[0];

            if (component.owner != user) {
                royaltyPrice = royaltyPrice + component.royaltyPrice;
            }
        }

        let data = { base: nft.price, royaltyPrice: royaltyPrice };

        let response = {};
        response['status'] = 'success';
        response['message'] = 'Returning buy price';
        response['data'] = data;
        res.status(200).send(response);
        return;
    })

    //POST
    //preminting
    router.post('/nfts', async (req, res) => {
        let nft_body = req.body
        if (!nft_body || Object.keys(nft_body).length === 0) {
            let response = bodyValidationErrorResponse('nft_body');
            res.status(400).send(response);
            return;
        }

        //validate nft_body, with specific error messages
        if (!nft_body.name) {
            let response = bodyValidationErrorResponse('name');
            res.status(400).send(response);
            return;
        }
        if (!nft_body.price) {
            let response = bodyValidationErrorResponse('price');
            res.status(400).send(response);
            return;
        }
        if (!nft_body.royaltyPrice) {
            let response = bodyValidationErrorResponse('royaltyPrice');
            res.status(400).send(response);
            return;
        }
        if (!nft_body.owner) {
            let response = bodyValidationErrorResponse('owner');
            res.status(400).send(response);
            return;
        }
        if (!nft_body.projectJSON) {
            let response = bodyValidationErrorResponse('projectJSON');
            res.status(400).send(response);
            return;
        }

        // validate against existing nfts
        let validationResponse = await validateNft(nft_body, repository);
        if (validationResponse.status === 'fail') {
            let response = {};
            response['status'] = validationResponse.status;
            response['data'] = validationResponse.data;
            res.status(400).send(response);
            return;
        }

        //save a JSON file to file system
        const projectJSON = JSON.stringify(nft_body.projectJSON);
        const filename = nft_body.name + "_" + nft_body.owner + '.json';
        const filepath = '../temp/' + filename;

        await fs.writeFile(path.resolve(__dirname, filepath), projectJSON);
        let file = await fs.readFile(path.resolve(__dirname, filepath));

        const hash = await Hash.of(file);
        console.log("hash: ", hash);

        let url = 'https://ipfs.io/ipfs/' + hash;

        //call to IPFS to check if hash already exists, the request should last 3 seconds max
        try {
            const ipfsResponse = await fetch(url, { method: 'HEAD', timeout: 3000 });
            if (ipfsResponse.status === 200) {
                console.log("file exists already on IPFS");
                let response = {};
                response['status'] = 'error';
                response['message'] = 'NFT already exists';
                res.status(400).send(response);
                return;
            }
        } catch (error) {
            //network error, hash does not exist, good to go
            console.log("file does not exist on IPFS");
        }

        //flatten the projectJSON
        let flattenedProjectJSON = flatten(nft_body.projectJSON);

        //encode to text
        const encodedProjectJson = JSON.stringify(flattenedProjectJSON);

        //save nft metadata to redis
        let nft = repository.createEntity();

        //random number between 1 and 3
        let randomImageNumber = Math.floor(Math.random() * 3) + 1;
        let imageLink = 'project' + randomImageNumber + '.jpg';

        nft.status = 'premint';
        nft.name = nft_body.name;
        nft.description = nft_body.description || '';
        nft.price = nft_body.price;
        nft.royaltyPrice = nft_body.royaltyPrice;
        nft.owner = nft_body.owner;
        nft.hash = hash;
        nft.imageLink = imageLink;
        nft.ipfsLink = url;
        nft.projectJSON = encodedProjectJson;
        nft.components = nft_body.components;
        nft.manufacturers = [];
        nft.buyers = [];

        //console.log("nft: ", nft);

        // save the NFT to Redis
        try {
            let id = await repository.save(nft);

            console.log("id: ", id);

            //in order to have the unflattened projectJSON in the response
            nft['entityFields']['projectJSON']['_value'] = nft_body.projectJSON;

            let data = { nft: nft };

            //all validations passed and metadata saved
            let response = {};
            response['status'] = 'success';
            response['message'] = 'All validations passed for NFT, metadata saved';
            response['data'] = data;
            res.status(200).send(response);
            return;
        }
        catch (error) {
            console.log("error: ", error);
            let response = {};
            response['status'] = 'error';
            response['message'] = 'Error saving NFT to Redis';
            res.status(500).send(response);
            return;
        }
    });

    //PUT
    // effectively minting the NFT (uploading to IPFS and updating status to minted)
    router.put('/nfts/:hash', async (req, res) => {

        let hash = req.params.hash;
        if (!hash) {
            let response = {};
            response['status'] = 'fail';
            response['data'] = { hash: 'hash is required' };
            res.status(400).send(response);
            return;
        }

        try {
            let nfts = await repository.search().where('hash').eq(hash).returnAll();
            if (nfts.length === 0) {
                let response = {};
                response['status'] = 'error';
                response['message'] = 'NFT not found';
                res.status(404).send(response);
                return;
            }
            if (nfts.length > 1) {
                let response = {};
                response['status'] = 'error';
                response['message'] = 'Multiple NFTs found, something went wrong';
                res.status(500).send(response);
                return;
            }
            console.log("nft is unique");

            nfts = unflattenJSONfield('projectJSON', nfts);

            let nft = await repository.fetch(nfts[0].entityId);
            //console.log("nft: ", nft);

            mintNft(req, res, nft, repository);

        } catch (error) {
            console.log("error: ", error);
            let response = {};
            response['status'] = 'error';
            response['message'] = 'Error updating NFT';
            res.status(500).send(response);
            return;
        }
    });

    //update NFT, with manufacturer and buyers
    router.patch('/nfts/:tokenId', async (req, res) => {

        let tokenId = req.params.tokenId;
        if (!tokenId) {
            let response = {};
            response['status'] = 'fail';
            response['data'] = { tokenId: 'tokenId is required' };
            res.status(400).send(response);
            return;
        }
        if (isNaN(tokenId)) {
            let response = {};
            response['status'] = 'fail';
            response['data'] = { tokenId: 'tokenId must be a number' };
            res.status(400).send(response);
            return;
        }

        try {
            let nfts = await repository.search().where('tokenId').eq(tokenId).returnAll();
            if (nfts.length === 0) {
                let response = {};
                response['status'] = 'error';
                response['message'] = 'NFT not found';
                res.status(404).send(response);
                return;
            }
            if (nfts.length > 1) {
                let response = {};
                response['status'] = 'error';
                response['message'] = 'Multiple NFTs found, something went wrong';
                res.status(500).send(response);
                return;
            }
            console.log("nft is unique");

            nfts = unflattenJSONfield('projectJSON', nfts);

            let nft = await repository.fetch(nfts[0].entityId);
            //console.log("nft: ", nft);

            updateNft(req, res, nft, repository);

        } catch (error) {
            console.log("error: ", error);
            let response = {};
            response['status'] = 'error';
            response['message'] = 'Error updating NFT';
            res.status(500).send(response);
            return;
        }
    });

    //DELETE

    router.delete('/nfts', async (req, res) => {
        let nfts = await repository.search().returnAll();

        if (nfts.length === 0) {
            let response = {};
            response['status'] = 'error';
            response['message'] = 'No NFTs found';
            res.status(404).send(response);
            return;
        }

        try {
            for (let i = 0; i < nfts.length; i++) {
                await repository.remove(nfts[i].entityId);
            }
            let response = {};
            response['status'] = 'success';
            response['message'] = 'All NFTs deleted successfully';
            res.status(200).send(response);
            return;
        }
        catch (error) {
            console.log("error: ", error);
            let response = {};
            response['status'] = 'error';
            response['message'] = 'Error deleting NFTs';
            res.status(500).send(response);
            return;
        }

    });

    //delete by hash since it is the unique identifier we have before minting
    //we could think to delete if something went wrong during minting
    //after minting it does not make sense to delete the NFT
    router.delete('/nfts/:hash', async (req, res) => {

        let hash = req.params.hash;
        if (!hash) {
            let response = {};
            response['status'] = 'fail';
            response['data'] = { hash: 'hash is required' };
            res.status(400).send(response);
            return;
        }

        try {
            let nfts = await repository.search().where('hash').eq(hash).returnAll();
            if (nfts.length === 0) {
                let response = {};
                response['status'] = 'error';
                response['message'] = 'NFT not found';
                res.status(404).send(response);
                return;
            }
            if (nfts.length > 1) {
                let response = {};
                response['status'] = 'error';
                response['message'] = 'Multiple NFTs found, something went wrong';
                res.status(500).send(response);
                return;
            }

            let nft = await repository.fetch(nfts[0].entityId);

            await repository.remove(nft.entityId);

            let response = {};
            response['status'] = 'success';
            response['message'] = 'NFT deleted successfully';
            res.status(200).send(response); //cannot use status code 204 because of the response body
            return;

        } catch (error) {
            console.log("error: ", error);
            let response = {};
            response['status'] = 'error';
            response['message'] = 'Error deleting NFT';
            res.status(500).send(response);
            return;
        }
    });

    app.use("/api/v1", router);
}

function bodyValidationErrorResponse(parameter) {
    let response = {};
    response['status'] = 'fail';
    response['data'] = { parameter: 'Missing required parameter: ' + parameter };
    return response;
}

function handleFields(nfts, query_fields) {
    if (query_fields && query_fields !== 'hash') {
        let fields = query_fields.split(',');
        for (let i = 0; i < nfts.length; i++) {
            let nft = nfts[i];
            let nftKeys = Object.keys(nft);
            for (let j = 0; j < nftKeys.length; j++) {
                let key = nftKeys[j];
                if (!fields.includes(key)) {
                    delete nft[key];
                }
            }
        }
    }
}

async function validateNft(nft_body, repository) {

    //check if name is already in use
    /*
    let nftsToBeChecked = await repository.search().where('name').eq(nft_body.name).returnAll();
    if (nftsToBeChecked.length > 0) {
        let response = {};
        response['status'] = 'fail';
        response['data'] = { name: 'Name already in use' };
        return response;
    }
    */

    //check if price is valid
    if (nft_body.price) {
        if (nft_body.price < 0) {
            let response = {};
            response['status'] = 'fail';
            response['data'] = { price: 'Price must be greater than 0' };
            return response;
        }
    }

    //check if royaltyPrice is valid
    if (nft_body.royaltyPrice) {
        if (nft_body.royaltyPrice < 0) {
            let response = {};
            response['status'] = 'fail';
            response['data'] = { royaltyPrice: 'royaltyPrice must be greater than 0' };
            return response;
        }
    }

    //check if components (inside projectJSON) are valid (if the tokenId exist)
    if (nft_body.projectJSON.components) {
        let components = nft_body.projectJSON.components;
        let unknownComponents = [];
        let tokenIds = [];

        //get all the tokenIds from repository
        let nfts = await repository.search().returnAll();

        for (let i = 0; i < nfts.length; i++) {
            tokenIds.push(nfts[i].tokenId);
        }
        for (let i = 0; i < components.length; i++) {
            let component = components[i];
            if (!tokenIds.includes(component)) {
                unknownComponents.push(component);
            }
        }
        if (unknownComponents.length > 0) {
            let response = {};
            response['status'] = 'fail';
            response['data'] = { projectJSONcomponents: 'Unknown components: ' + unknownComponents + '. Please check the tokenIds' };
            return response;
        }
    }

    let response = {};
    response['status'] = 'success';
    return response;
}

function unflattenJSONfield(field, nfts) {
    for (let i = 0; i < nfts.length; i++) {
        let value = nfts[i]['entityFields'][field]['_value'];
        let parsedValue = JSON.parse(value);
        let flattenedValue = flatten.unflatten(parsedValue);
        nfts[i]['entityFields'][field]['_value'] = flattenedValue;
    }
    return nfts;
}

function hideField(field, nft) {
    if (field === 'entityId') {
        delete nft['entityId'];
        return nft;
    }
    delete nft['entityFields'][field]['_value'];
    return nft;
}

async function mintNft(req, res, nft, repository) {

    //check if status exist and is premint
    if (!nft.status) {
        let response = {};
        response['status'] = 'fail';
        response['data'] = { status: 'Missing required parameter: status' };
        res.status(400).send(response);
        return;
    }
    if (nft.status === 'minted') {
        let response = {};
        response['status'] = 'fail';
        response['data'] = { status: 'NFT status is minted, cannot mint again' };
        res.status(400).send(response);
        return;
    }
    if (nft.status !== 'premint') {
        let response = {};
        response['status'] = 'fail';
        response['data'] = { status: 'NFT status is not premint, cannot mint' };
        res.status(400).send(response);
        return;
    }

    let tokenId = req.body.tokenId;
    if (!tokenId) {
        let response = {};
        response['status'] = 'fail';
        response['data'] = { tokenId: 'Missing required parameter: tokenId' };
        res.status(400).send(response);
        return;
    }

    //check if tokenId is not already in use
    let nftsToBeChecked = await repository.search().where('tokenId').eq(tokenId).returnAll();
    if (nftsToBeChecked.length > 0) {
        let response = {};
        response['status'] = 'error';
        response['message'] = 'TokenId is already in use';
        res.status(400).send(response);
        return;
    }

    const filename = nft.name + "_" + nft.owner + '.json';
    const filepath = '../temp/' + filename;

    //if successful, store save projectJSON to IPFS
    let dataToUpload = await fs.readFile(path.resolve(__dirname, filepath), { encoding: "base64" });
    const abi = [
        {
            path: "project.json",
            content: dataToUpload
        }
    ];

    let resIpfs = await Moralis.EvmApi.ipfs.uploadFolder({ abi });
    resIpfs = resIpfs.toJSON();
    //console.log("resIpfs: ", resIpfs[0]['path']);

    //check if IPFS upload was successful
    if (!resIpfs[0]['path']) {
        let response = {};
        response['status'] = 'error';
        response['message'] = 'Error updating NFT, IPFS upload failed';
        res.status(500).send(response);
        return;
    }

    let ipfsLink = 'https://ipfs.io/ipfs/' + nft.hash;

    nft.tokenId = tokenId;
    nft.ipfsLink = ipfsLink;
    nft.status = 'minted';

    let id = await repository.save(nft);
    console.log("saving id: ", id);

    //delete temp file from disk
    await removeFile(filepath);

    let data = { nft: nft };

    let response = {};
    response['status'] = 'success';
    response['message'] = 'NFT updated successfully (minting)';
    response['data'] = data;
    res.status(200).send(response);
    return;
}

// in order to add manufacturers and owners
async function updateNft(req, res, nft, repository) {
    //check if status exist and is minted
    if (!nft.status) {
        let response = {};
        response['status'] = 'fail';
        response['data'] = { status: 'Missing required parameter: status' };
        res.status(400).send(response);
        return;
    }
    if (nft.status === 'premint') {
        let response = {};
        response['status'] = 'fail';
        response['data'] = { status: 'NFT status is premint, cannot update' };
        res.status(400).send(response);
        return;
    }
    if (nft.status !== 'minted') {
        let response = {};
        response['status'] = 'fail';
        response['data'] = { status: 'NFT status is not minted, cannot update' };
        res.status(400).send(response);
        return;
    }
    if (!req.body.manufacturer && !req.body.buyer) {
        let response = {};
        response['status'] = 'fail';
        response['data'] = { body: 'Missing required parameter: manufacturer or buyer' };
        res.status(400).send(response);
        return;
    }
    if (req.body.manufacturer && req.body.buyer) {
        let response = {};
        response['status'] = 'fail';
        response['data'] = { body: 'Cannot update both manufacturer and buyer' };
        res.status(400).send(response);
        return;
    }

    /* TODO: add WEB3 library and test 
    //check if manufacturer is a valid address
    if(req.body.manufacturer) {
        if(!web3.utils.isAddress(req.body.manufacturer)) {
            let response = {};
            response['status'] = 'error';
            response['message'] = 'Invalid manufacturer address';
            res.status(400).send(response);
            return;
        }
    }

    //check if owner is a valid address
    if(req.body.buyer) {
        if(!web3.utils.isAddress(req.body.owner)) {
            let response = {};
            response['status'] = 'error';
            response['message'] = 'Invalid buyer address';
            res.status(400).send(response);
            return;
        }
    }
    */

    if (req.body.manufacturer) {
        if (nft.manufacturers.includes(req.body.manufacturer)) {
            let response = {};
            response['status'] = 'fail';
            response['data'] = { manufacturer: 'Manufacturer already exists' };
            res.status(400).send(response);
            return;
        }
        nft.manufacturers.push(req.body.manufacturer);
    }
    else if (req.body.buyer) {
        if (nft.buyers.includes(req.body.buyer)) {
            let response = {};
            response['status'] = 'fail';
            response['data'] = { buyer: 'Buyer already exists' };
            res.status(400).send(response);
            return;
        }
        nft.buyers.push(req.body.buyer);
    } else {
        let response = {};
        response['status'] = 'fail';
        response['data'] = { body: 'Missing required parameter: manufacturer or buyer' };
        res.status(400).send(response);
        return;
    }

    let id = await repository.save(nft);
    console.log("id: ", id);

    let data = { nft: nft };

    let response = {};
    response['status'] = 'success';
    response['message'] = 'NFT updated successfully (updating manufacturers or buyers)';
    response['data'] = data;
    res.status(200).send(response);
    return;
}

async function verifyIfOwner(nftOwner, token) {
    try {
        if (!token) return false;
        token = token.split(' ')[1];

        const { address, body } = await Web3Token.verify(token);
        console.log("ADDRESS RECOVERED ", address, body)

        if (address == nftOwner) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err.message)
        return false;
    }
}

async function verifyIfManufacturer(nftManufacturers, token) {
    try {
        if (!token) return false;
        token = token.split(' ')[1];

        const { address, body } = await Web3Token.verify(token);
        console.log("ADDRESS RECOVERED ", address, body)

        if (nftManufacturers.includes(address)) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err.message)
        return false;
    }
}

//remove file from disk
async function removeFile(filepath) {
    try {
        await fs.unlink(path.resolve(__dirname, filepath));
        console.log('File removed');
    } catch (err) {
        console.error(err);
    }
}
