import React, { useState, useEffect, useRef } from 'react';
import { Customer } from '../types';
import { format } from 'date-fns';
import { Send, Paperclip } from 'lucide-react';

interface ChatMessage {
  id: string;
  customerId: string;
  message: string;
  timestamp: string;
  sender: 'customer' | 'cso';
}

const InAppChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load customers from localStorage
    const savedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
    setCustomers(savedCustomers);
    
    // Load chat history for selected customer
    if (selectedCustomer) {
      const savedMessages = JSON.parse(localStorage.getItem(`chat_${selectedCustomer}`) || '[]');
      setMessages(savedMessages);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    // Auto-scroll ke pesan terbaru
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !selectedCustomer) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      customerId: selectedCustomer,
      message: input,
      timestamp: new Date().toISOString(),
      sender: 'cso'
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // Save to localStorage
    localStorage.setItem(`chat_${selectedCustomer}`, JSON.stringify(updatedMessages));
    
    // Clear input
    setInput('');
    
    // Simulasi balasan otomatis (untuk demo)
    setTimeout(() => {
      const autoReply: ChatMessage = {
        id: crypto.randomUUID(),
        customerId: selectedCustomer,
        message: "Pesan Anda telah diterima. Terima kasih telah menghubungi kami.",
        timestamp: new Date().toISOString(),
        sender: 'customer'
      };
      
      const withReply = [...updatedMessages, autoReply];
      setMessages(withReply);
      localStorage.setItem(`chat_${selectedCustomer}`, JSON.stringify(withReply));
    }, 1000);
    
    // Kirim notifikasi email jika pelanggan memiliki email
    const customer = customers.find(c => c.id === selectedCustomer);
    if (customer?.email) {
      sendEmailNotification(customer, input);
    }
  };
  
  // Fungsi untuk mengirim notifikasi email
  const sendEmailNotification = (customer: Customer, message: string) => {
    console.log(`Sending email notification to ${customer.email}: ${message}`);
    // Implementasi sesungguhnya akan menggunakan API email seperti SendGrid atau Nodemailer
  };

  return (
    <div className="flex flex-col h-[600px] w-[400px] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-blue-600 text-white rounded-t-lg">
        <h2 className="font-semibold">Customer Chat</h2>
      </div>

      {/* Customer Selection */}
      <div className="p-4 border-b">
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="">Pilih Customer</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name} - {customer.phone}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'cso' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.sender === 'cso'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{msg.message}</p>
              <p className="text-xs mt-1 opacity-75">
                {format(new Date(msg.timestamp), 'HH:mm')}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <button
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 p-2 border rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !selectedCustomer}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InAppChat; 