import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Shield, AlertTriangle, Scale, Globe } from "lucide-react";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Пользовательское соглашение</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Air Lab Assistant Builder by Initiology AI Systems
            </p>
            <Badge variant="secondary" className="mt-2">
              Версия 1.0 от 10 августа 2025
            </Badge>
          </div>

          {/* Terms Acceptance */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <span>Принятие условий</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Используя платформу Air Lab Assistant Builder, вы соглашаетесь с настоящими 
                Условиями использования. Если вы не согласны с какими-либо условиями, 
                прекратите использование сервиса.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Настоящие условия применяются ко всем пользователям платформы, включая 
                владельцев учетных записей, администраторов и гостевых пользователей.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-green-600" />
                <span>Описание сервиса</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Платформа предоставляет</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Инструменты для создания и управления AI-ассистентами</li>
                    <li>• Интеграцию с OpenAI API для обработки запросов</li>
                    <li>• Систему управления документами и базой знаний</li>
                    <li>• Возможности интеграции с внешними платформами</li>
                    <li>• Дизайнер виджетов для веб-сайтов</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Ограничения сервиса</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Требуется собственный API ключ OpenAI</li>
                    <li>• Ограничения на размер загружаемых файлов (20MB)</li>
                    <li>• Зависимость от доступности внешних сервисов</li>
                    <li>• Возможные временные перерывы в работе</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-purple-600" />
                <span>Обязанности пользователя</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Вы обязуются</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Предоставлять точную и актуальную информацию</li>
                    <li>• Защищать конфиденциальность своих учетных данных</li>
                    <li>• Использовать сервис в соответствии с законодательством</li>
                    <li>• Не загружать вредоносный или незаконный контент</li>
                    <li>• Соблюдать права интеллектуальной собственности</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Запрещенные действия</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Попытки взлома или нарушения безопасности</li>
                    <li>• Создание вредоносных или спам-ассистентов</li>
                    <li>• Нарушение работы платформы или других пользователей</li>
                    <li>• Использование для незаконных целей</li>
                    <li>• Передача учетных данных третьим лицам</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="w-6 h-6 text-orange-600" />
                <span>Интеллектуальная собственность</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Права Initiology AI Systems</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Исключительные права на платформу и код</li>
                    <li>• Торговые марки "Air Lab" и "Assistant Builder"</li>
                    <li>• Дизайн, интерфейс и архитектура системы</li>
                    <li>• Документация и методические материалы</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Права пользователя</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Права на созданный вами контент и ассистентов</li>
                    <li>• Право на экспорт ваших данных</li>
                    <li>• Ограниченная лицензия на использование платформы</li>
                    <li>• Права на интеграции и виджеты</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <span>Отказ от ответственности</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-500">
                  <h3 className="text-lg font-semibold mb-2">Важно</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Сервис предоставляется "как есть" без каких-либо гарантий. 
                    Мы не гарантируем бесперебойную работу или соответствие 
                    ваших конкретных потребностей.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Ограничение ответственности</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Не несем ответственности за содержание созданных ассистентов</li>
                    <li>• Не отвечаем за действия третьих лиц или внешних сервисов</li>
                    <li>• Не гарантируем сохранность данных при форс-мажоре</li>
                    <li>• Ограниченная ответственность за косвенные убытки</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy and Data */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-6 h-6 text-indigo-600" />
                <span>Конфиденциальность и данные</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Обработка ваших персональных данных регулируется нашей Политикой 
                  конфиденциальности, которая является неотъемлемой частью 
                  настоящих Условий использования.
                </p>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ключевые принципы</h3>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Минимизация сбора данных</li>
                    <li>• Прозрачность в обработке</li>
                    <li>• Защита конфиденциальности</li>
                    <li>• Право на удаление данных</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Changes and Termination */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Изменения и прекращение</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Изменение условий</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Мы оставляем за собой право изменять настоящие условия. 
                    О существенных изменениях мы уведомим вас заранее через 
                    платформу или email.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Прекращение использования</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Вы можете прекратить использование сервиса в любое время. 
                    Мы можем приостановить или прекратить ваш доступ при 
                    нарушении условий использования.
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
                <p><strong>Email:</strong> legal@initiology.ai</p>
                <p><strong>Основатель:</strong> Вячеслав Лазаренко</p>
                <p><strong>Telegram:</strong> @vlazarenko</p>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  По вопросам настоящих Условий использования обращайтесь 
                  к нам через указанные контакты.
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