const { createClient } = require('redis');

let redisClient;

const connectRedis = async () => {
  // Gracefully fallback if Redis URL is not configured
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    console.warn('⚠️  Redis connection details not found. Caching will be disabled.');
    return null;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    });

    redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    redisClient.on('connect', () => console.log('✅ Connected to Redis successfully'));

    await redisClient.connect();
    return redisClient;
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    // Allow the application to start even if Redis fails (cache misses will just hit DB)
    redisClient = null;
    return null;
  }
};

const getRedisClient = () => redisClient;

module.exports = {
  connectRedis,
  getRedisClient,
};
