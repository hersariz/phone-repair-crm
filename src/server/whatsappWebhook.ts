import express from 'express';
import { WHATSAPP_CONFIG } from '../lib/whatsappConfig';

const router = express.Router();

// Verifikasi webhook
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === WHATSAPP_CONFIG.WEBHOOK_VERIFY_TOKEN) {
      console.log('Webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Terima pesan webhook
router.post('/webhook', (req: any, res) => {
  const body = req.body;

  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0] &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
      const from = body.entry[0].changes[0].value.messages[0].from;
      const messageBody = body.entry[0].changes[0].value.messages[0].text.body;

      // Emit message to all connected clients
      req.io.emit('whatsapp-message', {
        id: crypto.randomUUID(),
        phone: from,
        message: messageBody,
        timestamp: new Date().toISOString(),
        direction: 'incoming'
      });

      res.sendStatus(200);
    }
  } else {
    res.sendStatus(404);
  }
});

export default router;
