
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Loader2 } from 'lucide-react';
import { BusinessData, ChatMessage } from '../types';
import { askGemini } from '../services/geminiService';

interface ChatSidebarProps {
  businessData: BusinessData;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ businessData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hello! I'm your Gemini Business Consultant. I've analyzed your data and noticed some interesting trends. How can I help you grow your business today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await askGemini(userMessage, businessData);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an issue processing that. Could you try rephrasing or asking something else about your revenue or customers?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white">Gemini Advisor</h3>
          <p className="text-xs text-green-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Online & Ready
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center 
                ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-blue-400" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-slate-800 border border-slate-700">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl text-sm bg-slate-800 text-slate-400 border border-slate-700 italic">
                Analyzing data...
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="relative">
          <textarea 
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about growth, trends, or strategy..."
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none placeholder:text-slate-500"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 top-2 p-2 rounded-lg transition-all
              ${!input.trim() || isLoading ? 'text-slate-600' : 'text-blue-500 hover:bg-blue-500/10'}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="mt-3 text-[10px] text-center text-slate-600 uppercase tracking-widest font-bold">Powered by Google Gemini</p>
      </div>
    </div>
  );
};

export default ChatSidebar;
