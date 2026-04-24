let socketServer = null;

function setSocketServer(io) {
  socketServer = io;
}

function getSeatRoom(scopeType, scopeId) {
  return `seats:${scopeType}:${scopeId}`;
}

function emitSeatStateUpdate({ scopeType, scopeId, seatNumbers, status, userId, meta = {} }) {
  if (!socketServer) {
    return;
  }

  socketServer.to(getSeatRoom(scopeType, scopeId)).emit('seat-state:update', {
    scopeType,
    scopeId,
    seatNumbers,
    status,
    userId,
    timestamp: new Date().toISOString(),
    ...meta,
  });
}

function getSocketServer() {
  return socketServer;
}

module.exports = {
  emitSeatStateUpdate,
  getSeatRoom,
  setSocketServer,
  getSocketServer,
};