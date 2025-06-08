import { WHATSAPP_CONFIG } from '../lib/whatsappConfig';

interface WhatsAppMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'text' | 'template' | 'image';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text?: string;
        image?: {
          link: string;
        };
      }>;
    }>;
  };
}

export class WhatsAppService {
  private baseUrl: string;
  private phoneNumberId: string;
  private accessToken: string;

  constructor() {
    this.baseUrl = WHATSAPP_CONFIG.BASE_URL;
    this.phoneNumberId = WHATSAPP_CONFIG.PHONE_NUMBER_ID;
    this.accessToken = WHATSAPP_CONFIG.ACCESS_TOKEN;
  }

  async sendMessage(to: string, text: string): Promise<any> {
    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: {
        body: text
      }
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/${WHATSAPP_CONFIG.API_VERSION}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message)
        }
      );

      if (!response.ok) {
        throw new Error(`WhatsApp API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  async sendTemplate(
    to: string, 
    templateName: string, 
    languageCode: string = 'id',
    components?: any[]
  ): Promise<any> {
    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        components: components
      }
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/${WHATSAPP_CONFIG.API_VERSION}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message)
        }
      );

      if (!response.ok) {
        throw new Error(`WhatsApp API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending WhatsApp template:', error);
      throw error;
    }
  }
}

export const whatsappService = new WhatsAppService();
