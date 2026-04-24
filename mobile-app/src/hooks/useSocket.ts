import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE } from '../lib/api';

const SOCKET_URL = API_BASE.replace('/api', '');

export const useSocket = (roomId?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      if (roomId) {
        socket.emit('seat-room:join', { roomId });
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      if (roomId) {
        socket.emit('seat-room:leave', { roomId });
      }
      socket.disconnect();
    };
  }, [roomId]);

  const emit = (event: string, data: any) => {
    socketRef.current?.emit(event, data);
  };

  return {
    connected,
    emit,
    socket: socketRef.current,
  };
};
