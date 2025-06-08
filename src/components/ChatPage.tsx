import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { Plus, History, Trash2, X, Download, Share2, Search } from 'lucide-react';
import { AIConfig, AIProvider, Customer, ServiceTicket, Technician } from '../types';

interface CustomForm {
  deviceType: string;
  deviceBrand: string;
  issue: string;
  cause: string;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: { text: string; sender: 'user' | 'ai' }[];
  timestamp: string;
  aiProvider: AIProvider;
}

const deviceBrands = ['Samsung', 'Xiaomi', 'iPhone', 'OPPO', 'Vivo', 'Realme', 'Lainnya'];

const aiProviders: AIConfig[] = [
  {
    name: 'Qwen AI',
    id: 'qwen',
    available: true,
    apiKey: import.meta.env.VITE_QWEN_API_KEY,
    endpoint: import.meta.env.VITE_QWEN_API_ENDPOINT
  },
  { 
    name: 'ChatGPT-4o', 
    id: 'chatgpt', 
    available: true,
    apiKey: import.meta.env.VITE_CHATGPT_API_KEY,
    endpoint: import.meta.env.VITE_CHATGPT_API_ENDPOINT
  },
  { name: 'DeepSeak', id: 'deepseak', available: false },
  { name: 'Claude', id: 'claude', available: false }
];

const contextTags = [
  { key: 'inventory', label: 'Inventory', storageKey: 'inventory', keywords: ['inventory', 'stok', 'stock', 'barang', 'sparepart'] },
  { key: 'customer', label: 'Customer', storageKey: 'customers', keywords: ['customer', 'pelanggan', 'data customer', 'data pelanggan'] },
  { key: 'serviceTicket', label: 'Service Ticket', storageKey: 'tickets', keywords: ['ticket', 'tiket', 'service', 'servis', 'perbaikan', 'data ticket', 'data servis','service tiket'] },
  { key: 'dashboard', label: 'Dashboard', storageKey: 'dashboardData', keywords: ['dashboard', 'ringkasan', 'summary', 'statistik', 'statistik servis'] },
];

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAI, setSelectedAI] = useState<AIProvider>('qwen');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState<CustomForm>({
    deviceType: '',
    deviceBrand: '',
    issue: '',
    cause: ''
  });
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);

  // Load chat history when component mounts
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      setChatHistory(parsedHistory);
      // Ambil history terakhir (paling atas)
      if (parsedHistory.length > 0) {
        setMessages(parsedHistory[0].messages);
        setSelectedAI(parsedHistory[0].aiProvider);
      }
    }
  }, []);

  useEffect(() => {
    console.log('Chat History Updated:', chatHistory);
  }, [chatHistory]);

  useEffect(() => {
    console.log('Messages Updated:', messages);
  }, [messages]);

  useEffect(() => {
    console.log('Chat History State:', chatHistory);
  }, [chatHistory]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    console.log('LocalStorage Content:', savedHistory);
  }, []);

  // Tambahkan useEffect untuk menangani perubahan AI provider
  useEffect(() => {
    const saveCurrentChat = () => {
      if (messages.length > 0) {
        setChatHistory(prevHistory => {
          // Cari riwayat chat yang sedang aktif
          const activeHistory = prevHistory.find(history => 
            history.messages[0]?.text === messages[0]?.text &&
            history.aiProvider === selectedAI
          );

          let updatedHistory = [...prevHistory];
          
          if (activeHistory) {
            // Update riwayat yang sedang aktif
            updatedHistory = prevHistory.map(history => 
              history.id === activeHistory.id
                ? { 
                    ...history, 
                    messages: [...messages], 
                    timestamp: new Date().toISOString(),
                    aiProvider: selectedAI
                  }
                : history
            );
          } else {
            // Buat riwayat baru jika tidak ditemukan
            const newHistory: ChatHistory = {
              id: crypto.randomUUID(),
              title: `${selectedAI.toUpperCase()}: ${messages[0].text.slice(0, 30)}...`,
              messages: [...messages],
              timestamp: new Date().toISOString(),
              aiProvider: selectedAI
            };
            updatedHistory = [newHistory, ...prevHistory];
          }

          // Simpan ke localStorage
          localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
          console.log('Auto Saved History:', updatedHistory);
          return updatedHistory;
        });
      }
    };

    // Jalankan fungsi saveCurrentChat saat AI provider berubah
    return () => {
      saveCurrentChat();
    };
  }, [selectedAI, messages]);

  const handleNewChat = () => {
    // Simpan chat saat ini ke history jika ada pesan
    if (messages.length > 0) {
      const newHistory: ChatHistory = {
        id: crypto.randomUUID(),
        title: messages[0].text.slice(0, 30) + '...', // Menggunakan pesan pertama sebagai judul
        messages: [...messages],
        timestamp: new Date().toISOString(),
        aiProvider: selectedAI
      };

      const updatedHistory = [newHistory, ...chatHistory];
      setChatHistory(updatedHistory);
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    }

    // Reset chat saat ini
    setMessages([]);
    setInput('');
  };

  const loadChatFromHistory = (historyItem: ChatHistory) => {
    // Cek apakah riwayat yang akan dimuat sudah aktif
    if (messages.length > 0 && historyItem.messages[0]?.text === messages[0]?.text && 
        historyItem.aiProvider === selectedAI) {
      return;
    }

    // Simpan percakapan saat ini ke riwayat jika ada pesan
    if (messages.length > 0) {
      setChatHistory(prevHistory => {
        // Cari riwayat chat yang sedang aktif
        const activeHistory = prevHistory.find(history => 
          history.messages[0]?.text === messages[0]?.text &&
          history.aiProvider === selectedAI
        );

        let updatedHistory = [...prevHistory];
        
        if (activeHistory) {
          // Update riwayat yang sedang aktif
          updatedHistory = prevHistory.map(history => 
            history.id === activeHistory.id
              ? { 
                  ...history, 
                  messages: [...messages], 
                  timestamp: new Date().toISOString(),
                  aiProvider: selectedAI
                }
              : history
          );
        } else {
          // Buat riwayat baru jika tidak ditemukan
          const newHistory: ChatHistory = {
            id: crypto.randomUUID(),
            title: `${selectedAI.toUpperCase()}: ${messages[0].text.slice(0, 30)}...`,
            messages: [...messages],
            timestamp: new Date().toISOString(),
            aiProvider: selectedAI
          };
          updatedHistory = [newHistory, ...prevHistory];
        }

        // Simpan ke localStorage
        localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
        console.log('Saved History:', updatedHistory);
        return updatedHistory;
      });
    }

    // Set AI provider sesuai riwayat yang dipilih
    setSelectedAI(historyItem.aiProvider);
    
    // Muat pesan dari riwayat yang dipilih
    setMessages(historyItem.messages);
    
    // Update timestamp riwayat chat yang dimuat
    setChatHistory(prevHistory => {
      const updatedHistory = prevHistory.map(history => 
        history.id === historyItem.id
          ? { 
              ...history, 
              timestamp: new Date().toISOString(),
              aiProvider: historyItem.aiProvider
            }
          : history
      );
      
      // Simpan ke localStorage
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
      console.log('Loaded History:', updatedHistory);
      return updatedHistory;
    });
  };

  const handleCustomFormSubmit = () => {
    const prompt = `
      Device Type: ${customForm.deviceType}
      Brand: ${customForm.deviceBrand}
      Issue: ${customForm.issue}
      Cause: ${customForm.cause}
      
      Berdasarkan informasi di atas, mohon berikan:
      1. Analisis awal kerusakan
      2. Estimasi biaya perbaikan
      3. Estimasi waktu perbaikan
      4. Rekomendasi penanganan
    `;
    
    setInput(prompt);
    setShowCustomForm(false);
    handleSend(prompt);
  };

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend) return;

    setIsLoading(true);
    const userMessage = { text: textToSend, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    
    const aiResponse = await fetchAIResponse(textToSend);
    
    const aiMessage = { 
      text: typeof aiResponse === 'string' ? aiResponse : "Maaf, terjadi kesalahan", 
      sender: 'ai' as const 
    };
    
    const updatedMessages = [...messages, userMessage, aiMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(false);
  };

  const fetchAIResponse = async (userInput: string): Promise<string> => {
    try {
      // Cek context berdasarkan tag
      let contextToUse: typeof contextTags[number] | null = null;
      if (selectedContext) {
        contextToUse = contextTags.find(tag => tag.key === selectedContext) || null;
      } else {
        // Jika tidak ada tag, cek berdasarkan keywords
        contextToUse = contextTags.find(tag =>
          tag.keywords.some(keyword => userInput.toLowerCase().includes(keyword))
        ) || null;
      }
      let modifiedUserInput = userInput;
      if (contextToUse) {
        const data = localStorage.getItem(contextToUse.storageKey);
        if (data) {
          // Jika konteks adalah service ticket, tambahkan informasi nama pelanggan
          if (contextToUse.key === 'serviceTicket') {
            const tickets = JSON.parse(data);
            const customers = localStorage.getItem('customers') ? JSON.parse(localStorage.getItem('customers') || '[]') : [];
            const technicians = localStorage.getItem('technicians') ? JSON.parse(localStorage.getItem('technicians') || '[]') : [];
            
            // Tambahkan informasi nama pelanggan dan teknisi ke setiap ticket
            const enrichedTickets = tickets.map((ticket: ServiceTicket) => {
              const customer = customers.find((c: Customer) => c.id === ticket.customerId);
              const technician = technicians.find((t: Technician) => t.id === ticket.technicianId);
              return {
                ...ticket,
                customerName: customer ? customer.name : 'Unknown Customer',
                customerPhone: customer ? customer.phone : 'No Phone',
                technicianName: technician ? technician.name : 'Belum Ditugaskan'
              };
            });
            
            modifiedUserInput = `${userInput}\n\nData ${contextToUse.label} (format JSON):\n${JSON.stringify(enrichedTickets)}`;
          } else if (contextToUse.key === 'customer') {
            // Untuk konteks customer, pastikan data sudah dalam format yang benar
            const customers = JSON.parse(data);
            modifiedUserInput = `${userInput}\n\nData ${contextToUse.label} (format JSON):\n${JSON.stringify(customers)}`;
          } else if (contextToUse.key === 'dashboard') {
            // Untuk konteks dashboard, tambahkan informasi tambahan jika diperlukan
            const dashboardData = JSON.parse(data);
            
            // Jika ada data tiket dan pelanggan, tambahkan informasi lengkap
            const customers = localStorage.getItem('customers') ? JSON.parse(localStorage.getItem('customers') || '[]') : [];
            const tickets = localStorage.getItem('tickets') ? JSON.parse(localStorage.getItem('tickets') || '[]') : [];
            
            // Tambahkan data tambahan ke dashboard jika diperlukan
            const enrichedDashboard = {
              ...dashboardData,
              customerCount: customers.length,
              ticketCount: tickets.length,
              // Tambahkan data lain yang mungkin berguna
            };
            
            modifiedUserInput = `${userInput}\n\nData ${contextToUse.label} (format JSON):\n${JSON.stringify(enrichedDashboard)}`;
          } else if (contextToUse.key === 'inventory') {
            // Untuk konteks inventory, pastikan data sudah dalam format yang benar
            const inventory = JSON.parse(data);
            modifiedUserInput = `${userInput}\n\nData ${contextToUse.label} (format JSON):\n${JSON.stringify(inventory)}`;
          } else {
          modifiedUserInput = `${userInput}\n\nData ${contextToUse.label} (format JSON):\n${data}`;
          }
        } else {
          modifiedUserInput = `${userInput}\n\nData ${contextToUse.label} tidak ditemukan di sistem.`;
        }
      }

      const selectedProvider = aiProviders.find(p => p.id === selectedAI);
      console.log('Selected Provider:', selectedProvider);

      if (!selectedProvider) {
        console.error('AI provider tidak ditemukan untuk ID:', selectedAI);
        return "Maaf, AI provider tidak ditemukan.";
      }

      if (!selectedProvider.available) {
        return "Maaf, AI provider ini belum tersedia";
      }

      if (!selectedProvider.endpoint) {
        console.error('Endpoint tidak terdefinisi untuk provider:', selectedProvider);
        return "Maaf, endpoint AI provider tidak terdefinisi.";
      }

      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      conversationHistory.push({
        role: 'user',
        content: modifiedUserInput
      });

      const response = await fetch(selectedProvider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${selectedProvider.apiKey}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'PhoneRepair CRM'
        },
        body: JSON.stringify({
          model: selectedAI === 'chatgpt' ? 'openai/chatgpt-4o-latest' : 'qwen/qwen2.5-vl-72b-instruct:free',
          messages: conversationHistory,
          max_tokens: 1000,
          temperature: 0.7
        }),
      });

      // Tambahkan logging untuk debugging
      console.log('API Response:', response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        return `API Error: ${response.status} - ${errorText}`; // Mengembalikan pesan kesalahan
      }

      const data = await response.json();
      console.log('API Data:', data);

      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response structure from AI');
      }
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.";
    }
  };

  const deleteChatHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah trigger loadChatFromHistory
    const updatedHistory = chatHistory.filter(history => history.id !== id);
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
  };

  const clearAllHistory = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua riwayat chat?')) {
      setChatHistory([]);
      localStorage.removeItem('chatHistory');
    }
  };

  // Filter chat history berdasarkan pencarian
  const filteredHistory = chatHistory.filter(history =>
    history.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export chat history ke file JSON
  const exportChatHistory = () => {
    const dataStr = JSON.stringify(chatHistory, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `chat-history-${new Date().toISOString()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Copy chat ke clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Fungsi untuk handle switch AI provider
  const handleSwitchAI = (aiId: AIProvider) => {
    // Cek apakah ada percakapan yang sedang berlangsung
    if (messages.length > 0) {
      // Cari apakah percakapan ini sudah ada di riwayat
      const existingHistory = chatHistory.find(history => 
        history.messages[0]?.text === messages[0]?.text
      );

      if (existingHistory) {
        // Update riwayat yang sudah ada
        const updatedHistory = chatHistory.map(history => 
          history.id === existingHistory.id
            ? { ...history, messages: [...messages], timestamp: new Date().toISOString() }
            : history
        );
        setChatHistory(updatedHistory);
        localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
      } else {
        // Buat riwayat baru jika belum ada
        const newHistory: ChatHistory = {
          id: crypto.randomUUID(),
          title: messages[0].text.slice(0, 30) + '...',
          messages: [...messages],
          timestamp: new Date().toISOString(),
          aiProvider: selectedAI
        };
        const updatedHistory = [newHistory, ...chatHistory];
        setChatHistory(updatedHistory);
        localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
      }
    }

    // Reset percakapan saat ini
    setMessages([]);
    setInput('');

    // Pindah ke AI yang dipilih
    setSelectedAI(aiId);
  };

  console.log('ChatGPT Config:', {
    key: import.meta.env.VITE_CHATGPT_API_KEY,
    endpoint: import.meta.env.VITE_CHATGPT_API_ENDPOINT
  });

  console.log('LocalStorage:', localStorage.getItem('chatHistory'));

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 flex flex-col">
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          New Chat
        </button>

        {/* Search bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Cari riwayat chat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-8 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <History size={20} />
              <span className="font-medium">Riwayat Chat</span>
            </div>
            <div className="flex gap-1">
              {chatHistory.length > 0 && (
                <>
                  <button
                    onClick={exportChatHistory}
                    className="text-gray-600 hover:text-gray-800 p-1 rounded"
                    title="Export riwayat chat"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={clearAllHistory}
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                    title="Hapus semua riwayat"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Chat history list */}
          <div className="space-y-2">
            {filteredHistory.map((history) => (
              <div
                key={history.id}
                className="group relative bg-white rounded-lg hover:bg-gray-50"
              >
                <button
                  onClick={() => loadChatFromHistory(history)}
                  className="w-full text-left p-2"
                >
                  <div className="font-medium truncate pr-6">{history.title}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(history.timestamp).toLocaleDateString()}
                  </div>
                </button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(history.messages.map(m => `${m.sender}: ${m.text}`).join('\n'));
                    }}
                    className="text-gray-400 hover:text-blue-600 p-1 rounded"
                    title="Copy chat"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    onClick={(e) => deleteChatHistory(history.id, e)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded"
                    title="Hapus chat ini"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {filteredHistory.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4">
                {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada riwayat chat'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification for copied text */}
      {isCopied && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
          Teks berhasil disalin!
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* AI Provider Selection */}
        <div className="bg-white border-b p-4">
          <div className="flex gap-2 mb-2">
            {aiProviders.map(provider => (
              <button
                key={provider.id}
                onClick={() => handleSwitchAI(provider.id)}
                className={`px-4 py-2 rounded-lg ${
                  selectedAI === provider.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700'
                } ${!provider.available && 'opacity-50 cursor-not-allowed'}`}
                disabled={!provider.available}
              >
                {provider.name}
                {!provider.available && ' (Soon)'}
              </button>
            ))}
          </div>
          {/* Context Tag Selection */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">Konteks:</span>
            {contextTags.map(tag => (
              <button
                key={tag.key}
                onClick={() => setSelectedContext(selectedContext === tag.key ? null : tag.key)}
                className={`px-3 py-1 rounded-full border text-xs ${
                  selectedContext === tag.key ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {tag.label}
              </button>
            ))}
            {selectedContext && (
              <button
                onClick={() => setSelectedContext(null)}
                className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded-full text-gray-700"
              >
                Hapus Tag
              </button>
            )}
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {isLoading && <LoadingSpinner />}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-2xl font-bold mb-6">Chat with AI</h1>
              
              <div className="space-y-4 h-[500px] overflow-y-auto mb-6">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start gap-2 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        AI
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-1 max-w-[80%]">
                      <div className={`text-xs font-medium ${
                        msg.sender === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {msg.sender === 'user' ? 'Anda' : 'AI Assistant'}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        msg.sender === 'user' 
                          ? 'bg-green-100 text-green-900' 
                          : 'bg-blue-100 text-blue-900'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <div className={`text-xs mt-1 ${
                          msg.sender === 'user' ? 'text-green-700' : 'text-blue-700'
                        }`}>
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
                        U
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="max-w-5xl mx-auto">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowCustomForm(!showCustomForm)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Form CSO
              </button>
            </div>

            {showCustomForm ? (
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Device Type</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={customForm.deviceType}
                      onChange={e => setCustomForm({...customForm, deviceType: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Brand</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={customForm.deviceBrand}
                      onChange={e => setCustomForm({...customForm, deviceBrand: e.target.value})}
                    >
                      <option value="">Pilih Brand</option>
                      {deviceBrands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Issue</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={customForm.issue}
                      onChange={e => setCustomForm({...customForm, issue: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Cause</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={customForm.cause}
                      onChange={e => setCustomForm({...customForm, cause: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setShowCustomForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomFormSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Submit
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 p-2 border rounded-lg"
                  placeholder="Type your message..."
                />
                <button
                  onClick={() => handleSend()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
