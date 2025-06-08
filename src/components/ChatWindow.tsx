import React, { useState } from 'react';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input) return;

    // Tambahkan pesan pengguna ke daftar pesan
    setMessages([...messages, { text: input, sender: 'user' }]);
    
    // Kirim pesan ke AI dan dapatkan respons
    const response = await fetchAIResponse(input);
    
    // Tambahkan respons AI ke daftar pesan
    setMessages(prevMessages => [...prevMessages, { text: response, sender: 'ai' }]);
    
    // Reset input
    setInput('');
  };

  const fetchAIResponse = async (userInput: string) => {
    try {
      console.log("Sending to AI:", userInput);
      
      const response = await fetch(import.meta.env.VITE_QWEN_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_QWEN_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5173', // Wajib untuk OpenRouter
          'X-Title': 'PhoneRepair CRM' // Opsional
        },
        body: JSON.stringify({
          model: "qwen/qwen2.5-vl-72b-instruct:free", // Ganti dengan model yang diinginkan
          messages: [
            {
              role: "user",
              content: userInput
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log("AI Response:", data);
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.";
    }
  };
  return (
    <div style={styles.chatWindow as React.CSSProperties}>
      <div style={styles.messages as React.CSSProperties}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', 
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: msg.sender === 'user' ? '#4CAF50' : '#2196F3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px'
              }}>
                {msg.sender === 'user' ? 'U' : 'AI'}
              </div>
              <div style={{
                padding: '8px',
                borderRadius: '10px',
                maxWidth: '70%',
                backgroundColor: msg.sender === 'user' ? '#E8F5E9' : '#E3F2FD',
                color: msg.sender === 'user' ? '#2E7D32' : '#1565C0',
                animation: 'fadeIn 0.3s ease-in-out'
              }}>
                {msg.text}
                <div style={{
                  fontSize: '0.75rem',
                  color: msg.sender === 'user' ? '#2E7D32' : '#1565C0',
                  marginTop: '4px',
                  textAlign: msg.sender === 'user' ? 'right' : 'left'
                }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={styles.input}
        />
        <button onClick={handleSend} style={styles.sendButton}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles = {
  chatWindow: {
    position: 'fixed',
    bottom: '0',
    right: '0',
    width: '300px',
    height: '400px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
  },
  messages: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '10px',
  },
  userMessage: {
    textAlign: 'right',
    marginBottom: '10px',
  },
  aiMessage: {
    textAlign: 'left',
    marginBottom: '10px',
  },
  messageText: {
    display: 'inline-block',
    padding: '8px',
    borderRadius: '10px',
    maxWidth: '70%',
    '@keyframes fadeIn': {
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: 1, transform: 'translateY(0)' }
    }
  },
  inputArea: {
    display: 'flex',
  },
  input: {
    flexGrow: 1,
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '8px',
    marginRight: '5px',
  },
  sendButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
  },
};

export default ChatWindow;
