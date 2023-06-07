const RedisClient = require('../controllers/redisClient');

//Exposing a key-value table of owners and respective NFTs
module.exports = (app, redisClient) => {

    const router = require('express').Router();

    router.get('/nfts', async (req, res) => {
        const nfts = await redisClient.getAllNftsIds();
        res.json({ nfts });
    });

    router.post('/nfts', async (req, res) => {
        let nft = req.body
        if (!nft) {
            res.status(400).json({ error: 'Missing required parameter: nft' });
            return;
        }
        //TODO: add other checks on the NFT body
        if (!nft.tokenId) {
            res.status(400).json({ error: 'Missing required parameter in NFT: tokenId' });
            return;
        }

        nft = {
            tokenId: nft.tokenId,
            owner: nft.owner,
            name: nft.name,
            description: nft.description,
            image: nft.image,
            external_url: nft.external_url,
            attributes: nft.attributes
        }

        const response = await redisClient.createNft(nft);
        res.json({ response });
    });

    router.get('/nfts/:nft', async (req, res) => {
        const nft = req.params.nft;
        if (!nft) {
            res.status(400).json({ error: 'Missing required parameter: nft' });
            return;
        }
        const single_nft = await redisClient.getNftById(nft)
        res.json({ single_nft });
    });

    app.use("/api/v1", router);
}