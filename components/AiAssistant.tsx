
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Contract, Language } from '../types';
import { t } from '../translations';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';

interface Props {
  contracts: Contract[];
  lang: Language;
}

export const AiAssistant: React.FC<Props> = ({ contracts, lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: 'Hello! I am your SaudaBook Assistant. How can I help you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = JSON.stringify(contracts.map(c => ({
        broker: c.brokerName,
        date: c.date,
        time: c.time,
        items: c.items.map(i => ({
          product: i.productName,
          rate: i.rate,
          total: i.totalQuantity,
          received: i.receivedQuantity,
          pending: i.totalQuantity - i.receivedQuantity
        }))
      })));

      const prompt = `You are a helpful business assistant for an edible oil trading company called Sanjay Soya, powered by the SaudaBook application. 
      The current inventory and contract data is: ${context}. 
      Answer the user's question clearly and professionally based ONLY on this data. If the data is not available, provide a helpful general response about inventory tracking. 
      Current language preference: ${lang}. 
      User Question: ${userText}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to AI service. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-transform z-40"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[90vw] md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200 overflow-hidden">
      <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <span className="font-bold">{t('aiAssistant', lang)}</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={20}/></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl flex gap-2 ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-800 shadow-sm'}`}>
              <div className="mt-1 shrink-0 opacity-70">
                {m.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
              </div>
              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && <div className="flex items-center gap-2 text-xs text-slate-400 animate-pulse bg-white p-2 rounded-lg border border-slate-100 w-fit">
          <Bot size={12}/> Assistant is thinking...
        </div>}
      </div>

      <div className="p-4 border-t border-slate-200 flex gap-2 bg-white">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Ask about your stock..."
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${!input.trim() || loading ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:scale-105 active:scale-95'}`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};