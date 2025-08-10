import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, Database, Globe, FileText } from "lucide-react";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Политика конфиденциальности</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Air Lab Assistant Builder by Initiology AI Systems
            </p>
            <Badge variant="secondary" className="mt-2">
              Последнее обновление: 10 августа 2025
            </Badge>
          </div>

          {/* Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <span>Введение</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Настоящая Политика конфиденциальности описывает, как Initiology AI Systems 
                собирает, использует и защищает вашу персональную информацию при использовании 
                платформы Air Lab Assistant Builder.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Мы серьезно относимся к защите ваших данных и обязуемся обеспечивать высочайший 
                уровень безопасности и конфиденциальности.
              </p>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-6 h-6 text-green-600" />
                <span>Сбор данных</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Персональная информация</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Имя пользователя и email адрес</li>
                    <li>• Данные профиля и настройки пользователя</li>
                    <li>• История использования платформы</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Техническая информация</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• IP-адрес и геолокация</li>
                    <li>• Информация о браузере и устройстве</li>
                    <li>• Логи активности и ошибок</li>
                    <li>• Файлы cookies и локальное хранилище</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Контент и данные</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Созданные ассистенты и их настройки</li>
                    <li>• Загруженные документы и файлы</li>
                    <li>• История диалогов с ассистентами</li>
                    <li>• Интеграции с внешними сервисами</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-6 h-6 text-purple-600" />
                <span>Использование данных</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Основные цели</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Предоставление и улучшение сервисов платформы</li>
                    <li>• Персонализация пользовательского опыта</li>
                    <li>• Техническая поддержка и помощь пользователям</li>
                    <li>• Обеспечение безопасности и предотвращение мошенничества</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Аналитика и улучшения</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Анализ использования функций платформы</li>
                    <li>• Выявление и устранение технических проблем</li>
                    <li>• Разработка новых возможностей</li>
                    <li>• Оптимизация производительности</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-6 h-6 text-red-600" />
                <span>Защита данных</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Технические меры</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Шифрование данных при передаче и хранении</li>
                    <li>• Регулярные резервные копии</li>
                    <li>• Многофакторная аутентификация</li>
                    <li>• Мониторинг безопасности 24/7</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Организационные меры</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Ограниченный доступ к данным</li>
                    <li>• Обучение персонала безопасности</li>
                    <li>• Регулярные аудиты безопасности</li>
                    <li>• Политики конфиденциальности для сотрудников</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third Party Services */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-6 h-6 text-orange-600" />
                <span>Сторонние сервисы</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Используемые сервисы</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <h4 className="font-semibold text-sm">OpenAI</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Обработка запросов к AI-ассистентам
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <h4 className="font-semibold text-sm">Google Cloud</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Хранение файлов и документов
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <h4 className="font-semibold text-sm">PostgreSQL</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Система управления базами данных
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <h4 className="font-semibold text-sm">Google Docs API</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Интеграция с документами Google
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-indigo-600" />
                <span>Права пользователей</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ваши права</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• <strong>Доступ:</strong> Получение копии ваших персональных данных</li>
                    <li>• <strong>Исправление:</strong> Обновление неточной или неполной информации</li>
                    <li>• <strong>Удаление:</strong> Запрос на удаление ваших данных</li>
                    <li>• <strong>Ограничение:</strong> Ограничение обработки ваших данных</li>
                    <li>• <strong>Переносимость:</strong> Получение данных в структурированном формате</li>
                    <li>• <strong>Возражение:</strong> Возражение против определенных видов обработки</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Как реализовать права</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Для реализации ваших прав обратитесь к нам через форму обратной связи 
                    или отправьте email на privacy@initiology.ai. Мы рассмотрим ваш запрос 
                    в течение 30 дней.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Контактная информация</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p><strong>Компания:</strong> Initiology AI Systems</p>
                <p><strong>Email:</strong> privacy@initiology.ai</p>
                <p><strong>Основатель:</strong> Вячеслав Лазаренко</p>
                <p><strong>Telegram:</strong> @vlazarenko</p>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  При возникновении вопросов о настоящей Политике конфиденциальности 
                  или обработке ваших данных, пожалуйста, свяжитесь с нами.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}