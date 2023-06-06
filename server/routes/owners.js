//Exposing a key-value table of owners and respective NFTs
module.exports = app => {

    const redisClient = require('../controllers/redisClient');

    const router = require('express').Router();

    router.get('/owners', async (req, res) => {
        //const owners = await redisClient.getAllOwners();
        let owners = "test_owners";
        
        res.json({ owners });
    });

    router.get('/owners/:owner/nfts', async (req, res) => {
        const owner = req.params.owner;
        //const nfts = await redisClient.getNftsByOwner(owner);
        let nfts = "test_nfts";
        res.json({ nfts });
    });   

    app.use("/api/v1", router);
}