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

    async setNftToOwner(owner, nft) {
        try {
            await this.client.sAdd(owner, nft);
            console.log(`Added ${nft} NFT addresses to wallet ${owner}`);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    async getAllOwners() {
        // TODO: Implement this function
    }

    async getNftsByOwner(owner) {
        try {
            const nfts = await this.client.sMembers(owner);
            console.log(`NFT addresses for wallet ${owner}: ${nfts}`);
            return nfts;
        } catch (err) {
            console.error(err);
            return [];
        }
    }
}

module.exports = RedisClient;
