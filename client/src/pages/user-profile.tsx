import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Settings, Crown, Calendar, Bot, LogOut, AlertTriangle, Clock, CreditCard } from "lucide-react";
import type { Assistant } from "@shared/schema";
import Footer from "@/components/Footer";
import { TariffActivationForm } from "@/components/tariff-activation-form";
import { useState } from "react";

export default function UserProfile() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showTariffForm, setShowTariffForm] = useState(false);

  const { data: assistants = [], isLoading: assistantsLoading } = useQuery<Assistant[]>({
    queryKey: ["/api/assistants/my"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated || !user) {
    return null;
  }

  // Вычисляем количество дней с регистрации
  const registrationDate = new Date(user.createdAt);
  const currentDate = new Date();
  const daysSinceRegistration = Math.floor(
    (currentDate.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Проверяем нужно ли показать уведомление об активации
  const needsActivation = !user.plan || user.plan === 'free' || user.plan === null;
  const daysRemaining = Math.max(0, 3 - daysSinceRegistration);
  const showActivationWarning = needsActivation && daysSinceRegistration < 3;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="gap-1"><Crown className="w-3 h-3" />Администратор</Badge>;
      case 'user':
        return <Badge variant="secondary">Пользователь</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getPlanBadge = (plan: string | null | undefined) => {
    switch (plan) {
      case 'pro':
        return <Badge variant="default">Pro</Badge>;
      case 'enterprise':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Enterprise</Badge>;
      case 'free':
      default:
        return <Badge variant="outline">Бесплатный</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 flex-1">
        <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Профиль пользователя</h1>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-2">
              Управляйте своими ассистентами и настройками
            </p>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="gap-2 w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </Button>
        </div>

        {/* Предупреждение об активации тарифа */}
        {showActivationWarning && (
          <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-2">
                    Требуется активация тарифного плана
                  </p>
                  <p className="text-sm mb-3">
                    У вас осталось {daysRemaining} {daysRemaining === 1 ? 'день' : 'дня'} для выбора и активации тарифного плана. 
                    После истечения этого срока ваш аккаунт будет заморожен до активации тарифа.
                  </p>
                  <p className="text-xs font-medium mb-3">
                    ⚠️ Заморозка аккаунта означает блокировку доступа ко всем функциям платформы, включая ваших ассистентов.
                  </p>
                  <Button 
                    onClick={() => setShowTariffForm(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-sm"
                    size="sm"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Активировать тариф
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Уведомление о замороженном аккаунте */}
        {!user.isActive && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-2">
                    Аккаунт заморожен
                  </p>
                  <p className="text-sm mb-3">
                    Ваш аккаунт заморожен из-за отсутствия активного тарифного плана. 
                    Активируйте любой тариф для разморозки аккаунта и восстановления доступа к функциям платформы.
                  </p>
                  <p className="text-xs font-medium mb-3">
                    🔒 Пока аккаунт заморожен, доступ к ассистентам и другим функциям ограничен.
                  </p>
                  <Button 
                    onClick={() => setShowTariffForm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm"
                    size="sm"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Разморозить аккаунт
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Информация о пользователе
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Имя пользователя</p>
                  <p className="font-medium">{user.username}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Роль</p>
                  {getRoleBadge(user.role)}
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Тарифный план</p>
                  {getPlanBadge(user.plan)}
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Дата регистрации</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <p className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Статус</p>
                  <Badge variant={user.isActive ? "default" : "destructive"}>
                    {user.isActive ? "Активен" : "Заблокирован"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Настройки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Модель по умолчанию</p>
                    <p className="font-medium">{user.settings?.defaultModel || 'gpt-4o'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Автосохранение</p>
                    <Badge variant={user.settings?.autoSave ? "default" : "outline"}>
                      {user.settings?.autoSave ? "Включено" : "Отключено"}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Темная тема</p>
                    <Badge variant={user.settings?.darkMode ? "default" : "outline"}>
                      {user.settings?.darkMode ? "Включена" : "Отключена"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assistants */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Мои ассистенты
                  <Badge variant="secondary" className="ml-2">
                    {assistants.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Список всех созданных вами ассистентов
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assistantsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">Загрузка ассистентов...</p>
                  </div>
                ) : assistants.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">У вас пока нет ассистентов</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Создайте своего первого ассистента на главной странице
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assistants.map((assistant, index) => (
                      <div key={assistant.id}>
                        <div className="flex items-start justify-between p-4 rounded-lg border bg-white dark:bg-slate-800">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{assistant.name}</h3>
                              <Badge variant={assistant.isActive ? "default" : "secondary"}>
                                {assistant.isActive ? "Активен" : "Неактивен"}
                              </Badge>
                            </div>
                            
                            {assistant.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {assistant.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                              <span>Модель: {assistant.model}</span>
                              <span>•</span>
                              <span>Создан: {new Date(assistant.createdAt).toLocaleDateString('ru-RU')}</span>
                              {assistant.tools && assistant.tools.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span>Инструменты: {assistant.tools.filter((t: any) => t.enabled).length}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {index < assistants.length - 1 && <Separator className="my-2" />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Форма активации тарифа */}
      {showTariffForm && (
        <TariffActivationForm 
          isOpen={showTariffForm}
          onClose={() => setShowTariffForm(false)}
          onSuccess={() => {
            setShowTariffForm(false);
            window.location.reload(); // Обновляем страницу для отображения изменений
          }}
        />
      )}
      
      <Footer />
    </div>
  );
}