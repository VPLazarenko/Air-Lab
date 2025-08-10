import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, Users, Bot, MessageSquare, Upload, 
  Settings, Smartphone, Monitor, HelpCircle, CheckCircle
} from "lucide-react";
import Footer from "@/components/Footer";

export default function UserInstructions() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Инструкции по использованию</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Пошаговое руководство для работы с платформой Air Lab Assistant Builder
            </p>
          </div>

          {/* Getting Started */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="w-6 h-6 text-green-600" />
                <span>Начало работы</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full p-1 mt-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Шаг 1: Регистрация и вход</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Создайте учетную запись или войдите с помощью демо-данных (admin/admin).
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full p-1 mt-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Шаг 2: Настройка API ключа</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Перейдите в профиль пользователя и добавьте ваш OpenAI API ключ.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full p-1 mt-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Шаг 3: Создание первого ассистента</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      На главной странице нажмите "Создать ассистента" и заполните основную информацию.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Features Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-6 h-6 text-blue-600" />
                  <span>Создание ассистента</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold">Основные настройки:</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• <strong>Имя:</strong> Выберите понятное имя для ассистента</li>
                    <li>• <strong>Описание:</strong> Кратко опишите назначение</li>
                    <li>• <strong>Инструкции:</strong> Задайте поведение и стиль общения</li>
                    <li>• <strong>Модель:</strong> Выберите подходящую GPT модель</li>
                  </ul>
                  <Badge variant="secondary">Совет: Начните с простых инструкций</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-6 h-6 text-green-600" />
                  <span>Загрузка документов</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold">Поддерживаемые форматы:</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• <strong>PDF:</strong> Документы и руководства</li>
                    <li>• <strong>TXT:</strong> Текстовые файлы</li>
                    <li>• <strong>DOCX:</strong> Word документы</li>
                    <li>• <strong>Google Docs:</strong> Через API интеграцию</li>
                  </ul>
                  <Badge variant="secondary">Лимит: 20MB на файл</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                  <span>Использование чата</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold">Возможности чата:</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Отправка текстовых сообщений</li>
                    <li>• Просмотр истории диалогов</li>
                    <li>• Экспорт в PDF</li>
                    <li>• Поддержка markdown</li>
                  </ul>
                  <Badge variant="secondary">Горячие клавиши: Ctrl+Enter</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-6 h-6 text-orange-600" />
                  <span>Настройки профиля</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold">Конфигурация:</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• OpenAI API ключ</li>
                    <li>• Языковые настройки</li>
                    <li>• Тема оформления</li>
                    <li>• Уведомления</li>
                  </ul>
                  <Badge variant="secondary">Автосохранение включено</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Usage */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Продвинутое использование</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <Smartphone className="w-5 h-5 text-green-500" />
                    <span>Интеграции</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <h4 className="font-semibold text-sm">Telegram Bot</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Подключите ассистента к Telegram через Bot API
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <h4 className="font-semibold text-sm">WhatsApp Business</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Интеграция с WhatsApp Business API
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <h4 className="font-semibold text-sm">VK Group</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Подключение к группам ВКонтакте
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <Monitor className="w-5 h-5 text-blue-500" />
                    <span>Дизайнер виджетов</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <h4 className="font-semibold text-sm">Настройка внешнего вида</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Создайте уникальный дизайн чат-виджета
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <h4 className="font-semibold text-sm">Генерация кода</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Получите готовый HTML код для вашего сайта
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <h4 className="font-semibold text-sm">Предварительный просмотр</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Тестируйте виджет в реальном времени
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips and Best Practices */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="w-6 h-6 text-yellow-600" />
                <span>Советы и лучшие практики</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-green-600">✓ Рекомендуется</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Давайте четкие и подробные инструкции ассистенту</li>
                    <li>• Регулярно обновляйте базу знаний документами</li>
                    <li>• Тестируйте ассистента перед развертыванием</li>
                    <li>• Используйте различные модели для разных задач</li>
                    <li>• Создавайте резервные копии важных настроек</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-600">✗ Избегайте</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Слишком длинных системных инструкций</li>
                    <li>• Загрузки конфиденциальных данных</li>
                    <li>• Использования устаревших API ключей</li>
                    <li>• Создания дублирующих ассистентов</li>
                    <li>• Игнорирования предупреждений системы</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Решение проблем</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold">Ассистент не отвечает</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Проверьте правильность API ключа OpenAI и наличие средств на балансе.
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">Файлы не загружаются</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Убедитесь, что размер файла не превышает 20MB и формат поддерживается.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold">Ошибки в интеграциях</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Проверьте правильность токенов и настроек внешних сервисов.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold">Нужна дополнительная помощь?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Обратитесь в службу поддержки через виджет связи в футере сайта.
                  </p>
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