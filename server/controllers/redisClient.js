// Redis client to store key-value pairs of owners and respective NFTs

import { createClient } from 'redis';

module.exports = async redisClient => {

    const client = createClient();

    client.on('error', err => console.log('Redis Client Error', err));

    await client.connect();
}
