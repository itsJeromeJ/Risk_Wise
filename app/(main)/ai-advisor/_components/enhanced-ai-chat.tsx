import React, { useState } from 'react';
import useFetch from '@/hooks/use-fetch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Define the fetch function to be used with the useFetch hook
const fetchAIResponseFn = async (data: { message: string }) => {
  const response = await fetch('/api/gemini-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch AI response');
  }
  
  return response.json();
};

const EnhancedAIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { fn: fetchAIResponse, loading } = useFetch(fetchAIResponseFn);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);

    setInput('');

    const response = await fetchAIResponse({ message: input });
    if (response) {
      const aiMessage = { sender: 'ai', text: response.response }; // Using response.response to match API format
      setMessages((prev) => [...prev, aiMessage]);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex-1 overflow-y-auto border rounded p-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded mb-2 ${msg.sender === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-200 text-left'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button onClick={handleSendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedAIChat;