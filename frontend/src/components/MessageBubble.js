import React from 'react';
import { Calculator, User } from 'lucide-react';

const Avatar = ({ children, className = '' }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
);

const AvatarFallback = ({ children, className = '' }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}>
    {children}
  </div>
);

const MessageBubble = ({ message, isUser }) => {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatContent = (content) => {
    return content
      .split('\n')
      .map((line, index) => {
        const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <div key={index} className={index > 0 ? 'mt-2' : ''}>
            <span dangerouslySetInnerHTML={{ __html: boldFormatted }} />
          </div>
        );
      });
  };

  return (
    <div className={`flex items-start space-x-4 mb-6 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={`
          text-sm font-medium
          ${isUser 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
            : 'bg-zinc-800 text-zinc-300'
          }
        `}>
          {isUser ? <User className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Container */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`
          rounded-2xl px-4 py-3 
          ${isUser 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md' 
            : 'bg-zinc-800/80 text-zinc-100 rounded-bl-md'
          }
          shadow-lg backdrop-blur-sm
        `}>
          {/* Message Content */}
          <div className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-zinc-100'}`}>
            {formatContent(message.content)}
          </div>
          
          {/* Timestamp */}
          <div className={`
            text-xs mt-2 
            ${isUser ? 'text-blue-100' : 'text-zinc-400'}
          `}>
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;