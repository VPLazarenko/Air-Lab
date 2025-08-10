import { useLanguage } from "@/lib/i18n";
import { MessageSquare, Phone, FileText, Shield, Book, HelpCircle, Settings, Users, Code, Mail } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-black text-white py-12 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Air Lab</h3>
                <p className="text-sm text-gray-400">Assistant Builder</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Профессиональная AI платформа от Initiology AI Systems для создания и управления интеллектуальными ассистентами нового поколения.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Продукт</h4>
            <div className="space-y-3">
              <a href="/about" className="flex items-center space-x-2 text-gray-400 hover:text-emerald-400 transition-colors text-sm group">
                <Book className="w-4 h-4 group-hover:text-emerald-400" />
                <span>О приложении</span>
              </a>
              <a href="/features" className="flex items-center space-x-2 text-gray-400 hover:text-emerald-400 transition-colors text-sm group">
                <Settings className="w-4 h-4 group-hover:text-emerald-400" />
                <span>Возможности</span>
              </a>
              <a href="/pricing" className="flex items-center space-x-2 text-gray-400 hover:text-emerald-400 transition-colors text-sm group">
                <Users className="w-4 h-4 group-hover:text-emerald-400" />
                <span>Тарифы и цены</span>
              </a>
            </div>
          </div>

          {/* Documentation */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Документация</h4>
            <div className="space-y-3">
              <a href="/docs/getting-started" className="flex items-center space-x-2 text-gray-400 hover:text-emerald-400 transition-colors text-sm group">
                <Book className="w-4 h-4 group-hover:text-emerald-400" />
                <span>Руководство пользователя</span>
              </a>
              <a href="/docs/api" className="flex items-center space-x-2 text-gray-400 hover:text-emerald-400 transition-colors text-sm group">
                <Code className="w-4 h-4 group-hover:text-emerald-400" />
                <span>Документация API</span>
              </a>
              <a href="/support" className="flex items-center space-x-2 text-gray-400 hover:text-emerald-400 transition-colors text-sm group">
                <HelpCircle className="w-4 h-4 group-hover:text-emerald-400" />
                <span>Техническая поддержка</span>
              </a>
              <a href="/tutorials" className="flex items-center space-x-2 text-gray-400 hover:text-emerald-400 transition-colors text-sm group">
                <FileText className="w-4 h-4 group-hover:text-emerald-400" />
                <span>Обучающие материалы</span>
              </a>
            </div>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Юридическая информация</h4>
            <div className="space-y-3 mb-6">
              <a href="/privacy-policy" className="flex items-center space-x-2 text-gray-400 hover:text-emerald-400 transition-colors text-sm group">
                <Shield className="w-4 h-4 group-hover:text-emerald-400" />
                <span>Политика конфиденциальности</span>
              </a>
              <a href="/terms-of-service" className="flex items-center space-x-2 text-gray-400 hover:text-emerald-400 transition-colors text-sm group">
                <FileText className="w-4 h-4 group-hover:text-emerald-400" />
                <span>Пользовательское соглашение</span>
              </a>
              <a href="/contact" className="flex items-center space-x-2 text-gray-400 hover:text-emerald-400 transition-colors text-sm group">
                <Mail className="w-4 h-4 group-hover:text-emerald-400" />
                <span>Контактная информация</span>
              </a>
            </div>

            {/* Contact Widgets */}
            <div className="space-y-3">
              <a 
                href="https://t.me/vlazarenko" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-400 hover:text-blue-400 transition-colors text-sm group bg-gray-900 rounded-lg p-3"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Telegram</div>
                  <div className="text-xs text-gray-400">@vlazarenko</div>
                </div>
              </a>
              
              <a 
                href="https://wa.me/79258298223" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-400 hover:text-green-400 transition-colors text-sm group bg-gray-900 rounded-lg p-3"
              >
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">WhatsApp</div>
                  <div className="text-xs text-gray-400">+7 925 829 8223</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © 2024 <span className="text-white font-medium">Initiology AI Systems</span>. Все права защищены.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Air Lab. AI Assistants Laboratory by Initiology AI Systems Lazarenko
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-gray-500">Версия 2.1.0</span>
              <span className="text-gray-500">•</span>
              <span className="text-emerald-400 font-medium">Статус: Активно</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}