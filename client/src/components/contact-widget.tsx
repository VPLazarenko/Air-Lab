import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle, MessageSquare, X } from "lucide-react";

interface ContactWidgetProps {
  className?: string;
}

export function ContactWidget({ className = "" }: ContactWidgetProps) {
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const openTelegram = () => {
    window.open('https://t.me/vlazarenko', '_blank');
    setShowTelegramModal(false);
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/79258298223', '_blank');
    setShowWhatsAppModal(false);
  };

  return (
    <>
      {/* Floating Contact Buttons */}
      <div className={`fixed bottom-6 right-6 flex flex-col space-y-3 z-50 ${className}`}>
        {/* Telegram Button */}
        <Button
          onClick={() => setShowTelegramModal(true)}
          className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 group"
          size="icon"
        >
          <MessageSquare className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </Button>

        {/* WhatsApp Button */}
        <Button
          onClick={() => setShowWhatsAppModal(true)}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-200 group"
          size="icon"
        >
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </Button>
      </div>

      {/* Telegram Modal */}
      <Dialog open={showTelegramModal} onOpenChange={setShowTelegramModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <DialogTitle className="text-lg font-semibold">Telegram чат</DialogTitle>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Свяжитесь с нами через Telegram для быстрой поддержки и консультаций по AI-ассистентам.
              </p>
              <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Обычно отвечаем в течение нескольких минут</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={openTelegram}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Открыть чат
              </Button>
              <Button
                onClick={() => setShowTelegramModal(false)}
                variant="outline"
                className="px-4"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Modal */}
      <Dialog open={showWhatsAppModal} onOpenChange={setShowWhatsAppModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <DialogTitle className="text-lg font-semibold">WhatsApp чат</DialogTitle>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Напишите нам в WhatsApp для персональной поддержки и решения ваших вопросов по платформе.
              </p>
              <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Доступны для чата в рабочие часы</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={openWhatsApp}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Начать чат
              </Button>
              <Button
                onClick={() => setShowWhatsAppModal(false)}
                variant="outline"
                className="px-4"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}