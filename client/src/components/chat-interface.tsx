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
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* System Message */}
          {assistant?.instructions && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <Card className="flex-1 p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">System</div>
                <p className="text-sm">{assistant.instructions}</p>
              </Card>
            </div>
          )}

          {/* Conversation Messages */}
          {conversation?.messages.map((msg) => (
            <div key={msg.id} className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'user' ? (
                <>
                  <div className="flex-1 max-w-3xl">
                    <Card className="bg-emerald-600 text-white p-3 ml-auto">
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </Card>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                      {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 max-w-3xl">
                    <Card className="p-4">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {assistant?.name || 'Assistant'}
                      </div>
                      <div className="prose dark:prose-invert text-sm prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
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
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className="p-4">
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
            <div className="text-center py-12">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Ready to chat!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {assistant ? `Start a conversation with ${assistant.name}` : 'Configure your assistant and start chatting'}
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
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
              className="pr-12 resize-none min-h-[60px]"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="sm"
              className="absolute bottom-3 right-3 h-8 w-8 p-0"
              disabled={!message.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Input Options */}
          <div className="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <ObjectUploader
                maxNumberOfFiles={3}
                maxFileSize={10485760} // 10MB
                onGetUploadParameters={async () => {
                  try {
                    const response = await fetch('/api/objects/upload', { method: 'POST' });
                    const data = await response.json();
                    return {
                      method: 'PUT' as const,
                      url: data.uploadURL,
                    };
                  } catch (error) {
                    throw error;
                  }
                }}
                onComplete={async (result: any) => {
                  if (result.successful && result.successful.length > 0) {
                    const uploadedFile = result.successful[0];
                    console.log('File uploaded to chat:', uploadedFile.name);
                    setMessage(prev => prev + `\n\n[Файл загружен: ${uploadedFile.name}]`);
                  }
                }}
                buttonClassName="flex items-center h-6 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 rounded transition-colors"
              >
                <Paperclip className="w-3 h-3 mr-1" />
                Attach file
              </ObjectUploader>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                disabled
              >
                <Code className="w-3 h-3 mr-1" />
                Code
              </Button>
            </div>
            <div className="text-xs">
              <Badge variant="secondary">
                {tokenCount} / 4096 tokens
              </Badge>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
