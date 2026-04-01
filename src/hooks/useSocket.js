import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

/**
 * Access the socket instance and helpers.
 * Usage: const { socket, connected, joinPlan, leavePlan, emit, on } = useSocket();
 */
export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>');
  return ctx;
}
