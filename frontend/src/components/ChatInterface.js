import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import axios from 'axios';
import { Send, Loader2, Calculator, Plus, Mic } from 'lucide-react';

const Textarea = React.forwardRef(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={`flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
));

const ChatInterface = ({ currentChatId, setCurrentChatId, selectedSubject, onNewChatCreated }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChatId) {
        setMessages([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await axios.get(`http://127.0.0.1:8000/chats/${currentChatId}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [currentChatId]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMessageContent = inputValue.trim();
    const isNewChat = !currentChatId;
    const optimisticUserMessage = {
      id: Date.now(), role: 'user', content: userMessageContent, timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticUserMessage]);
    setInputValue('');
    setIsLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/ask/', {
        q: userMessageContent, chat_id: currentChatId, subject: selectedSubject
      });
      const newChatId = response.data.chat_id;
      if (isNewChat) {
        onNewChatCreated(newChatId);
      } else {
        const messagesResponse = await axios.get(`http://127.0.0.1:8000/chats/${currentChatId}/messages`);
        setMessages(messagesResponse.data);
      }
    } catch (error) {
      console.error('Error getting bot response:', error);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-background">
      <div className="flex items-center p-4 h-[65px] shrink-0">
        <h2 className="text-lg font-semibold text-text-primary">CAgpt</h2>
      </div>

      <div className="flex-1 flex flex-col items-center overflow-y-auto">
        <div className="w-full max-w-4xl p-6 flex-1 custom-scrollbar">
            <div className="space-y-6">
            {messages.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calculator className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">CA Study Assistant</h3>
                    <p className="text-text-secondary mb-6 max-w-md">
                        Start a conversation by typing below, or use the sidebar to see past chats.
                    </p>
                </div>
            ) : (
                messages.map((message) => (
                <MessageBubble
                    key={message.id}
                    message={message}
                    isUser={message.role === 'user'}
                />
                ))
            )}
            {isLoading && (
                <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Calculator className="w-4 h-4 text-text-primary animate-pulse" />
                </div>
                <div className="p-3 rounded-2xl bg-primary rounded-bl-none">
                    <div className="text-sm text-text-primary">Thinking...</div>
                </div>
                </div>
            )}
            <div ref={messagesEndRef} />
            </div>
        </div>
        
        <div className="w-full max-w-4xl p-4 shrink-0">
            <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-end p-2 space-x-2 bg-primary border border-border rounded-2xl"
            >
                {/* --- THIS IS THE UPDATED SECTION --- */}
                <button
                    type="button"
                    title="Attach file"
                    className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-full shrink-0"
                >
                    <Plus className="w-4 h-4" />
                </button>
                <Textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything..."
                    className="flex-1 w-full text-text-primary placeholder:text-text-secondary resize-none min-h-[24px] max-h-40 bg-transparent border-none focus:outline-none focus:ring-0"
                    rows={1}
                />
                <button
                    type="button"
                    title="Use voice"
                    className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-full shrink-0"
                >
                    <Mic className="w-4 h-4" />
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="inline-flex items-center justify-center w-8 h-8 text-white transition-colors rounded-full bg-accent hover:opacity-90 disabled:bg-zinc-600 disabled:cursor-not-allowed shrink-0"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
            <p className="text-xs text-text-secondary mt-2 text-center">
                CAgpt can make mistakes. Consider checking important information.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;