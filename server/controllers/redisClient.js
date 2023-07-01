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
    imageLink: { type: 'string', required: true },
    ipfsLink: { type: 'string', required: true },
    projectJSON: { type: 'string', required: true },
    manufacturers: {type: 'string[]', required: true },
    buyers: {type: 'string[]', required: true },
    signature: { type: 'string[]', required: true },
});

async function setupRepository() {
    let client = await new Client().open();
    console.log("Redis client created", client);
    let NFTRepository = client.fetchRepository(nft_schema);
    console.log("NFTRepository created", NFTRepository);
    await NFTRepository.createIndex();
    console.log("NFTRepository index created");
    return NFTRepository;
}

module.exports = {
    setupRepository
};
