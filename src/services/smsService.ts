// SMS Service menggunakan ZenzivaAPI (populer di Indonesia)
export class SMSService {
  private apiKey: string;
  private userKey: string;
  private baseUrl: string = 'https://console.zenziva.net/api';
  
  constructor(apiKey: string, userKey: string) {
    this.apiKey = apiKey;
    this.userKey = userKey;
  }
  
  async sendSMS(phoneNumber: string, message: string): Promise<any> {
    try {
      // Pastikan format nomor telepon benar
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      const response = await fetch(`${this.baseUrl}/sendsms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userkey: this.userKey,
          passkey: this.apiKey,
          to: formattedPhone,
          message: message
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`SMS API Error: ${response.status} - ${errorText}`);
        throw new Error(`SMS API Error: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }
  
  private formatPhoneNumber(phone: string): string {
    // Hapus karakter '+' jika ada
    let formatted = phone.replace(/\+/g, '');
    
    // Jika dimulai dengan '62', itu sudah benar
    // Jika dimulai dengan '0', ganti dengan '62'
    if (formatted.startsWith('0')) {
      formatted = '62' + formatted.substring(1);
    }
    
    return formatted;
  }
  
  async sendNotification(customer: { name: string, phone: string }, message: string): Promise<any> {
    const fullMessage = `Halo ${customer.name}, ${message}`;
    return this.sendSMS(customer.phone, fullMessage);
  }
  
  async sendServiceUpdate(
    customer: { name: string, phone: string },
    ticketId: string,
    status: string,
    additionalInfo?: string
  ): Promise<any> {
    const message = `Update Servis #${ticketId}: Status servis Anda telah berubah menjadi "${status}".` + 
                   (additionalInfo ? ` ${additionalInfo}` : '') +
                   ` Terima kasih telah menggunakan jasa PhoneRepair.`;
    
    return this.sendNotification(customer, message);
  }
}

// Inisialisasi dengan key dummy, ganti dengan key asli di environment variables
export const smsService = new SMSService(
  process.env.ZENZIVA_API_KEY || 'your-api-key',
  process.env.ZENZIVA_USER_KEY || 'your-user-key'
); 