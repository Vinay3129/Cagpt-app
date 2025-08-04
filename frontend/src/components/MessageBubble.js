import React, { useState } from 'react';
import { Calculator, User, ChevronDown, ChevronUp } from 'lucide-react';

const Avatar = ({ children, className = '' }) => (
  <div className={`relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
);

const AvatarFallback = ({ children, className = '' }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full ${className}`}>
    {children}
  </div>
);

const MessageBubble = ({ message, isUser }) => {
  const [showContext, setShowContext] = useState(false);

  const formatContent = (content) => {
    if (!content) return null;
    const boldFormatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <div dangerouslySetInnerHTML={{ __html: boldFormatted.replace(/\n/g, '<br />') }} />;
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar>
        <AvatarFallback className={`${isUser ? 'bg-accent text-white' : 'bg-primary text-text-primary'}`}>
          {isUser ? <User className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : ''}`}>
        <div className={`px-4 py-3 rounded-2xl ${isUser ? 'bg-accent text-white rounded-br-none' : 'bg-primary text-text-primary rounded-bl-none'}`}>
          <div className="text-sm leading-relaxed">
            {formatContent(message.content)}
          </div>
        </div>
        
        {!isUser && message.context && (
          <div className="mt-2 text-right w-full">
            <button onClick={() => setShowContext(!showContext)} className="flex items-center space-x-1 text-xs text-text-secondary hover:text-text-primary ml-auto">
              <span>{showContext ? 'Hide' : 'Show'} Context</span>
              {showContext ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showContext && (
              <div className="mt-2 p-3 bg-black/20 border border-border rounded-lg text-xs text-text-secondary max-h-40 overflow-y-auto custom-scrollbar text-left">
                <p className="font-semibold mb-2 text-text-primary">Context Sent to AI:</p>
                <pre className="whitespace-pre-wrap font-sans">{message.context}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;