//Exposing a key-value table of owners and respective NFTs
//passing redisClient as a parameter to the function
module.exports = (app, redisClient) => {

    const router = require('express').Router();

    router.get('/owners', async (req, res) => {
        const owners = await redisClient.getAllOwners();
        res.json({ owners });
    });

    router.post('/owners', async (req, res) => {
        const owner = req.body.owner;
        const nft = req.body.nft;
        if (!owner) {
            res.status(400).json({ error: 'Missing required parameter: owner' });
            return;
        }
        if (!nft) {
            res.status(400).json({ error: 'Missing required parameter: nft' });
            return;
        }
        const response = await redisClient.setNftToOwner(owner, nft);
        res.json({ response });
    });

    router.delete('/owners', async (req, res) => {
        const response = await redisClient.deleteAllOwners();
        res.json({ response });
    });

    router.get('/owners/:owner/nfts', async (req, res) => {
        const owner = req.params.owner;
        if (!owner) {
            res.status(400).json({ error: 'Missing required parameter: owner' });
            return;
        }
        const nfts = await redisClient.getNftsByOwner(owner);
        res.json({ nfts });
    });   

    app.use("/api/v1", router);
}


