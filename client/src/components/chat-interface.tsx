import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { Conversation, Assistant } from "@/lib/openai-client";
import { 
  Send, 
  Copy, 
  RotateCcw, 
  Settings, 
  User, 
  Bot,
  Paperclip,
  Code
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatInterfaceProps {
  conversation: Conversation | null;
  assistant: Assistant | undefined;
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatInterface({ conversation, assistant, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [tokenCount, setTokenCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  useEffect(() => {
    // Rough token estimation (4 characters ≈ 1 token)
    setTokenCount(Math.ceil(message.length / 4));
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const messageToSend = message.trim();
    setMessage("");
    setTokenCount(0);
    
    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Messages Area with fixed height and proper scrolling */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2 sm:p-4 space-y-4">
            {!conversation?.messages?.length ? (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {assistant ? `Начните беседу с ${assistant.name}` : "Начните беседу"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md text-sm sm:text-base">
                  {assistant?.description || "Задайте вопрос или опишите задачу, которую хотите решить"}
                </p>
              </div>
            ) : (
              <>
                {conversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 sm:gap-3 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] sm:max-w-[75%] lg:max-w-2xl ${msg.role === "user" ? "order-first" : ""}`}>
                      <Card className={`p-3 sm:p-4 ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700"
                      }`}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium opacity-70">
                                {msg.role === "user" ? "Вы" : assistant?.name || "Ассистент"}
                              </span>
                              <span className="text-xs opacity-50 hidden sm:inline">
                                {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyMessage(msg.content)}
                              className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {msg.content}
                          </div>
                        </div>
                      </Card>
                    </div>
                    
                    {msg.role === "user" && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-2 sm:gap-3 justify-start">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <Card className="p-3 sm:p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">Думаю...</span>
                      </div>
                    </Card>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 p-2 sm:p-4">
        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
          <div className="flex items-end gap-2 sm:gap-3">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  autoResize();
                }}
                onKeyDown={handleKeyDown}
                placeholder={`Напишите сообщение для ${assistant?.name || 'ассистента'}...`}
                className="min-h-[2.5rem] max-h-32 resize-none text-sm sm:text-base"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex gap-1 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0"
                disabled={isLoading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || isLoading}
                className="h-10 w-10 sm:w-auto sm:px-4 bg-emerald-600 hover:bg-emerald-700"
              >
                <Send className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Отправить</span>
              </Button>
            </div>
          </div>
          
          {/* Token counter and status */}
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              {tokenCount > 0 && (
                <span>≈ {tokenCount} токенов</span>
              )}
              {assistant && (
                <Badge variant="secondary" className="text-xs">
                  {assistant.model}
                </Badge>
              )}
            </div>
            
            <div className="text-right">
              {isLoading ? (
                <span className="text-blue-500">Отправка...</span>
              ) : (
                <span>Enter для отправки</span>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}