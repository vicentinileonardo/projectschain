// Redis client to store key-value pairs of owners and respective NFTs
/*
const { createClient } = require('redis');

class RedisClient {
    constructor() {
        this.client = createClient();
        this.client.on('error', (err) => {
            console.log('Redis error, probably failed to connect to Redis');
            console.error(err);
        });
    }

    async ping() {
        await this.client.ping();
    }

    async connect() {
        try {            
            await this.client.connect();
            console.log('Connected to Redis');
        } catch (err) {
            console.error(err);
        }
    }

    async disconnect() {
        await this.client.disconnect();
    }

    //######### NFTs related functions ######### 

    //get all nfts, not just the ids
    async getAllNfts() {
        let clientResponse = {};
        try {
            const internalClientCall = await this.getAllNftsIds();
            if (internalClientCall.status === 'error') {
                clientResponse['status'] = 'error';
                clientResponse['message'] = 'Failed to retrieve NFTs';
                return clientResponse;
            }

            const nfts = internalClientCall.data;

            let nftsArray = [];
            for (const nft of nfts) {
                let nftObj = await this.client.get(nft);
                nftsArray.push(JSON.parse(nftObj));
            }

            clientResponse['status'] = 'success'
            clientResponse['message'] = 'NFTs retrieved successfully';
            clientResponse['data'] = nftsArray;
            return clientResponse;
        } catch (err) {
            clientResponse['status'] = 'error'
            clientResponse['message'] = 'Failed to retrieve NFTs';
            clientResponse['data'] = [];
            return clientResponse;
        }
    }

    //get all nfts ids
    async getAllNftsIds() { 
        let clientResponse = {};
        try {
            const nfts = await this.client.keys('nfts:*');
            clientResponse['status'] = 'success'
            clientResponse['message'] = 'NFTs retrieved successfully';
            clientResponse['data'] = nfts;
            return clientResponse;
        } catch (err) {
            clientResponse['status'] = 'error'
            clientResponse['message'] = 'Failed to retrieve NFTs';
            clientResponse['data'] = [];
            return clientResponse;
        }
    }

    //get nft by its tokenId
    async getNftById(tokenId) {
        let clientResponse = {};
        try {
            let key = "nfts:" + tokenId;
            let nft = await this.client.get(key);
            nft = JSON.parse(nft);
            if(!nft) {
                clientResponse['status'] = 'error'
                clientResponse['message'] = 'NFT not found';
                return clientResponse;
            } else {
                clientResponse['status'] = 'success'
                clientResponse['message'] = 'NFT retrieved successfully';
                clientResponse['data'] = nft;
                return clientResponse;
            }
        } catch (err) {
            clientResponse['status'] = 'error'
            clientResponse['message'] = 'Failed to retrieve NFT';
            return clientResponse;
        }
    }

    //get all nfts for a specific owner
    async getNftsByOwner(owner) {
        let clientResponse = {};
        try {
            let key = "owners:" + owner;
            const nfts = await this.client.sMembers(key);
            clientResponse['status'] = 'success'
            clientResponse['message'] = 'NFTs retrieved successfully';
            clientResponse['data'] = nfts;
            return clientResponse;
        } catch (err) {
            clientResponse['status'] = 'error'
            clientResponse['message'] = 'Failed to retrieve NFTs';
            clientResponse['data'] = [];
            return clientResponse;
        }
    }

    async createPendingNft(nft) {
        let clientResponse = {};
        try {
            let key = "nfts:" + nft.hash;
            let value = JSON.stringify(nft);
            await this.client.set(key, value);
            clientResponse['status'] = 'success'
            clientResponse['message'] = 'Pending NFT created successfully';
            clientResponse['data'] = nft;
            return clientResponse;
        } catch (err) {
            clientResponse['status'] = 'error'
            clientResponse['message'] = 'Failed to create pending NFT';
            clientResponse['data'] = {};
            return clientResponse;
        }
    }

    //create nft
    async createNft(nft) {
        let clientResponse = {};
        try {
            let key = "nfts:" + nft.tokenId;
            let value = JSON.stringify(nft);
            await this.client.set(key, value);
            clientResponse['status'] = 'success'
            clientResponse['message'] = 'NFT created successfully';
            clientResponse['data'] = nft;
            return clientResponse;
        } catch (err) {
            clientResponse['status'] = 'error'
            clientResponse['message'] = 'Failed to create NFT';
            clientResponse['data'] = {};
            return clientResponse;
        }
    }

    //delete all NFTs stored in the redis client
    async deleteAllNfts() {
        let clientResponse = {};
        try {
            const internalClientCall = await this.getAllNftsIds();
            if (internalClientCall.status === 'error') {
                clientResponse['status'] = 'error';
                clientResponse['message'] = 'Failed to delete all NFTs';
                return clientResponse;
            }

            const nfts = internalClientCall.data;
            for (const nft of nfts) {
                await this.client.del(nft);
            }

            clientResponse['status'] = 'success';
            clientResponse['message'] = 'All NFTs deleted';
            return clientResponse;
        } catch (err) {
            clientResponse['status'] = 'error';
            clientResponse['message'] = 'Failed to delete all NFTs';
            return clientResponse;
        }
    }   

    async deleteNftById(tokenId) {
        let clientResponse = {};
        try {
            let key = "nfts:" + tokenId;
            await this.client.del(key);
            clientResponse['status'] = 'success';
            clientResponse['message'] = 'NFT deleted';
            return clientResponse;
        } catch (err) {
            clientResponse['status'] = 'error';
            clientResponse['message'] = 'Failed to delete NFT';
            return clientResponse;
        }
    }

    //######### Owners related functions #########

    async getAllOwners() {
        let clientResponse = {};
        try {
            const owners = await this.client.keys('owners:*');
            clientResponse['status'] = 'success'
            clientResponse['message'] = 'Owners retrieved successfully';
            clientResponse['data'] = owners;
            return clientResponse;
        } catch (err) {
            clientResponse['status'] = 'error'
            clientResponse['message'] = 'Failed to retrieve owners';
            clientResponse['data'] = [];
            return clientResponse;
        }
    }

    //get specific owner
    async getOwner(owner) {
        let clientResponse = {};
        try {
            const key = "owners:" + owner;
            const nfts = await this.client.sMembers(key);
            clientResponse['status'] = 'success'
            clientResponse['message'] = 'Owner retrieved successfully';
            clientResponse['data'] = nfts;
            return clientResponse;
        } catch (err) {
            clientResponse['status'] = 'error'
            clientResponse['message'] = 'Failed to retrieve owner';
            clientResponse['data'] = [];
            return clientResponse;
        }
    }
    
    //an owner is created only when an NFT is associated with it
    async setNftToOwner(owner, nft) {
        let clientResponse = {};
        try {
            let key = "owners:" + owner;
            await this.client.sAdd(key, nft);

            clientResponse['status'] = 'success';
            clientResponse['message'] = `Added ${nft} NFT addresses to wallet ${owner}`;
            return clientResponse;
        } catch (err) {
            clientResponse['status'] = 'error';
            clientResponse['message'] = 'Failed to add NFT to wallet';
            return clientResponse;
        }
    }

    async deleteAllOwners() {
        let clientResponse = {};
        try {
            const internalClientCall = await this.getAllOwners();
            if (internalClientCall.status === 'error') {
                clientResponse['status'] = 'error';
                clientResponse['message'] = 'Failed to delete all NFTs';
                return clientResponse;
            }

            const owners = internalClientCall.data;
            for (const owner of owners) {
                await this.client.del(owner);
            }
            clientResponse['status'] = 'success';
            clientResponse['message'] = 'All NFTs deleted';
            return clientResponse;
        } catch (err) {
            clientResponse['status'] = 'error';
            clientResponse['message'] = 'Failed to delete all NFTs';
            return clientResponse;
        }
    }

    // debug only
    async getAllData() {
        let clientResponse = {};
        try {
            const keys = await this.client.keys('*');
            let data = [];
            for (const key of keys) {
                let value = await this.client.get(key);
                data.push({key: key, value: value});
            }
            clientResponse['status'] = 'success';
            clientResponse['message'] = 'All data retrieved';
            clientResponse['data'] = data;
            return clientResponse;
        } catch (err) {
            clientResponse['status'] = 'error';
            clientResponse['message'] = 'Failed to retrieve all data';
            clientResponse['data'] = [];
            return clientResponse;
        }
    }

    //delete all data stored in the redis client
    async deleteAllData() {
        let clientResponse = {};
        try {
            const keys = await this.client.keys('*');
            for (const key of keys) {
                await this.client.del(key);
            }
            clientResponse['status'] = 'success';
            clientResponse['message'] = 'All data deleted';
            return clientResponse;
        } catch (err) {
            clientResponse['status'] = 'error';
            clientResponse['message'] = 'Failed to delete all data';
            return clientResponse;
        }
    }
}

module.exports = RedisClient;
*/

//import { Entity, Schema, Client, Repository } from 'redis-om';

const redisOm = require('redis-om');
const Entity = redisOm.Entity;
const Schema = redisOm.Schema;
const Client = redisOm.Client;
const Repository = redisOm.Repository; 

class NFT extends Entity {}

let nft_schema = new Schema(NFT, {
    status: { type: 'string', required: true },
    tokenId: { type: 'number'},
    name: { type: 'string', required: true },
    description: { type: 'string'},
    price: { type: 'number', required: true },
    royaltyPrice: { type: 'number', required: true },
    owner: { type: 'string', required: true },
    hash: { type: 'string', required: true },
    ipsfLink: { type: 'string', required: true },
    projectJSON: { type: 'text', required: true },
    manufacturers: {type: 'string[]', required: true },
    buyers: {type: 'string[]', required: true }
});

async function setupRepository() {
    let client = await new Client().open();
    console.log("Redis client created", client);
    let NFTRepository = client.fetchRepository(nft_schema);
    console.log("NFTRepository created", NFTRepository);
    //await NFTRepository.createIndex();
    //console.log("NFTRepository index created");
    return NFTRepository;
}

//save data to disk
async function saveDataToDisk() {
    //client used to save data on disk for redis
    //the module "redis-om" is too high level and doesn't allow to save data on disk
    //therefore we use the module "redis" to save data on disk
    const redis = require("redis");
    const redisSavingClient = redis.createClient();
    console.log("Redis client created", redisSavingClient);

    redisSavingClient.bgsave((err, response) => {
        if (err) {
          console.error("Error saving data:", err);
        } else {
          console.log("Data saved to disk");
        }
    });
}
    
module.exports = {
    setupRepository,
    saveDataToDisk
};