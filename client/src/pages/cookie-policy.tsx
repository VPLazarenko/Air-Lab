import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cookie, Shield, Settings, Database, Globe, Eye } from "lucide-react";
import Footer from "@/components/Footer";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Политика использования файлов cookie
            </p>
            <Badge variant="secondary" className="mt-2">
              Обновлено: 10 августа 2025
            </Badge>
          </div>

          {/* What are Cookies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cookie className="w-6 h-6 text-orange-600" />
                <span>Что такое файлы cookie</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Файлы cookie - это небольшие текстовые файлы, которые сохраняются 
                  в вашем браузере при посещении веб-сайтов. Они позволяют сайту 
                  "запомнить" ваши действия и предпочтения на определенный период времени.
                </p>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Для чего мы используем cookie</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Сохранение ваших настроек и предпочтений</li>
                    <li>• Обеспечение безопасности и аутентификации</li>
                    <li>• Анализ использования платформы</li>
                    <li>• Улучшение пользовательского опыта</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Types of Cookies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-6 h-6 text-blue-600" />
                <span>Типы файлов cookie</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                    <Badge variant="default">Необходимые</Badge>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Эти файлы cookie необходимы для корректной работы платформы и не могут быть отключены.
                  </p>
                  <ul className="text-sm space-y-1 text-gray-500 dark:text-gray-400">
                    <li>• Сессионные токены для аутентификации</li>
                    <li>• Настройки безопасности</li>
                    <li>• Локальные настройки интерфейса</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                    <Badge variant="secondary">Функциональные</Badge>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Позволяют запомнить ваши предпочтения и обеспечить персонализированный опыт.
                  </p>
                  <ul className="text-sm space-y-1 text-gray-500 dark:text-gray-400">
                    <li>• Выбранная тема оформления (светлая/темная)</li>
                    <li>• Языковые настройки</li>
                    <li>• Размер и расположение панелей</li>
                    <li>• Последние использованные ассистенты</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                    <Badge variant="outline">Аналитические</Badge>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Помогают понять, как пользователи взаимодействуют с платформой для ее улучшения.
                  </p>
                  <ul className="text-sm space-y-1 text-gray-500 dark:text-gray-400">
                    <li>• Статистика посещений и активности</li>
                    <li>• Популярные функции и разделы</li>
                    <li>• Время использования платформы</li>
                    <li>• Ошибки и производительность</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-6 h-6 text-purple-600" />
                <span>Детали использования cookie</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Первые и третьи лица</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                      <h4 className="font-semibold text-sm">Первые лица (наши)</h4>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        <li>• Сессии и аутентификация</li>
                        <li>• Настройки интерфейса</li>
                        <li>• Предпочтения пользователя</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <h4 className="font-semibold text-sm">Третьи лица</h4>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        <li>• Google Fonts (шрифты)</li>
                        <li>• OpenAI API (функциональность)</li>
                        <li>• CDN сервисы (производительность)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Время хранения</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm">Сессионные cookie</span>
                      <Badge variant="outline">До закрытия браузера</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm">Настройки интерфейса</span>
                      <Badge variant="outline">1 год</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm">Аналитические данные</span>
                      <Badge variant="outline">2 года</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm">Токены аутентификации</span>
                      <Badge variant="outline">30 дней</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Management */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-green-600" />
                <span>Управление файлами cookie</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Настройки браузера</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Вы можете управлять cookie через настройки вашего браузера. 
                    Большинство браузеров позволяют блокировать или удалять cookie.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <h4 className="font-semibold text-sm mb-1">Chrome</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Настройки → Конфиденциальность → Cookie
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <h4 className="font-semibold text-sm mb-1">Firefox</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Настройки → Приватность → Cookie
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <h4 className="font-semibold text-sm mb-1">Safari</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Настройки → Конфиденциальность
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <h4 className="font-semibold text-sm mb-1">Edge</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Настройки → Cookie и разрешения
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-500">
                  <h3 className="text-lg font-semibold mb-2">Важно знать</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Отключение необходимых cookie может привести к нарушению 
                    работы платформы. Некоторые функции могут стать недоступными 
                    или работать некорректно.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Local Storage */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-6 h-6 text-indigo-600" />
                <span>Локальное хранилище</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Помимо cookie, мы используем технологии локального хранилища 
                  браузера (localStorage, sessionStorage) для улучшения 
                  производительности и пользовательского опыта.
                </p>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Что сохраняется локально</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Черновики сообщений и настроек ассистентов</li>
                    <li>• Кэш часто используемых данных</li>
                    <li>• Состояние интерфейса (открытые панели, позиции)</li>
                    <li>• Временные файлы для ускорения работы</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact and Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-6 h-6 text-red-600" />
                <span>Обновления и контакты</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Обновления политики</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Мы можем обновлять эту политику при изменении наших практик 
                    использования cookie. О существенных изменениях мы уведомляем 
                    пользователей через платформу.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Вопросы и связь</h3>
                  <div className="space-y-2 text-gray-600 dark:text-gray-400">
                    <p><strong>Email:</strong> privacy@initiology.ai</p>
                    <p><strong>Основатель:</strong> Вячеслав Лазаренко</p>
                    <p><strong>Telegram:</strong> @vlazarenko</p>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button variant="outline">
                    Настройки cookie
                  </Button>
                  <Button variant="outline">
                    Очистить все cookie
                  </Button>
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