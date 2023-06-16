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
const uploadForIPFS = multer({storage:storage});
app.post('/api/uploadIPFS', uploadForIPFS.array("file"), async (req, res) => {
    const fileUploads = [
        {
            path: "upload.txt",
            content: fs.readFileSync("./server/temp/upload.txt", {encoding:"base64"})
        }
    ]

    const data = fs.readFileSync('./server/temp/upload.txt');

    //Predicts ipfs address in order to check conflict
    const hash = await Hash.of(data);
    const url = "https://ipfs.io/ipfs/" + hash;
    //console.log(hash) 

    //checks if the same file was already uploaded on IPFS, a 5sec timeout is set for this operation
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
        res.json(response);
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
        res.json(response); 
    }
    //remove temp files
    fs.unlinkSync("./server/temp/upload.txt");

})

const uploadFindSubcomponents = multer({ dest: './temp/' });
app.post('/api/compareProjects', uploadFindSubcomponents.array('files'), async (req, res) => {

    //Iterate through the json and store their content
    const fileData = req.files.map((file) => {
      const jsonData = fs.readFileSync(file.path, 'utf8');
      const data = JSON.parse(jsonData);
      return data;
    });

    //remove temp files
    req.files.forEach((file) => {
        fs.unlinkSync(file.path);
    });
    
    //store single components (lines) of a both the projects
    var subcomponentsCopied = [];
    var subcomponentsUploaded = [];

    for(i in fileData[1]["model"]){
        subcomponentsCopied.push(JSON.stringify(fileData[1]["model"][i][Object.keys(fileData[1].model[i])]));
    }

    for(i in fileData[0]["model"]){
        subcomponentsUploaded.push(JSON.stringify(fileData[0]["model"][i][Object.keys(fileData[0].model[i])]));
    }

    //perform intersection between two projects, in order to understand if one is the subset of the other one
    var commonComponents = subcomponentsUploaded.filter(value => subcomponentsCopied.includes(value));
    if(commonComponents.length == subcomponentsCopied.length){
        let response=`{
            "status": "FAIL",
            "message": "The file IS NOT original"
        }`;
        
        console.log(response);
        return res.json(response); 
    }else{
        let response=`{
            "status": "SUCCESS",
            "message": "The file IS original"
        }`;

        return res.json(response); 
    }
  });
  


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

