import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { getToken } from '../utils/auth';

export const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useContext(AuthContext);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  // Store external event callbacks registered by other parts of the app
  const listenersRef = useRef({});

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event, cb) => {
    if (!listenersRef.current[event]) {
      listenersRef.current[event] = [];
    }
    listenersRef.current[event].push(cb);
    // Register on live socket if already connected
    socketRef.current?.on(event, cb);
    // Return cleanup
    return () => {
      listenersRef.current[event] = listenersRef.current[event].filter(fn => fn !== cb);
      socketRef.current?.off(event, cb);
    };
  }, []);

  const joinPlan = useCallback((planId) => {
    socketRef.current?.emit('join_plan', planId);
  }, []);

  const leavePlan = useCallback((planId) => {
    socketRef.current?.emit('leave_plan', planId);
  }, []);

  // Connect when user authenticates
  useEffect(() => {
    if (!isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const token = getToken();
    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Re-attach any listeners registered before connect
    Object.entries(listenersRef.current).forEach(([event, cbs]) => {
      cbs.forEach((cb) => socket.on(event, cb));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated]);

  const value = useMemo(() => ({
    socket: socketRef.current,
    connected,
    emit,
    on,
    joinPlan,
    leavePlan,
  }), [connected, emit, on, joinPlan, leavePlan]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
