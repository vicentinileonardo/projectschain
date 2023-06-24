const express = require('express');
const app = express();
const Hash = require('ipfs-only-hash');
const fetch = require('node-fetch');
const Moralis = require('moralis').default;
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
require("dotenv").config();
const path = require('path');
const port = 3000;

const Repository = require('./controllers/redisClient');
    
async function setupRepository() {
    let repo = await Repository.setupRepository();
    return repo;
}

const repositoryPromise = setupRepository();

repositoryPromise.then(async (repository) => {

    app.use(express.json());
    app.use(cors());

    //root route is /api
    app.get('/api/v1', (req, res) => {

        let response = {
            "status": "success",
            "message": "API service working!"
        };
        res.status(200).json(response);
    });

    // Moralis gateway
    Moralis.start({
        apiKey: process.env.MORALIS_KEY
    })

    //routes
    require('./routes/nfts.js')(app, repository, Moralis);

    // start the server
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });

}).catch((err) => {
    console.log(err);
    process.exit(1);
}
);
