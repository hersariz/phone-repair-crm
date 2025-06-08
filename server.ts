const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = createServer(app);
const socketServer = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO
socketServer.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('send-message', (message) => {
    console.log('Message received:', message);
    // Broadcast ke semua klien kecuali pengirim
    socket.broadcast.emit('whatsapp-message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// API Endpoints
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// WhatsApp webhook untuk menerima pesan
app.post('/api/webhook/whatsapp', (req, res) => {
  try {
    console.log('Webhook data received:', req.body);
    
    // Validasi data
    if (!req.body || !req.body.entry || !req.body.entry[0]) {
      return res.status(400).json({ error: 'Invalid webhook data' });
    }

    // Ekstrak pesan dari webhook
    const entry = req.body.entry[0];
    if (entry.changes && entry.changes[0] && entry.changes[0].value) {
      const value = entry.changes[0].value;
      
      if (value.messages && value.messages.length > 0) {
        // Ekstrak informasi pesan
        const messageData = value.messages[0];
        const senderPhone = messageData.from;
        const messageText = messageData.text ? messageData.text.body : '[Unsupported message type]';
        const messageId = messageData.id;
        
        // Buat objek pesan untuk dikirim ke klien
        const message = {
          id: messageId,
          phone: senderPhone,
          message: messageText,
          timestamp: new Date().toISOString(),
          direction: 'incoming'
        };
        
        // Broadcast pesan ke semua klien
        socketServer.emit('whatsapp-message', message);
      }
    }
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// WhatsApp webhook verification
app.get('/api/webhook/whatsapp', (req, res) => {
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  
  // Parse params from the webhook verification request
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === verifyToken) {
      // Respond with 200 OK and challenge token
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else {
    // Responds with '400 Bad Request' if params missing
    res.sendStatus(400);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 