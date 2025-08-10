import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bot, MessageSquare, FileText, Settings, Database, Cloud, 
  Smartphone, Globe, Lock, Users, Zap, Download 
} from "lucide-react";
import Footer from "@/components/Footer";

export default function PlatformFeatures() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Функции и возможности</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Полный обзор возможностей платформы Air Lab Assistant Builder
            </p>
          </div>

          {/* Core Features */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Основные функции</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="w-6 h-6 text-blue-600" />
                    <span>Конструктор ассистентов</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Визуальный редактор системных инструкций</li>
                    <li>• Настройка поведения и личности ассистента</li>
                    <li>• Шаблоны для различных сценариев использования</li>
                    <li>• Предварительный просмотр в реальном времени</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                    <span>Интерфейс чата</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Современный UI с темной темой</li>
                    <li>• Поддержка markdown и форматирования</li>
                    <li>• История диалогов и сессий</li>
                    <li>• Экспорт диалогов в PDF</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-6 h-6 text-purple-600" />
                    <span>Управление документами</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Интеграция с Google Docs</li>
                    <li>• Загрузка файлов различных форматов</li>
                    <li>• Автоматическая индексация контента</li>
                    <li>• Поиск по содержимому документов</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-6 h-6 text-orange-600" />
                    <span>Настройки и конфигурация</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Гибкие настройки API ключей</li>
                    <li>• Управление пользователями и ролями</li>
                    <li>• Настройка интеграций</li>
                    <li>• Мониторинг производительности</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Расширенные возможности</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-6 h-6 text-indigo-600" />
                    <span>База данных</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• PostgreSQL с Drizzle ORM</li>
                    <li>• Автоматические резервные копии</li>
                    <li>• Масштабируемая архитектура</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cloud className="w-6 h-6 text-blue-500" />
                    <span>Облачное хранилище</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Google Cloud Storage</li>
                    <li>• Контроль доступа к файлам</li>
                    <li>• Безлимитное хранение</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="w-6 h-6 text-red-600" />
                    <span>Безопасность</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Шифрование данных</li>
                    <li>• Аутентификация пользователей</li>
                    <li>• Контроль доступа</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Integration Features */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Интеграции</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <Smartphone className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold">WhatsApp</h3>
                  <p className="text-xs text-gray-500">Чат-боты</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold">Telegram</h3>
                  <p className="text-xs text-gray-500">Боты и каналы</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <Globe className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold">VKontakte</h3>
                  <p className="text-xs text-gray-500">Группы и сообщества</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <h3 className="font-semibold">OpenAI API</h3>
                  <p className="text-xs text-gray-500">GPT модели</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Widget Designer */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Дизайнер виджетов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Возможности дизайнера</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Визуальный редактор интерфейса чата</li>
                    <li>• Настройка цветовой схемы и стилей</li>
                    <li>• Предварительный просмотр в реальном времени</li>
                    <li>• Генерация готового HTML кода</li>
                    <li>• Адаптивный дизайн для всех устройств</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Режимы отображения</h3>
                  <div className="space-y-2">
                    <Badge variant="outline">Свернутый виджет</Badge>
                    <Badge variant="outline">Развернутый чат</Badge>
                    <Badge variant="outline">Полноэкранный режим</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cross-Platform Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center space-x-2">
                <Download className="w-6 h-6" />
                <span>Кроссплатформенная поддержка</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Windows</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Автономный установщик</li>
                    <li>• PowerShell автоматизация</li>
                    <li>• Интеграция с системными сервисами</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">macOS</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Shell-скрипты установки</li>
                    <li>• Homebrew интеграция</li>
                    <li>• Структура приложения-пакета</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}