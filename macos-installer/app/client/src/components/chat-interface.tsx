import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-3 lg:p-6">
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* System Message */}
          {assistant?.instructions && (
            <div className="flex items-start space-x-2 lg:space-x-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <Settings className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <Card className="flex-1 p-2 lg:p-3 max-w-[85%] lg:max-w-none">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">System</div>
                <p className="text-sm break-words">{assistant.instructions}</p>
              </Card>
            </div>
          )}

          {/* Conversation Messages */}
          {conversation?.messages.map((msg) => (
            <div key={msg.id} className={`flex items-start space-x-2 lg:space-x-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'user' ? (
                <>
                  <div className="flex-1 max-w-[85%] lg:max-w-3xl">
                    <Card className="bg-emerald-600 text-white p-2 lg:p-3 ml-auto">
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </Card>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                      {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                  </div>
                  <div className="flex-1 max-w-[85%] lg:max-w-3xl">
                    <Card className="p-3 lg:p-4">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {assistant?.name || 'Assistant'}
                      </div>
                      <div className="prose dark:prose-invert text-sm prose-sm max-w-none">
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 gap-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                        </p>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMessage(msg.content)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            disabled
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Loading Message */}
          {isLoading && (
            <div className="flex items-start space-x-2 lg:space-x-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <Card className="p-3 lg:p-4 max-w-[85%] lg:max-w-3xl">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {assistant?.name || 'Assistant'}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!conversation?.messages.length && !isLoading && (
            <div className="text-center py-8 lg:py-12 px-4">
              <Bot className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-3 lg:mb-4 text-gray-400" />
              <h3 className="text-base lg:text-lg font-medium mb-2">Ready to chat!</h3>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 break-words">
                {assistant ? `Start a conversation with ${assistant.name}` : 'Configure your assistant and start chatting'}
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 lg:p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Type your message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKeyDown}
              className="pr-12 resize-none min-h-[50px] lg:min-h-[60px] text-sm lg:text-base"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="sm"
              className="absolute bottom-2 right-2 h-7 w-7 lg:h-8 lg:w-8 p-0"
              disabled={!message.trim() || isLoading}
            >
              <Send className="w-3 h-3 lg:w-4 lg:h-4" />
            </Button>
          </div>
          
          {/* Input Options */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 lg:mt-3 text-sm text-gray-500 dark:text-gray-400 gap-2">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2"
                disabled
              >
                <Paperclip className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Attach file</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2"
                disabled
              >
                <Code className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Code</span>
              </Button>
            </div>
            <div className="text-xs">
              <Badge variant="secondary" className="text-xs">
                {tokenCount} / 4096 tokens
              </Badge>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
