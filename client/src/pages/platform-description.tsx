import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Brain, FileText, Zap, Users, Shield } from "lucide-react";
import Footer from "@/components/Footer";

export default function PlatformDescription() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img 
                src="/assets/logo.jpg"
                alt="Air Lab Logo" 
                className="w-16 h-16 rounded-full"
              />
              <h1 className="text-4xl font-bold">Air Lab Assistant Builder</h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              Интеллектуальная платформа для создания и управления AI-ассистентами
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Powered by Initiology AI Systems
            </Badge>
          </div>

          {/* Main Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-6 h-6 text-blue-600" />
                  <span>Создание ассистентов</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Легко создавайте персонализированных AI-ассистентов с настраиваемыми инструкциями, функциями и базой знаний.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <span>Умное обучение</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Интеграция с документами Google Docs и файлами для создания контекстно-зависимых ответов.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-green-600" />
                  <span>Управление знаниями</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Полный контроль над базой знаний ассистентов с возможностью загрузки файлов и документов.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-6 h-6 text-yellow-600" />
                  <span>Быстрая интеграция</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Готовые интеграции с Telegram, WhatsApp, VK и другими популярными платформами.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-6 h-6 text-indigo-600" />
                  <span>Многопользовательность</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Поддержка множественных пользователей с разными уровнями доступа и администрированием.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-red-600" />
                  <span>Безопасность</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Надежная защита данных с использованием современных протоколов шифрования и контроля доступа.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Platform Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">О платформе</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Air Lab Assistant Builder - это комплексная платформа для создания, обучения и развертывания 
                интеллектуальных AI-ассистентов. Платформа использует передовые технологии машинного обучения 
                и обработки естественного языка для создания персонализированных помощников.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Наша миссия - сделать технологии искусственного интеллекта доступными для каждого пользователя, 
                предоставляя интуитивные инструменты для создания мощных AI-решений без необходимости 
                глубоких технических знаний.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Платформа поддерживает полный цикл разработки: от создания и обучения ассистента до его 
                развертывания и интеграции с внешними сервисами и приложениями.
              </p>
            </CardContent>
          </Card>

          {/* Technical Stack */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Технологический стек</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Badge variant="outline">React + TypeScript</Badge>
                <Badge variant="outline">Node.js + Express</Badge>
                <Badge variant="outline">OpenAI API</Badge>
                <Badge variant="outline">PostgreSQL</Badge>
                <Badge variant="outline">Google Cloud Storage</Badge>
                <Badge variant="outline">Tailwind CSS</Badge>
                <Badge variant="outline">Drizzle ORM</Badge>
                <Badge variant="outline">Google Docs API</Badge>
                <Badge variant="outline">WebSocket</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}