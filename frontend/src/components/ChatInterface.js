// frontend/src/components/ChatInterface.js
import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import axios from 'axios';
import { Send, Loader2, Menu } from 'lucide-react';

const Button = ({ children, className = '', onClick, variant = 'default', size = 'default', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  };
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    icon: 'h-10 w-10'
  };
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Textarea = React.forwardRef(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
));


const ChatInterface = ({ onToggleSidebar, currentChatId }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.get('http://127.0.0.1:8000/ask/', {
        params: { q: userMessage.content }
      });
      
      const botResponse = {
        id: Date.now().toString() + "-bot",
        type: 'bot',
        content: response.data.response || "Sorry, I couldn't get a response.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage = {
        id: Date.now().toString() + "-error",
        type: 'bot',
        content: 'Sorry, I encountered an error connecting to the AI. Please make sure the backend server is running.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      textareaRef.current.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between p-4 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl z-10">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="lg:hidden text-zinc-400 hover:text-white" >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-white">CA Study Chat</h2>
            <p className="text-sm text-zinc-400">Ask anything about CA syllabus</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 z-10 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">CA</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Welcome to CAgpt</h3>
              <p className="text-zinc-400 mb-6 max-w-md">
                Your intelligent CA study companion. Ask questions about taxation, accounting, audit, law, and more.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
                {[
                  'Explain Section 44AD provisions',
                  'What is depreciation under Companies Act?',
                  'GST return filing due dates',
                  'Audit standards under SA 700'
                ].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => setInputValue(suggestion)}
                    className="text-left justify-start border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 rounded-lg p-3 h-auto"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.type === 'user'}
              />
            ))}
            {isLoading && (
              <div className="flex items-start space-x-4 mb-6">
                  <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-zinc-300">CA</span>
                </div>
                <div className="bg-zinc-800/80 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                    <span className="text-sm text-zinc-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="p-4 border-t border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about CA syllabus..."
                className="min-h-[48px] max-h-[120px] resize-none bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                disabled={isLoading}
              />
              {inputValue.trim() && !isLoading && (
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg flex items-center justify-center"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-2 text-center">
            CAgpt can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;