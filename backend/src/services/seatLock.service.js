const { ensureRedisConnected } = require('../lib/redis');

const DEFAULT_LOCK_SECONDS = parseInt(process.env.SEAT_LOCK_TTL_SECONDS || '300', 10);

class SeatLockError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'SeatLockError';
    this.details = details;
  }
}

function normalizeSeatNumbers(seatNumbers = []) {
  return [...new Set(
    seatNumbers
      .map((seat) => String(seat || '').trim().toUpperCase())
      .filter(Boolean)
  )];
}

function resolveScope({ eventId, scopeKey }) {
  if (scopeKey) return scopeKey;
  return `event:${eventId}`;
}

function lockKey(scope, seatNumber) {
  return `lock:${scope}:seat:${seatNumber}`;
}

async function lockSeats({ eventId, scopeKey, userId, seatNumbers, ttlSeconds = DEFAULT_LOCK_SECONDS }) {
  const redis = await ensureRedisConnected();
  const normalizedSeats = normalizeSeatNumbers(seatNumbers);
  const scope = resolveScope({ eventId, scopeKey });

  if (!normalizedSeats.length) {
    throw new SeatLockError('At least one seat is required');
  }

  const acquired = [];

  try {
    for (const seatNumber of normalizedSeats) {
      const key = lockKey(scope, seatNumber);
      const response = await redis.set(key, userId, {
        NX: true,
        EX: ttlSeconds,
      });

      if (response !== 'OK') {
        const existingUser = await redis.get(key);
        throw new SeatLockError('Seat already locked', {
          seatNumber,
          lockedBy: existingUser,
        });
      }

      acquired.push(key);
    }

    return {
      ttlSeconds,
      seatNumbers: normalizedSeats,
    };
  } catch (error) {
    if (acquired.length) {
      await redis.del(acquired);
    }
    throw error;
  }
}

async function releaseSeats({ eventId, scopeKey, userId, seatNumbers, onlyIfOwned = true }) {
  const redis = await ensureRedisConnected();
  const normalizedSeats = normalizeSeatNumbers(seatNumbers);
  const scope = resolveScope({ eventId, scopeKey });

  let releasedCount = 0;

  for (const seatNumber of normalizedSeats) {
    const key = lockKey(scope, seatNumber);

    if (!onlyIfOwned) {
      releasedCount += await redis.del(key);
      continue;
    }

    const lockedBy = await redis.get(key);
    if (lockedBy && lockedBy === userId) {
      releasedCount += await redis.del(key);
    }
  }

  return {
    releasedCount,
    seatNumbers: normalizedSeats,
  };
}

async function assertLockOwnership({ eventId, scopeKey, userId, seatNumbers }) {
  const redis = await ensureRedisConnected();
  const normalizedSeats = normalizeSeatNumbers(seatNumbers);
  const scope = resolveScope({ eventId, scopeKey });

  for (const seatNumber of normalizedSeats) {
    const key = lockKey(scope, seatNumber);
    const lockedBy = await redis.get(key);

    if (lockedBy !== userId) {
      throw new SeatLockError('Seat lock expired or not owned by user', { seatNumber });
    }
  }

  return normalizedSeats;
}

module.exports = {
  SeatLockError,
  assertLockOwnership,
  lockSeats,
  normalizeSeatNumbers,
  releaseSeats,
};