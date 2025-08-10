import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, Globe, Clock } from "lucide-react";
import Footer from "@/components/Footer";

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Условия использования</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Air Lab Assistant Builder by Initiology AI Systems
            </p>
            <Badge variant="secondary" className="mt-2">
              Действуют с 10 августа 2025
            </Badge>
          </div>

          {/* General Terms */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <span>Общие положения</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Настоящие Условия использования регулируют доступ и использование 
                  платформы Air Lab Assistant Builder, предоставляемой компанией 
                  Initiology AI Systems.
                </p>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Определения</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• <strong>Платформа</strong> - веб-сервис Air Lab Assistant Builder</li>
                    <li>• <strong>Пользователь</strong> - физическое или юридическое лицо, использующее платформу</li>
                    <li>• <strong>Контент</strong> - любая информация, размещаемая на платформе</li>
                    <li>• <strong>Сервис</strong> - функциональность платформы в целом</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Rights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-green-600" />
                <span>Права использования</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Предоставляемые права</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Неисключительное право использования платформы</li>
                    <li>• Создание и управление AI-ассистентами</li>
                    <li>• Загрузка и управление документами</li>
                    <li>• Экспорт созданного контента</li>
                    <li>• Использование API и интеграций</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Ограничения</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Запрет на коммерческое использование без соглашения</li>
                    <li>• Недопустимость обратной разработки</li>
                    <li>• Ограничения на автоматизированный доступ</li>
                    <li>• Запрет на создание конкурирующих сервисов</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-6 h-6 text-purple-600" />
                <span>Допустимое использование</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-green-600">Разрешено</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Создание образовательных и информационных ассистентов</li>
                    <li>• Автоматизация бизнес-процессов</li>
                    <li>• Интеграция с законными веб-сайтами и приложениями</li>
                    <li>• Обучение и тестирование AI-технологий</li>
                    <li>• Научные исследования и разработки</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-red-600">Запрещено</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Создание вредоносного или мошеннического контента</li>
                    <li>• Нарушение авторских прав и интеллектуальной собственности</li>
                    <li>• Распространение спама или нежелательных сообщений</li>
                    <li>• Попытки взлома или нарушения безопасности</li>
                    <li>• Использование для незаконных целей</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-6 h-6 text-orange-600" />
                <span>Доступность сервиса</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Гарантии доступности</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Стремимся обеспечить 99.5% времени работы</li>
                    <li>• Плановые обслуживания с предварительным уведомлением</li>
                    <li>• Мониторинг производительности 24/7</li>
                    <li>• Быстрое восстановление при сбоях</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Ограничения ответственности</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Не гарантируем 100% времени работы</li>
                    <li>• Возможны технические перерывы</li>
                    <li>• Зависимость от внешних сервисов (OpenAI, Google)</li>
                    <li>• Форс-мажорные обстоятельства</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updates and Changes */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Обновления и изменения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Обновления платформы</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Мы регулярно обновляем платформу для улучшения функциональности, 
                    безопасности и пользовательского опыта. Основные обновления 
                    анонсируются заранее.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Изменения условий</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Мы оставляем за собой право изменять настоящие условия. 
                    О существенных изменениях будем уведомлять пользователей 
                    не менее чем за 14 дней до вступления в силу.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liability and Disclaimers */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ответственность и отказы от гарантий</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-500">
                  <h3 className="text-lg font-semibold mb-2">Важное предупреждение</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Платформа предоставляется "как есть" без каких-либо явных 
                    или подразумеваемых гарантий. Пользователь несет полную 
                    ответственность за использование созданных ассистентов.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Ограничение ответственности</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Максимальная ответственность ограничена стоимостью услуг</li>
                    <li>• Исключение ответственности за косвенные убытки</li>
                    <li>• Не отвечаем за действия созданных ассистентов</li>
                    <li>• Ограниченная ответственность за потерю данных</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Контакты и применимое право</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Контактная информация</h3>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <p><strong>Компания:</strong> Initiology AI Systems</p>
                    <p><strong>Email:</strong> legal@initiology.ai</p>
                    <p><strong>Основатель:</strong> Вячеслав Лазаренко</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Применимое право</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Настоящие условия регулируются международным правом в области 
                    информационных технологий. Споры решаются путем переговоров 
                    или в арбитражном порядке.
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