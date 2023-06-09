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
    
    //######### NFTs related functions ######### 

    //get all nfts, not just the ids
    async getAllNfts() {
        let clientResponse = {};
        try {
            const internalClientCall = await this.getAllNftsIds();
            if (internalClientCall.status === 'error') {
                clientResponse['status'] = 'error';
                clientResponse['message'] = 'Failed to retrieve NFTs';
                clientResponse['data'] = [];
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

    //get nft by its id
    async getNftById(id) {
        let clientResponse = {};
        try {
            let key = "nfts:" + id;
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
}

module.exports = RedisClient;
