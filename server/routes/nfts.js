const { error } = require('console');
const RedisClient = require('../controllers/redisClient');

//Exposing a key-value table of owners and respective NFTs
module.exports = (app, redisClient) => {

    const router = require('express').Router();

    router.get('/nfts', async (req, res) => {
        let clientResponse;
        if(req.query.fields && req.query.fields === 'tokenId') {
            clientResponse = await redisClient.getAllNftsIds(); //more efficient
        } else {
            clientResponse = await redisClient.getAllNfts();
        }
        
        if (clientResponse.status === 'error') {
            let response = {};
            response['status'] = 'error';
            response['message'] = clientResponse.message;
            res.status(500).send(response);
            return;
        }

        let nfts = clientResponse.data;
        if(req.query.fields && req.query.fields === 'tokenId') {
            //trimming the prefix 'nfts:' from the keys
            for (let i = 0; i < nfts.length; i++) {
                nfts[i] = nfts[i].substring(5);
            }
        }

        //handling fields query parameter in general, so returning only the requested fields
        handleFields(nfts, req.query.fields);

        let data = {nfts: nfts};

        let response = {}
        response['status'] = 'success';
        response['message'] = clientResponse.message;
        response['data'] = data;

        res.status(200).send(response);
        return;
        
    });

    router.get('/nfts/:tokenId', async (req, res) => {
        let tokenId = req.params.tokenId;
        if (!tokenId) {
            let response = {};
            response['status'] = 'error';
            response['message'] = 'Missing required parameter: tokenId';
            res.status(400).send(response);
            return;
        }
        const clientResponse = await redisClient.getNftById(tokenId);
        if (clientResponse.status === 'error') {
            let response = {};
            response['status'] = 'error';
            response['message'] = clientResponse.message;
            if (clientResponse.message === 'NFT not found') { //handle status code 404
                res.status(404).send(response);
                return;
            }
            res.status(500).send(response);
            return;
        }

        let nft = clientResponse.data;
        let data = { nft: nft };

        let response = {};
        response['status'] = 'success';
        response['message'] = clientResponse.message;
        response['data'] = data;

        res.status(200).send(response);
        return;
    });

    router.post('/nfts', async (req, res) => {
        let nft_body = req.body
        if (!nft_body || Object.keys(nft_body).length === 0) {
            let response = bodyValidationErrorResponse('nft_body');
            res.status(400).send(response);
            return;
        }
        
        //validate nft_body, with specific error messages
        if (!nft_body.tokenId) {
            let response = bodyValidationErrorResponse('tokenId');
            res.status(400).send(response);
            return;
        }
        if (!nft_body.name) {
            let response = bodyValidationErrorResponse('name');
            res.status(400).send(response);
            return;
        }
        if (!nft_body.project) {
            let response = bodyValidationErrorResponse('project');
            res.status(400).send(response);
            return;
        }
        if (!nft_body.owner) {
            let response = bodyValidationErrorResponse('owner');
            res.status(400).send(response);
            return;
        }
        if (!nft_body.hash) {
            let response = bodyValidationErrorResponse('hash');
            res.status(400).send(response);
            return;
        }

        // validate against existing nfts
        let validationResponse = await validateNft(redisClient, nft_body);
        if (validationResponse.status === 'error') {
            let response = {};
            response['status'] = 'error';
            response['message'] = validationResponse.message;
            res.status(400).send(response);
            return;
        }

        let nft = {
            tokenId: nft_body.tokenId,
            name: nft_body.name,
            description: nft_body.description,
            hash: nft_body.hash,
            project: nft_body.project,
            image: nft_body.image,
            components: nft_body.components,
            owner: nft_body.owner   
        }

        const clientResponse = await redisClient.createNft(nft);
        if (clientResponse.status === 'error') {
            let response = {};
            response['status'] = 'error';
            response['message'] = clientResponse.message;
            res.status(500).send(response);
            return;
        }

        let data = { nft: nft };

        let response = {};
        response['status'] = 'success';
        response['message'] = clientResponse.message;
        response['data'] = data;

        res.status(201).send(response);
        return;
    });

    router.delete('/nfts', async (req, res) => {
        const clientResponse = await redisClient.deleteAllNfts();
        if (clientResponse.status === 'error') {
            let response = {};
            response['status'] = 'error';
            response['message'] = clientResponse.message;
            res.status(500).send(response);
            return;
        }

        let response = {};
        response['status'] = 'success';
        response['message'] = clientResponse.message;

        res.status(200).send(response);
        return;
    });

    app.use("/api/v1", router);
}

function bodyValidationErrorResponse(parameter) {
    let response = {};
    response['status'] = 'error';
    response['message'] =  'Missing required parameter: ' + parameter;
    return response;
}

function handleFields(nfts, query_fields){
    if(query_fields && query_fields !== 'tokenId') {
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

async function validateNft(redisClient, nft_body) {

    //TODO: validate IPFS link in some way
    
    //retrieve all nfts to check if hash is already in use
    let clientResponse = await redisClient.getAllNfts();
    
    if (clientResponse.status === 'error') {
        let response = {};
        response['status'] = 'error';
        response['message'] = clientResponse.message;
        return response;
    }

    //get all NFTs hashes
    let nfts = clientResponse.data;

    let hashes = [];
    for (let i = 0; i < nfts.length; i++) {
        hashes.push(nfts[i].hash);
    }

    //check if hash is already in use
    let hash = nft_body.hash;
    if(hashes.includes(hash)) {
        let response = {};
        response['status'] = 'error';
        response['message'] = 'Hash already in use';
        return response;
    }

    //check if components are valid (if the tokenIds exist), maybe to be changed to a different validation
    if (nft_body.components) {
        let components = nft_body.components;
        let unknownComponents = [];
        let tokenIds = [];
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
            response['status'] = 'error';
            response['message'] = 'Unknown components: ' + unknownComponents + '. Please check the tokenIds.';
            return response;
        }
    }
    
    let response = {}
    response['status'] = 'success';
    response['message'] = 'NFT validated successfully';
    return response;
}
