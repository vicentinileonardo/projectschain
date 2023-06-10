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

// serve static files
//app.use(express.static(path.join(__dirname, '../client/dist')));

app.use(express.json());
app.use(cors());

//root route is /api
app.get('/api/v1', (req, res) => {
    res.json({ msg: 'API service working!' });
});

const redisClient = createRedisClient();
redisClient.connect();

//routes
require('./routes/owners.js')(app, redisClient);
require('./routes/nfts.js')(app, redisClient);

// Moralis gateway
Moralis.start({
    apiKey: process.env.MORALIS_KEY
})
const storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, __dirname + "/temp");
    },
    filename: function(req, file, callback){
        callback(null, "upload.txt");
    }
    
});
const uploads = multer({storage:storage});
app.post('/api/uploadIPFS', uploads.array("file"), async (req, res) => {
    const fileUploads = [
        {
            path: "upload.txt",
            content: fs.readFileSync("./server/temp/upload.txt", {encoding:"base64"})
        }
    ]

    const data = fs.readFileSync('./server/temp/upload.txt');
    const hash = await Hash.of(data);
    const url = "https://ipfs.io/ipfs/" + hash;
    //console.log(hash) 

    async function checkIfExistsIpfs(){ 
        
        const promiseTimeout = new Promise((resolve, reject) => {
            setTimeout(resolve, 5000, true); //we assume that the file was never uploaded on IPFS
        });
        
        const promiseIPFS = new Promise((resolve, reject) => {
            fetch(url)
                .then(response => {
                    if (response.ok) {
                        return false; //the file is not original
                        //return response.json();
                    }
                    throw new Error('Network response was not ok.');
                })
                .then(data => resolve(data))
                .catch(error => reject(error));
        });
        
        return Promise.race([promiseTimeout, promiseIPFS]).then((value) => {
            //console.log(value);
            return value;
        });
    }
  
    async function uploadToIpfs(){ 
        const resIpfs = await Moralis.EvmApi.ipfs.uploadFolder({
            abi: fileUploads
        })

        //console.log(resIpfs.result);
        let response=`{
            "status": "SUCCESS",
            "url": "`+url+`"
        }`;

        console.log(response);
        return res.json(response);
    }

    const fileToBeUploaded = await checkIfExistsIpfs();

    if(fileToBeUploaded){
        //POST NFT su server
        //POST: http://localhost:3000/api/v1/nfts
        uploadToIpfs();
    }else{
        let response=`{
            "status": "FAIL",
            "message": "The file is not original"
        }`;
        
        console.log(response);
        return res.json(response); 
    }
    
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

// Factory function to create a Redis client
function createRedisClient() {
    
    const RedisClient = require('./controllers/redisClient');

    const redisConfig = {
        // Redis server connection settings, if needed
    };
    
    const redisClient = new RedisClient(redisConfig);
    return redisClient;
   
}

