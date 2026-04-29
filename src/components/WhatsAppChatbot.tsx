import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, User, Bot, Phone } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'agent';
  timestamp: Date;
}

export default function WhatsAppChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I am Craftifue's AI Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isAgentTransferred, setIsAgentTransferred] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Hide on admin routes
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard')) {
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI or Agent typing
    setTimeout(() => {
      setIsTyping(false);
      
      let botResponse = '';
      if (isAgentTransferred) {
        botResponse = 'Thanks for your patience. A live agent is reviewing your message and will reply shortly.';
      } else {
        const lowerInput = userMessage.text.toLowerCase();
        if (lowerInput.includes('human') || lowerInput.includes('agent') || lowerInput.includes('expert')) {
          handleTransferToAgent();
          return;
        } else if (lowerInput.includes('order')) {
          botResponse = 'I can help with your order! Please provide your order number.';
        } else if (lowerInput.includes('return') || lowerInput.includes('refund')) {
          botResponse = 'Our return policy allows returns within 30 days. Would you like to start a return or speak to an agent?';
        } else {
          botResponse = "I'm a virtual assistant focused on order queries and simple support. If your issue is complex, you can ask to speak to a human.";
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: isAgentTransferred ? 'agent' : 'bot',
        timestamp: new Date()
      }]);
    }, 1500);
  };

  const handleTransferToAgent = () => {
    setIsAgentTransferred(true);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: 'Transferring you to a live support agent...',
      sender: 'bot',
      timestamp: new Date()
    }]);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Hi, I'm Sarah from customer support. I have your chat history. How can I assist you further today?",
        sender: 'agent',
        timestamp: new Date()
      }]);
    }, 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col pointer-events-auto"
            style={{ height: '500px' }}
          >
            {/* Header */}
            <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    {isAgentTransferred ? (
                      <User className="w-6 h-6 text-[#075E54]" />
                    ) : (
                      <Bot className="w-6 h-6 text-[#075E54]" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#075E54] rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {isAgentTransferred ? 'Sarah (Live Agent)' : 'Craftifue AI Support'}
                  </h3>
                  <p className="text-xs text-[#DCF8C6]">
                    {isAgentTransferred ? 'Online' : 'Typically replies instantly'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area - WhatsApp Background */}
            <div 
              className="flex-grow p-4 overflow-y-auto flex flex-col space-y-3"
              style={{ backgroundColor: '#ECE5DD', backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}
            >
              <div className="text-center text-xs text-gray-500 mb-4 bg-[#E1F3FB] p-2 rounded-lg inline-block self-center drop-shadow-sm">
                Chat securely verified. {isAgentTransferred ? 'Connected to live agent.' : 'Powered by AI.'}
              </div>

              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-2xl px-4 py-2 relative shadow-sm ${
                        isUser 
                          ? 'bg-[#DCF8C6] rounded-tr-sm text-gray-800' 
                          : 'bg-white rounded-tl-sm text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <span className="text-[10px] text-gray-500 block text-right mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex space-x-1 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* AI to Human Transfer Prompt */}
            {!isAgentTransferred && isOpen && messages.length > 2 && (
              <div className="bg-orange-50 px-4 py-2 border-t border-orange-100 flex items-center justify-between">
                <span className="text-xs text-orange-800">Need more help?</span>
                <button 
                  onClick={handleTransferToAgent}
                  className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-bold hover:bg-orange-200 transition-colors"
                >
                  Talk to human
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="bg-[#F0F0F0] p-3 flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-grow px-4 py-2 bg-white rounded-full focus:outline-none border-none text-sm shadow-sm"
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-10 h-10 bg-[#075E54] rounded-full flex items-center justify-center text-white shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#128C7E] transition-colors shadow-sm"
              >
                <Send className="w-4 h-4 ml-1" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-end pointer-events-auto"
          >
            {/* Tooltip bubble */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className="mb-3 relative bg-white text-gray-700 px-4 py-2 rounded-2xl shadow-lg border border-gray-100 mr-2"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-[#075E54]">AI Help & Support</span>
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-100" />
            </motion.div>

            <motion.button
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl relative"
            >
              <MessageCircle className="w-8 h-8" />
              {/* Notification Badge */}
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold">1</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
