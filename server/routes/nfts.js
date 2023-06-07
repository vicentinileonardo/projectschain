const RedisClient = require('../controllers/redisClient');

//Exposing a key-value table of owners and respective NFTs
module.exports = (app, redisClient) => {

    const router = require('express').Router();

    router.get('/nfts', async (req, res) => {
        if(req.query.id == "true") {
            const nfts = await redisClient.getAllNftsIds();
            
            //trimming the prefix 'nfts:' from the keys
            for (let i = 0; i < nfts.length; i++) {
                nfts[i] = nfts[i].substring(5);
            }
            res.json({ nfts });
        } else {
            const nfts = await redisClient.getAllNfts();
            res.json({ nfts });
        }
    });

    router.get('/nfts/:nftId', async (req, res) => {
        let nftId = req.params.nftId;
        if (!nftId) {
            res.status(400).json({ error: 'Missing required parameter: nft' });
            return;
        }
        const nft = await redisClient.getNftById(nftId);
        res.json({ nft });
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
            components: nft.components,
            project_url: nft.project_url,
            image_url: nft.image_url,
        }

        const response = await redisClient.createNft(nft);
        res.json({ response });
    });

    router.delete('/nfts', async (req, res) => {
        const response = await redisClient.deleteAllNfts();
        if (response) {
            res.json({ message: 'All NFTs deleted' });
        }
    });

    app.use("/api/v1", router);
}