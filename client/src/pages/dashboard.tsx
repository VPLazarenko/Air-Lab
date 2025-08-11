import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { openaiClient } from "@/lib/openai-client";
import type { Assistant } from "@/lib/openai-client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import { 
  Bot, 
  Plus, 
  Settings, 
  Play,
  Moon,
  Sun,
  User as UserIcon,
  LogIn,
  LogOut,
  Crown,
  Menu,
  X,
  ImageIcon
} from "lucide-react";

export default function Dashboard() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: assistants = [] } = useQuery({
    queryKey: ['/api/assistants/user', authUser?.id],
    queryFn: () => openaiClient.getAssistantsByUserId(authUser?.id),
    enabled: !!authUser,
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDark.toString());
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/assets/logo.jpg"
                alt="Air Lab Logo"
                className="w-8 h-8 rounded-lg object-contain"
              />
              <div>
                <h1 className="text-xl font-bold">Air Lab. Assistant Builder</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI Platform by Initiology AI Systems</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm">{authUser?.username}</span>
                  <Button variant="ghost" onClick={logout} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Выход
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setLocation('/login')} className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Вход
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Добро пожаловать в AI Platform</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Создавайте, настраивайте и управляйте ИИ-ассистентами с помощью OpenAI
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Telegram Integration */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Telegram Bot</CardTitle>
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-blue-600">Настроить</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Интеграция с Telegram для создания ботов
              </p>
              <Badge variant="outline" className="mt-2">
                Не настроено
              </Badge>
            </CardContent>
          </Card>

          {/* VK Integration */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">VK Бот</CardTitle>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-blue-600">Настроить</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Интеграция с VKontakte для сообщений
              </p>
              <Badge variant="outline" className="mt-2">
                Не настроено
              </Badge>
            </CardContent>
          </Card>

          {/* WhatsApp Integration */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-green-600">Настроить</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Интеграция с WhatsApp Business API
              </p>
              <Badge variant="outline" className="mt-2">
                Не настроено
              </Badge>
            </CardContent>
          </Card>

          {/* OpenAI Integration */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OpenAI Assistant ID</CardTitle>
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-purple-600">Настроить</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Подключение к OpenAI Assistants ID
              </p>
              <Badge variant="outline" className="mt-2">
                Не настроено
              </Badge>
            </CardContent>
          </Card>

          {/* AI Photo Editor Card */}
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-500"
            onClick={() => setLocation('/photo-editor')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Фоторедактор</CardTitle>
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-orange-600">
                Открыть
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Редактирование изображений с помощью ИИ
              </p>
              <Badge variant="default" className="mt-2 bg-orange-500">
                Доступно
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Assistants Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Мои Ассистенты
              </CardTitle>
              <Link href="/playground">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Создать ассистента
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {assistants.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Пока нет ассистентов</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Создайте своего первого ИИ-ассистента
                </p>
                <Link href="/playground">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Создать ассистента
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {assistants.map((assistant: Assistant) => (
                  <div 
                    key={assistant.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">{assistant.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {assistant.description || 'Описание отсутствует'}
                        </p>
                      </div>
                    </div>
                    <Link href={`/playground/${assistant.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Play className="w-4 h-4" />
                        Открыть
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}