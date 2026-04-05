const { ensureRedisConnected } = require('../lib/redis');

const PROCESSING_TTL_SECONDS = parseInt(process.env.IDEMPOTENCY_PROCESSING_TTL_SECONDS || '300', 10);
const COMPLETE_TTL_SECONDS = parseInt(process.env.IDEMPOTENCY_COMPLETE_TTL_SECONDS || '86400', 10);

function idempotencyRedisKey({ scope, userId, key }) {
  return `idempotency:${scope}:user:${userId}:key:${key}`;
}

async function beginIdempotentRequest({ scope, userId, idempotencyKey }) {
  const redis = await ensureRedisConnected();
  const redisKey = idempotencyRedisKey({ scope, userId, key: idempotencyKey });

  const existing = await redis.get(redisKey);
  if (existing) {
    let parsed;
    try {
      parsed = JSON.parse(existing);
    } catch (_) {
      parsed = { status: 'UNKNOWN' };
    }

    if (parsed.status === 'COMPLETED') {
      return {
        state: 'replay',
        redisKey,
        cachedResponse: parsed.response,
      };
    }

    return {
      state: 'in-progress',
      redisKey,
    };
  }

  const lockPayload = JSON.stringify({ status: 'PROCESSING', startedAt: new Date().toISOString() });
  const acquired = await redis.set(redisKey, lockPayload, { NX: true, EX: PROCESSING_TTL_SECONDS });

  if (acquired !== 'OK') {
    return {
      state: 'in-progress',
      redisKey,
    };
  }

  return {
    state: 'started',
    redisKey,
  };
}

async function completeIdempotentRequest({ redisKey, responsePayload }) {
  const redis = await ensureRedisConnected();
  const payload = JSON.stringify({
    status: 'COMPLETED',
    completedAt: new Date().toISOString(),
    response: responsePayload,
  });

  await redis.set(redisKey, payload, { EX: COMPLETE_TTL_SECONDS });
}

async function clearIdempotentRequest({ redisKey }) {
  if (!redisKey) return;
  const redis = await ensureRedisConnected();
  await redis.del(redisKey);
}

module.exports = {
  beginIdempotentRequest,
  clearIdempotentRequest,
  completeIdempotentRequest,
};