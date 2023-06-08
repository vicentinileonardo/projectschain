//Exposing a key-value table of owners and respective NFTs
//passing redisClient as a parameter to the function
module.exports = (app, redisClient) => {

    const router = require('express').Router();

    router.get('/owners', async (req, res) => {
        const clientResponse = await redisClient.getAllOwners();
        if (clientResponse.status === 'error') {
            let response = {};
            response['status'] = 'error';
            response['message'] = clientResponse.message;
            res.status(500).send(response);
            return;
        }
        
        let owners = clientResponse.data;
        //trimming the prefix 'owners:' from the keys
        for (let i = 0; i < owners.length; i++) {
            owners[i] = owners[i].substring(7);
        }
        let data = {owners: owners};

        let response = {}
        response['status'] = 'success';
        response['message'] = clientResponse.message;
        response['data'] = data;

        res.status(200).send(response);
        return;
    });

    router.get('/owners/:owner/nfts', async (req, res) => {
        const owner = req.params.owner;
        if (!owner) {
            let response = {};
            response['status'] = 'error';
            response['message'] = 'Missing required parameter: owner';
            res.status(400).send(response);
            return;
        }
        const clientResponse = await redisClient.getNftsByOwner(owner);
        if (clientResponse.status === 'error') {
            let response = {};
            response['status'] = 'error';
            response['message'] = clientResponse.message;
            res.status(500).send(response);
            return;
        }

        let nfts = clientResponse.data;
        
        //response have the format: { owner: owner, nfts: [nft1, nft2, ...] }
        let data = { owner: owner, nfts: [] };
        for (let i = 0; i < nfts.length; i++) {
            data.nfts.push(nfts[i]);
        }

        let response = {};
        response['status'] = 'success';
        response['message'] = clientResponse.message;
        response['data'] = data;

        res.status(200).send(response);
        return;
    });

    router.post('/owners', async (req, res) => {
        const owner = req.body.owner;
        const nft = req.body.nft;

        if (!owner) {
            let response = {};
            response['status'] = 'error';
            response['message'] = 'Missing required parameter: owner';
            res.status(400).send(response);
            return;
        }
        if (!nft) {
            let response = {};
            response['status'] = 'error';
            response['message'] = 'Missing required parameter: nft';
            res.status(400).send(response);
            return;
        }

        const clientResponse = await redisClient.setNftToOwner(owner, nft);
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
    });

    router.delete('/owners', async (req, res) => {
        const clientResponse = await redisClient.deleteAllOwners();
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
    });

    app.use("/api/v1", router);
}


