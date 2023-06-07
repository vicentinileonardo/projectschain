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
            console.log(`Owners: ${owners}`);
            return owners;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

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
    
    async getNftsByOwner(owner) {
        try {
            let key = "owners:" + owner;
            const nfts = await this.client.sMembers(key);
            console.log(`NFT addresses for wallet ${owner}: ${nfts}`);
            return nfts;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    async getAllNftsIds() { 
        try {
            const nfts = await this.client.keys('nfts:*');
            return nfts;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

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



    
    
}

module.exports = RedisClient;
