const RedisClient = require('../controllers/redisClient');

//Exposing a key-value table of owners and respective NFTs
module.exports = (app, redisClient) => {

    const router = require('express').Router();

    router.get('/nfts', async (req, res) => {
        //const nfts = await redisClient.getAllNfts();
        let nfts = "test_nft";
        res.json({ nfts });
    });

    router.get('/nfts/:nft', async (req, res) => {
        const nft = req.params.nft;
        //const owners = await redisClient.getOwnersByNft(nft);
        let single_nft = "test_single_nft";
        res.json({ single_nft });
    });

    app.use("/api/v1", router);
}