'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { useAtmosStore } from '@/lib/store/useAtmosStore';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  city: string;
  weatherContext: any;
}

export default function AIAssistantPanel({ isOpen, onClose, city, weatherContext }: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Initialize chat when panel is opened for a specific city
  useEffect(() => {
    if (isOpen && city) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `Hi there! I am Atmos, your personal AI Weather assistant. Ask me anything about conditions or planning activities in ${city}!`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, city]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput('');
    setIsSending(true);

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      try {
        const settings = useAtmosStore.getState().settings;
        if (settings.geminiApiKey) {
          headers['x-gemini-api-key'] = settings.geminiApiKey;
        }
      } catch (err) {
        console.error('Failed to append custom Gemini key header:', err);
      }

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          city,
          weather_context: weatherContext,
          message: userText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch AI reply');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date(),
        },
      ]);
    } catch (err: unknown) {
      console.warn('[Atmos AI Panel] fetch failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'assistant',
          text: `I'm sorry, I ran into an issue communicating with the assistant services. Please try again in a minute!`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Chat Side Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-24 right-24 z-50 w-full md:w-[450px] max-h-[60vh] bg-slate-950/90 border-l border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col rounded-xl overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-tr from-cyan-400 to-indigo-500 rounded-xl shadow-lg shadow-cyan-500/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                    Atmos AI Assistant
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  </h2>
                  <span className="text-[10px] text-white/50 font-medium">Context: {city} Weather</span>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-colors active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Stream Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isAssistant = msg.sender === 'assistant';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className={`flex gap-3 w-full ${isAssistant ? 'justify-start' : 'justify-end'}`}
                    >
                      {isAssistant && (
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10 shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed border select-text ${
                          isAssistant
                            ? 'bg-white/5 border-white/10 text-white rounded-tl-sm'
                            : 'bg-gradient-to-tr from-cyan-500 to-blue-500 border-cyan-400/20 text-white rounded-tr-sm shadow-lg shadow-cyan-500/10'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {!isAssistant && (
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/15 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Animated Typing Indicator dots */}
                {isSending && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10 shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white/5 border border-white/10 px-4 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-white/30 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2.5 h-2.5 bg-white/30 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2.5 h-2.5 bg-white/30 rounded-full animate-bounce" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Message Form */}
            <form onSubmit={handleSend} className="p-6 border-t border-white/10 bg-slate-950 flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask about clothing/outdoor plans in ${city}...`}
                disabled={isSending}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/40 focus:border-white/20 focus:bg-white/10 outline-none backdrop-blur-md transition-all duration-300 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="flex items-center justify-center w-11 h-11 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/20 active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:scale-100 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
