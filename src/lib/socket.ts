import io from 'socket.io-client';

// Konfigurasi socket
const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3000';

let socket;

try {
  // Coba buat koneksi socket asli
  socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 5000
  });
  
  console.log('Socket initialized...');
} catch (error) {
  console.warn('Failed to initialize socket.io:', error);
  
  // Fallback ke dummy socket jika gagal
  socket = {
    on: (_event: string, _callback: any) => {},
    off: (_event: string) => {},
    emit: (_event: string, _data: any) => {
      console.log('Socket emit (dummy):', _event, _data);
      return false;
    },
    connect: () => {}
  };
}

// Ekspor socket
export default socket; 