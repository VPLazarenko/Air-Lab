import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { SiTelegram, SiWhatsapp } from 'react-icons/si';

export default function Footer() {
  const [showSocialWidget, setShowSocialWidget] = useState(false);

  return (
    <footer className="bg-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Platform Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/assets/logo.jpg" 
                alt="Air Lab Logo" 
                className="w-8 h-8 rounded-full"
              />
              <h3 className="font-bold text-lg">Air Lab</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Интеллектуальная платформа для создания и управления AI-ассистентами. 
              Создавайте, настраивайте и интегрируйте ваших персональных помощников.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Платформа</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Описание платформы
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Функции и возможности
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Документация
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Инструкции по использованию
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Правовая информация</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Политика конфиденциальности
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Пользовательское соглашение
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Условия использования
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Поддержка</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Центр поддержки
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Обратная связь
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Сообщить об ошибке
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              <p>© 2025 Air Lab. Все права защищены.</p>
              <p className="mt-1">Founder and Creator: Viacheslav Lazarenko | Initiology AI Systems</p>
            </div>

            {/* Social Widget */}
            <div 
              className="relative"
              onMouseEnter={() => setShowSocialWidget(true)}
              onMouseLeave={() => setShowSocialWidget(false)}
            >
              <div className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">Связаться с нами</span>
              </div>

              {/* Expandable Social Links */}
              {showSocialWidget && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-xl border border-gray-700 p-4 min-w-[200px]">
                  <div className="space-y-3">
                    <a
                      href="https://t.me/vlazarenko"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <SiTelegram className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-sm font-medium">Telegram</div>
                        <div className="text-xs text-gray-400">@vlazarenko</div>
                      </div>
                    </a>
                    
                    <a
                      href="https://wa.me/message"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <SiWhatsapp className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-sm font-medium">WhatsApp</div>
                        <div className="text-xs text-gray-400">Чат поддержки</div>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}