// Redis client to store key-value pairs of owners and respective NFTs

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


    async getAllOwners() {
        try {
            const owners = await this.client.keys('owners:*');
            //console.log(`Owners: ${owners}`);
            return owners;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    //an owner is created only when an NFT is associated with it
    async setNftToOwner(owner, nft) {
        try {
            let key = "owners:" + owner;
            await this.client.sAdd(key, nft);
            console.log(`Added ${nft} NFT addresses to wallet ${owner}`);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    async deleteAllOwners() {
        try {
            const owners = await this.getAllOwners();
            for (const owner of owners) {
                await this.client.del(owner);
            }
            console.log(`Deleted all owners`);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
    
    //NFTs related functions

    //get all nfts, not just the ids
    async getAllNfts() {
        try {
            const nfts = await this.getAllNftsIds();
            let nftsArray = [];
            for (const nft of nfts) {
                let nftObj = await this.client.get(nft);
                nftsArray.push(JSON.parse(nftObj));
            }
            return nftsArray;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    //get all nfts ids
    async getAllNftsIds() { 
        try {
            const nfts = await this.client.keys('nfts:*');
            return nfts;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    //get nft by its id
    async getNftById(id) {
        try {
            let key = "nfts:" + id;
            let nft = await this.client.get(key);
            return JSON.parse(nft);
        } catch (err) {
            console.error(err);
            return {};
        }
    }

    //get all nfts for a specific owner
    async getNftsByOwner(owner) {
        try {
            let key = "owners:" + owner;
            const nfts = await this.client.sMembers(key);
            //console.log(`NFT addresses for wallet ${owner}: ${nfts}`);
            return nfts;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    //create nft
    async createNft(nft) {
        try {
            let key = "nfts:" + nft.tokenId;
            let value = JSON.stringify(nft);
            await this.client.set(key, value);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    //delete all is stored in the redis client
    async deleteAllNfts() {
        try {
            const nfts = await this.getAllNftsIds();
            for (const nft of nfts) {
                await this.client.del(nft);
            }
            //console.log(`Deleted all nfts`);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    
}

module.exports = RedisClient;
