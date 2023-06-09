const { error } = require('console');
const RedisClient = require('../controllers/redisClient');

//Exposing a key-value table of owners and respective NFTs
module.exports = (app, redisClient) => {

    const router = require('express').Router();

    router.get('/nfts', async (req, res) => {
        let clientResponse;
        if(req.query.fields && req.query.fields === 'id') {
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
        if(req.query.fields && req.query.fields === 'id') {
            //trimming the prefix 'nfts:' from the keys
            for (let i = 0; i < nfts.length; i++) {
                nfts[i] = nfts[i].substring(5);
            }
        }
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
            let response = validationErrorResponse('nft_body');
            res.status(400).send(response);
            return;
        }
        
        //validate nft_body, with specific error messages
        if (!nft_body.tokenId) {
            console.log('Missing required parameter: tokenId');
            let response = validationErrorResponse('tokenId');
            res.status(400).send(response);
            return;
        }
        if (!nft_body.name) {
            let response = validationErrorResponse('name');
            res.status(400).send(response);
            return;
        }
        if (!nft_body.project) {
            let response = validationErrorResponse('project');
            res.status(400).send(response);
            return;
        }
        if (!nft_body.owner) {
            let response = validationErrorResponse('owner');
            res.status(400).send(response);
            return;
        }

        //TODO: validate components in some way
        //TODO: validate IPFS link in some way
        
        let nft = {
            tokenId: nft_body.tokenId,
            name: nft_body.name,
            description: nft_body.description,
            image: nft_body.image,
            project: nft_body.project,
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

function validationErrorResponse(parameter) {
    let response = {};
    response['status'] = 'error';
    response['message'] =  'Missing required parameter: ' + parameter;
    return response;
}
