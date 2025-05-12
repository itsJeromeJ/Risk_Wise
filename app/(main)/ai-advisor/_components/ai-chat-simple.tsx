'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send, User, RefreshCw, ArrowRight } from "lucide-react";

const AIChat = () => {
  const [prompt, setPrompt] = useState('');
  const [chat, setChat] = useState<{ sender: string; message: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  
  // Add a welcome message when the component mounts
  useEffect(() => {
    setChat([
      { 
        sender: 'AI', 
        message: 'Hello! I\'m your financial AI assistant. How can I help you today? You can ask me about budgeting, investments, saving strategies, or any other financial topics.' 
      }
    ]);
  }, []);

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const userMessage = prompt.trim();
    setPrompt('');
    setLoading(true);

    setChat((prev) => [...prev, { sender: 'You', message: userMessage }]);

    try {
      const res = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userMessage,
          userId: 'user123' // Using demo user ID - in a real app, this would come from authentication
        }),
      });

      const data = await res.json();

      setChat((prev) => [
        ...prev,
        { sender: 'AI', message: data.response || 'No response from AI.' },
      ]);
    } catch (error) {
      console.error(error);
      setChat((prev) => [
        ...prev,
        { sender: 'AI', message: 'Sorry, something went wrong.' },
      ]);
    }

    setLoading(false);
  };

  // Scroll to bottom on new chat message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chat]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
  <Card className="w-full max-w-4xl border-0 shadow-lg bg-white overflow-hidden">
    <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
      <CardTitle className="flex items-center gap-2 text-xl">
          <Bot className="h-6 w-6" />
          Financial AI Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="flex flex-col h-[550px]">
          {/* Chat Window */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          >
            {chat.map((entry, idx) => (
              <div
                key={idx}
                className={`flex ${entry.sender === 'You' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${
                    entry.sender === 'You' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`flex-shrink-0 rounded-full p-2 ${
                    entry.sender === 'You' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-blue-800'
                  }`}>
                    {entry.sender === 'You' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                      entry.sender === 'You'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white border rounded-tl-none'
                    }`}
                  >
                    <div 
                      className="text-sm whitespace-pre-wrap ai-message-content"
                      dangerouslySetInnerHTML={{ 
                        __html: entry.message
                          // Format code blocks
                          .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
                          // Format inline code
                          .replace(/`([^`]+)`/g, '<code>$1</code>')
                          // Format bold text
                          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                          // Format italic text
                          .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                          // Format bullet lists
                          .replace(/\n- /g, '<br />• ')
                          // Format numbered lists
                          .replace(/\n\d+\. /g, (match) => '<br />' + match.trim())
                          // Format headings
                          .replace(/\n#{3} ([^\n]+)/g, '<br /><h3 class="text-lg font-semibold mt-2 mb-1">$1</h3>')
                          .replace(/\n#{2} ([^\n]+)/g, '<br /><h2 class="text-xl font-semibold mt-3 mb-2">$1</h2>')
                          .replace(/\n# ([^\n]+)/g, '<br /><h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
                          // Format line breaks
                          .replace(/\n/g, '<br />')
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="flex-shrink-0 rounded-full p-2 bg-gray-200 text-blue-800">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl shadow-sm bg-white border rounded-tl-none">
                    <div className="text-sm text-gray-500">Thinking...</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-4 bg-white">
            <div className="flex items-center gap-2">
              <Input
                className="flex-1 border-2 rounded-full px-4 py-2 text-sm focus-visible:ring-blue-500"
                type="text"
                value={prompt}
                placeholder="Ask me about finance..."
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading}
                className="rounded-full p-2 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowRight className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="text-xs text-gray-400 mt-2 text-center">
              Ask questions about budgeting, investments, saving strategies, or any financial topics
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
  );
};

export default AIChat;
