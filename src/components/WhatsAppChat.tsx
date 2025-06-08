import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Phone, Paperclip, Send, Image, Wifi, WifiOff } from 'lucide-react';
import socket from '../lib/socket';
import { whatsappService } from '../services/whatsappService';

interface WhatsAppMessage {
  id: string;
  phone: string;
  message: string;
  timestamp: string;
  direction: 'incoming' | 'outgoing';
}

const WhatsAppChat: React.FC = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers, setCustomers] = useState<{ id: string; name: string; phone: string }[]>([]);
  const [viewMode, setViewMode] = useState<'chat' | 'whatsapp-web'>('chat');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load customers from localStorage
    const savedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
    setCustomers(savedCustomers);

    try {
      // Socket.IO event listeners dengan penanganan error
      socket.on('connect', () => {
        console.log('Connected to WebSocket');
        setSocketConnected(true);
        setSocketError(false);
      });

      socket.on('connect_error', (error) => {
        console.log('Socket connection error:', error);
        setSocketConnected(false);
        setSocketError(true);
      });

      socket.on('whatsapp-message', (message: WhatsAppMessage) => {
        setMessages(prev => [...prev, message]);
      });

      return () => {
        socket.off('connect');
        socket.off('connect_error');
        socket.off('whatsapp-message');
      };
    } catch (error) {
      console.error("Error setting up socket connection:", error);
      setSocketError(true);
    }
  }, []);

  useEffect(() => {
    // Auto-scroll ke pesan terbaru
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && !file) || !selectedCustomer) return;

    const newMessage: WhatsAppMessage = {
      id: crypto.randomUUID(),
      phone: selectedCustomer,
      message: file ? `[File: ${file.name}]` : input,
      timestamp: new Date().toISOString(),
      direction: 'outgoing'
    };

    try {
      if (file) {
        // Handle file upload logic here
        console.log('Uploading file:', file);
        // Implementasi upload file ke WhatsApp API akan ditambahkan nanti
        alert('Fitur upload file sedang dalam pengembangan');
      } else {
        await whatsappService.sendMessage(selectedCustomer, input);
      }
      
      setMessages(prev => [...prev, newMessage]);
      setInput('');
      setFile(null);
      
      // Emit message to other clients
      socket.emit('send-message', newMessage);
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      alert('Gagal mengirim pesan. Silakan coba lagi.');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'chat' ? 'whatsapp-web' : 'chat');
  };

  return (
    <div className="flex flex-col h-[600px] w-[400px] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-green-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          <h2 className="font-semibold">WhatsApp Chat</h2>
        </div>
        <div className="flex items-center gap-2">
          {socketConnected ? (
            <div title="Terhubung ke server">
              <Wifi className="h-4 w-4 text-green-200" />
            </div>
          ) : (
            <div title="Tidak terhubung ke server">
              <WifiOff className="h-4 w-4 text-red-300" />
            </div>
          )}
          <button 
            onClick={toggleViewMode}
            className="bg-green-700 px-2 py-1 rounded text-sm hover:bg-green-800"
          >
            {viewMode === 'chat' ? 'Mode WhatsApp Web' : 'Mode Chat Internal'}
          </button>
        </div>
      </div>

      {viewMode === 'chat' ? (
        <>
          {/* Customer Selection */}
          <div className="p-4 border-b">
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Pilih Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.phone}>
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
                className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.direction === 'outgoing'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            {file && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded">
                <Image className="h-4 w-4" />
                <span className="text-sm truncate">{file.name}</span>
                <button 
                  className="ml-auto text-red-500 text-xs"
                  onClick={() => setFile(null)}
                >
                  Hapus
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Attach file"
                onClick={handleAttachClick}
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
                disabled={!!file}
              />
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !file) || !selectedCustomer}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        // WhatsApp Web iframe
        <div className="flex-1 flex">
          <iframe
            ref={iframeRef}
            src="https://web.whatsapp.com"
            className="w-full h-full"
            title="WhatsApp Web"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      )}

      {socketError && (
        <div className="bg-red-100 text-red-700 p-2 text-sm rounded-md mb-2">
          Koneksi server WhatsApp tidak tersedia. Beberapa fitur mungkin tidak berfungsi.
        </div>
      )}
    </div>
  );
};

export default WhatsAppChat;
