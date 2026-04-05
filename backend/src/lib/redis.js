const { createClient } = require('redis');

let client;
let connectPromise;

function getRedisClient() {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    });

    client.on('error', (error) => {
      console.error('Redis error:', error.message);
    });
  }

  return client;
}

async function ensureRedisConnected() {
  const redis = getRedisClient();

  if (redis.isOpen) {
    return redis;
  }

  if (!connectPromise) {
    connectPromise = redis.connect().finally(() => {
      connectPromise = null;
    });
  }

  await connectPromise;
  return redis;
}

module.exports = {
  ensureRedisConnected,
};