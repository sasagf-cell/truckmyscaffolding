
import React from 'react';
import { format } from 'date-fns';
import { User, Bot } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        <div className="flex flex-col gap-1">
          <div 
            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm
              ${isUser 
                ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                : 'bg-muted text-foreground rounded-tl-sm border border-border/50'
              }`}
          >
            {message.content}
          </div>
          <span className={`text-[10px] text-muted-foreground px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp ? format(new Date(message.timestamp), 'HH:mm') : 'Just now'}
          </span>
        </div>

      </div>
    </div>
  );
};

export default ChatMessage;
