import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { MessageCircle, Phone, Shield, FileText, HelpCircle, Book } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();

  const openTelegram = () => {
    window.open('https://t.me/vlazarenko', '_blank');
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/79258298223', '_blank');
  };

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Air Lab
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI Assistants Laboratory by Initiology AI Systems
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              © 2025 Все права защищены
            </p>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Информация
            </h4>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-left justify-start text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onClick={() => window.open('/privacy-policy', '_blank')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Политика конфиденциальности
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-left justify-start text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onClick={() => window.open('/cookie-policy', '_blank')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Политика использования Cookies
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-left justify-start text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onClick={() => window.open('/documentation', '_blank')}
              >
                <Book className="w-4 h-4 mr-2" />
                Документация
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-left justify-start text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onClick={() => window.open('/help', '_blank')}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Инструкция
              </Button>
            </div>
          </div>

          {/* Contacts Section */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Контакты
            </h4>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950"
                onClick={openTelegram}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Telegram: @vlazarenko
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950"
                onClick={openWhatsApp}
              >
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp: +7 925 829 82 23
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center sm:text-left">
              Air Lab. AI Assistants Laboratory by Initiology AI Systems
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
                onClick={openTelegram}
              >
                Telegram
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
                onClick={openWhatsApp}
              >
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}