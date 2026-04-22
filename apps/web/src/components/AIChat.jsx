
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useChatConversations } from '@/hooks/useChatConversations.js';
import apiServerClient from '@/lib/apiServerClient.js';
import ChatMessage from '@/components/ChatMessage.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const AIChat = ({ projectId }) => {
  const { currentUser } = useAuth();
  const { fetchConversationHistory, createConversation, saveMessage } = useChatConversations(projectId, currentUser?.id);
  const { toast } = useToast();
  
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "What are my active alerts?",
    "Summarize recent scaffold requests.",
    "Were there any material deliveries today?"
  ]);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    const initChat = async () => {
      if (!projectId || !currentUser) return;
      
      const existingConv = await fetchConversationHistory();
      if (existingConv) {
        setConversation(existingConv);
        setMessages(existingConv.messages || []);
      } else {
        // Create new conversation with initial greeting
        const initialMsg = {
          role: 'assistant',
          content: 'Hello! I am your AI project assistant. I can help you analyze scaffold requests, site diaries, material deliveries, and active alerts. How can I help you today?',
          timestamp: new Date().toISOString()
        };
        const newConv = await createConversation([initialMsg]);
        if (newConv) {
          setConversation(newConv);
          setMessages([initialMsg]);
        }
      }
    };
    
    initChat();
  }, [projectId, currentUser, fetchConversationHistory, createConversation]);

  useEffect(() => {
    // Smooth scroll to bottom on new message
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    const messageText = text || inputValue;
    if (!messageText.trim() || !projectId || isTyping) return;

    const newUserMsg = {
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);
    setSuggestions([]); // Clear suggestions while typing

    try {
      // Call AI endpoint
      const response = await apiServerClient.fetch('/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          message: newUserMsg.content,
          conversationHistory: messages.slice(-10) // Send last 10 messages for context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const newAiMsg = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, newAiMsg];
      setMessages(finalMessages);
      
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }

      // Save to PocketBase
      if (conversation) {
        await saveMessage(conversation.id, finalMessages);
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to communicate with AI assistant. Please try again.',
        variant: 'destructive'
      });
      // Remove the user message if it failed, or add an error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Assistant
        </h2>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-full border">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Online
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 bg-background/50">
        <div className="flex flex-col min-h-full justify-end">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}
          
          {isTyping && (
            <div className="flex w-full mb-6 justify-start">
              <div className="flex max-w-[85%] gap-3 flex-row">
                <div className="shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-muted text-foreground rounded-tl-sm border border-border/50 flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-card">
        {suggestions.length > 0 && !isTyping && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(suggestion)}
                className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-colors border border-border/50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about your project..."
            className="flex-1 rounded-full bg-muted/50 border-border focus-visible:ring-primary"
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full shrink-0"
            disabled={!inputValue.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
