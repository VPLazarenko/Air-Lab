import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Book, Code, Download, ExternalLink, FileText, 
  Terminal, Settings, Database, Cloud, Shield
} from "lucide-react";
import Footer from "@/components/Footer";

export default function Documentation() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Документация</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Полное руководство по использованию платформы Air Lab Assistant Builder
            </p>
          </div>

          {/* Quick Start */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Book className="w-6 h-6 text-green-600" />
                <span>Быстрый старт</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">1. Создание первого ассистента</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Начните с создания вашего первого AI-ассистента через Dashboard.
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Перейти к созданию
                  </Button>
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">2. Настройка API ключей</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Добавьте ваш OpenAI API ключ в профиле пользователя для активации ассистентов.
                  </p>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Настроить ключи
                  </Button>
                </div>

                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">3. Тестирование в Playground</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Протестируйте вашего ассистента в интерактивном режиме чата.
                  </p>
                  <Button variant="outline" size="sm">
                    <Terminal className="w-4 h-4 mr-2" />
                    Открыть Playground
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Documentation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="w-6 h-6 text-blue-600" />
                  <span>API Документация</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold">Основные эндпоинты:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <code>GET /api/assistants</code> - Список ассистентов
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <code>POST /api/assistants</code> - Создать ассистента
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <code>GET /api/conversations</code> - История диалогов
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <code>POST /api/chat</code> - Отправить сообщение
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-6 h-6 text-purple-600" />
                  <span>Структура данных</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold">Основные модели:</h4>
                  <div className="space-y-2 text-sm">
                    <Badge variant="outline">User - Пользователи</Badge>
                    <Badge variant="outline">Assistant - Ассистенты</Badge>
                    <Badge variant="outline">Conversation - Диалоги</Badge>
                    <Badge variant="outline">Document - Документы</Badge>
                    <Badge variant="outline">Integration - Интеграции</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Setup Guides */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-6 h-6 text-orange-600" />
                <span>Руководства по настройке</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">OpenAI API</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Настройка интеграции с OpenAI для работы ассистентов
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Читать руководство
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Google Docs</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Подключение документов Google для базы знаний
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Читать руководство
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">База данных</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Настройка PostgreSQL и миграции схемы
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Читать руководство
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Topics */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Продвинутые темы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <Cloud className="w-5 h-5 text-blue-500" />
                    <span>Развертывание</span>
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Настройка production окружения</li>
                    <li>• Docker контейнеризация</li>
                    <li>• CI/CD пайплайны</li>
                    <li>• Мониторинг и логирование</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    <span>Безопасность</span>
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Управление секретными ключами</li>
                    <li>• Настройка HTTPS</li>
                    <li>• Аутентификация и авторизация</li>
                    <li>• Резервное копирование данных</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-6 h-6 text-indigo-600" />
                <span>Загрузки</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-semibold">Windows Installer</div>
                    <div className="text-sm text-gray-500">Автономная установка для Windows</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-semibold">macOS Package</div>
                    <div className="text-sm text-gray-500">Установочный пакет для macOS</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-semibold">API Reference</div>
                    <div className="text-sm text-gray-500">Полная документация API (PDF)</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-semibold">User Manual</div>
                    <div className="text-sm text-gray-500">Руководство пользователя (PDF)</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}