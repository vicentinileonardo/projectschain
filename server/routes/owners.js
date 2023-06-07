//Exposing a key-value table of owners and respective NFTs
//passing redisClient as a parameter to the function
module.exports = (app, redisClient) => {
    const router = require('express').Router();

    router.get('/testAssignment', async (req, res) => {
        
        const walletAddress = '0x1234567890abcdef';
        const nftAddresses = '0x1111111112';
        const redisResponse = await redisClient.setNftToOwner(walletAddress, nftAddresses);

        res.json({ redisResponse });

    });

    router.get('/testRetrieve', async (req, res) => {

        const walletAddress = '0x1234567890abcdef';

        let redisResponse = await redisClient.getNftsByOwner(walletAddress);
        res.json({ redisResponse });

    });



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


