import { useState, useEffect } from 'react';
import { Bot, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AIAssistantWidgetProps {
  className?: string;
}

export function AIAssistantWidget({ className = "" }: AIAssistantWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const fullMessage = "Привет, я AI Ассистент платформы Air Lab. Меня можно настроить под ваши нужды и потребности ваших клиентов. Это лучшее предложение на рынке";

  useEffect(() => {
    // Auto-expand after 1 minute
    const expandTimer = setTimeout(() => {
      if (isMinimized) {
        setIsMinimized(false);
        setShowMessage(true);
        
        // Start typing animation after a small delay
        setTimeout(() => {
          setIsTyping(true);
        }, 500);
      }
    }, 60000); // 1 minute

    return () => clearTimeout(expandTimer);
  }, [isMinimized]);

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
            {showMessage && (
              <div className="flex items-start space-x-3">
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

            {!showMessage && !isTyping && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Добро пожаловать!</p>
                <p className="text-gray-400 text-xs">Как дела?</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-3">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Напишите сообщение..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                disabled
              />
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                disabled
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}