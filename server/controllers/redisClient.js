// Redis client to store key-value pairs of owners and respective NFTs

module.exports = async redisClient => {

    const { createClient } = require('redis');

    const client = createClient();

    client.on('error', err => console.log('Redis Client Error', err));

    await client.connect();
}
