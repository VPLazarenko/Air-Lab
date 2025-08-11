import { useState, useEffect } from 'react';
import { Bot, X, Minimize2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { openaiClient } from '@/lib/openai-client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface AIAssistantWidgetProps {
  className?: string;
}

function AIAssistantWidgetContent({ user }: { user: any }) {
  const [isMinimized, setIsMinimized] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [widgetAssistantId, setWidgetAssistantId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const fullMessage = "Привет, я AI Ассистент платформы Air Lab. Меня можно настроить под ваши нужды и потребности ваших клиентов. Это лучшее предложение на рынке";

  // Platform documentation for training
  const platformDocs = `
  Air Lab Assistant Builder - это интеллектуальная платформа для создания и управления AI-ассистентами.
  
  Основные возможности:
  - Создание персонализированных AI-ассистентов с настраиваемыми инструкциями
  - Интеграция с Google Docs для базы знаний
  - Управление файлами и документами
  - Настройка OpenAI API ключей
  - Тестирование в интерактивном Playground
  - Развертывание и интеграция с внешними сервисами
  
  Технологии:
  - React + TypeScript frontend
  - Node.js + Express backend
  - OpenAI API для AI функций
  - PostgreSQL база данных
  - Google Cloud Storage для файлов
  
  API Endpoints:
  - GET/POST /api/assistants - управление ассистентами
  - GET/POST /api/conversations - управление диалогами
  - POST /api/chat - отправка сообщений
  
  Платформа поддерживает полный цикл разработки AI-ассистентов: от создания до развертывания.
  `;

  // Create or get widget assistant
  const createWidgetAssistant = async () => {
    if (!user?.id) return null;
    
    try {
      const widgetAssistant = await openaiClient.createAssistant({
        userId: user.id,
        name: "Air Lab Widget Assistant",
        description: "Ассистент виджета платформы Air Lab",
        instructions: `Ты - AI ассистент платформы Air Lab Assistant Builder. 

${platformDocs}

Твоя задача:
1. Приветствовать пользователей дружелюбно на русском языке
2. Отвечать на вопросы о платформе Air Lab
3. Помогать с использованием функций платформы
4. Предоставлять техническую поддержку
5. Быть вежливым и профессиональным

Всегда отвечай на русском языке кратко и по делу.`,
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        temperature: 0.7,
        tools: [{ type: "code_interpreter", enabled: false }]
      });
      return widgetAssistant.id;
    } catch (error) {
      console.error("Error creating widget assistant:", error);
      return null;
    }
  };

  // Initialize widget assistant and conversation
  useEffect(() => {
    if (user?.id && !widgetAssistantId) {
      createWidgetAssistant().then(assistantId => {
        if (assistantId) {
          setWidgetAssistantId(assistantId);
        }
      });
    }
  }, [user?.id, widgetAssistantId]);

  useEffect(() => {
    if (user?.id && widgetAssistantId && !conversationId) {
      openaiClient.createConversation({
        userId: user.id,
        assistantId: widgetAssistantId,
        title: "Widget Chat"
      }).then(conversation => {
        setConversationId(conversation.id);
      }).catch(console.error);
    }
  }, [user?.id, widgetAssistantId, conversationId]);

  useEffect(() => {
    // Auto-expand after 1 minute
    const expandTimer = setTimeout(() => {
      if (isMinimized && conversationId) {
        setIsMinimized(false);
        setShowMessage(true);
        
        // Add welcome message to conversation
        const welcomeMessage: Message = {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: fullMessage,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        
        // Start typing animation after a small delay
        setTimeout(() => {
          setIsTyping(true);
        }, 500);
      }
    }, 60000); // 1 minute

    return () => clearTimeout(expandTimer);
  }, [isMinimized, conversationId]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!conversationId) throw new Error("No conversation");
      
      // Add user message immediately
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Send to API
      const response = await openaiClient.sendMessage(conversationId, message);
      return response;
    },
    onSuccess: (response) => {
      // Add assistant response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content || "Произошла ошибка при получении ответа.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setInputMessage('');
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  useEffect(() => {
    if (isTyping && showMessage) {
      let currentIndex = 0;
      const typingSpeed = 50; // milliseconds per character

      const typeChar = () => {
        if (currentIndex < fullMessage.length) {
          setTypingText(fullMessage.slice(0, currentIndex + 1));
          currentIndex++;
          setTimeout(typeChar, typingSpeed);
        } else {
          // Message completed, wait 3 seconds then minimize
          setTimeout(() => {
            setIsMinimized(true);
            setShowMessage(false);
            setIsTyping(false);
            setTypingText('');
          }, 3000);
        }
      };

      typeChar();
    }
  }, [isTyping, showMessage, fullMessage]);

  const handleToggle = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setShowMessage(false);
      setIsTyping(false);
      setTypingText('');
    } else {
      setIsMinimized(true);
      setShowMessage(false);
      setIsTyping(false);
      setTypingText('');
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setShowMessage(false);
    setIsTyping(false);
    setTypingText('');
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(inputMessage.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {isMinimized ? (
        // Miniature widget
        <Button
          onClick={handleToggle}
          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-300 hover:scale-110"
        >
          <Bot className="w-6 h-6 text-white" />
        </Button>
      ) : (
        // Expanded chat widget
        <Card className="w-80 h-96 bg-white dark:bg-gray-900 shadow-xl border-0 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">AI Ассистент</h3>
                <p className="text-blue-100 text-xs">Air Lab Platform</p>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button
                onClick={handleMinimize}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-500 p-1 h-auto"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleToggle}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-500 p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="p-4 flex-1 overflow-y-auto">
            {showMessage && isTyping && (
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-full">
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                    {typingText}
                    {isTyping && (
                      <span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse" />
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Regular messages */}
            {messages.length > 0 && (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-green-100 dark:bg-green-900' 
                        : 'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      {message.role === 'user' ? (
                        <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                      ) : (
                        <Bot className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 max-w-full ${
                      message.role === 'user'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Loading indicator */}
            {sendMessageMutation.isPending && (
              <div className="flex items-start space-x-3 mt-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {messages.length === 0 && !showMessage && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Добро пожаловать!</p>
                <p className="text-gray-400 text-xs">Спросите что-нибудь о платформе Air Lab</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-3">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Напишите сообщение..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 text-sm focus:ring-2 focus:ring-blue-500"
                disabled={!conversationId || sendMessageMutation.isPending}
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!conversationId || !inputMessage.trim() || sendMessageMutation.isPending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export function AIAssistantWidget({ className = "" }: AIAssistantWidgetProps) {
  const { user } = useAuth();
  
  // Don't render widget if user is not authenticated
  if (!user?.id) {
    return null;
  }

  return <AIAssistantWidgetContent user={user} />;
}