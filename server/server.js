const express = require('express');
const app = express();
const Moralis = require('moralis').default;
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
require("dotenv").config();
const path = require('path');
const port = 3000;

// serve static files
//app.use(express.static(path.join(__dirname, '../client/dist')));

app.use(express.json());
app.use(cors());

//root route is /api
app.get('/api/v1', (req, res) => {
    res.json({ msg: 'API service working!' });
});

//routes
require('./routes/owners.js')(app);
require('./routes/nfts.js')(app);







Moralis.start({
    apiKey: process.env.MORALIS_KEY
})
const storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, __dirname + "/temp");
    },
    filename: function(req, file, callback){
        callback(null, "upload.png");
    }
    
});
const uploads = multer({storage:storage});
app.post('/api/uploadIPFS', uploads.array("file"), (req, res) => {
    const fileUploads = [
        {
            path: "upload.png",
            content: fs.readFileSync("./server/temp/upload.png", {encoding:"base64"})
        }
    ]

    async function uploadToIpfs(){ 
        const resIpfs = await Moralis.EvmApi.ipfs.uploadFolder({
            abi: fileUploads
        })

        console.log(resIpfs.result);
        return res.json({ result: resIpfs.result });
    }

    uploadToIpfs();
})


// start the server
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});


/**
 * 
 * token id
 * indirizzo ipfs
 * etc
 * 
 */