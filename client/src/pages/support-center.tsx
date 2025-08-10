import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  HelpCircle, MessageCircle, Mail, Phone, Clock, 
  Search, FileText, AlertCircle, CheckCircle, Users
} from "lucide-react";
import { SiTelegram, SiWhatsapp } from "react-icons/si";
import Footer from "@/components/Footer";

export default function SupportCenter() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Центр поддержки</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Мы здесь, чтобы помочь вам с любыми вопросами по платформе
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <SiTelegram className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold mb-2">Telegram</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Быстрая поддержка в реальном времени
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://t.me/vlazarenko" target="_blank" rel="noopener noreferrer">
                    Написать в Telegram
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <SiWhatsapp className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">WhatsApp</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Персональная консультация
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://wa.me/message" target="_blank" rel="noopener noreferrer">
                    Открыть WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Mail className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Подробные запросы и документация
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="mailto:support@initiology.ai">
                    support@initiology.ai
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="w-6 h-6 text-blue-600" />
                <span>Часто задаваемые вопросы</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold mb-2">Как получить OpenAI API ключ?</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Зарегистрируйтесь на platform.openai.com, перейдите в раздел API Keys 
                    и создайте новый ключ. Убедитесь, что на вашем аккаунте есть средства для оплаты запросов.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold mb-2">Почему ассистент не отвечает?</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Проверьте правильность API ключа, наличие средств на балансе OpenAI, 
                    и убедитесь, что ассистент правильно настроен с системными инструкциями.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold mb-2">Как загрузить документы для базы знаний?</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Перейдите в File Manager, выберите "Загрузить файл" и выберите документы. 
                    Поддерживаются форматы PDF, TXT, DOCX до 20MB.
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="font-semibold mb-2">Можно ли интегрировать ассистента с моим сайтом?</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Да! Используйте дизайнер виджетов для создания чат-виджета, 
                    затем скопируйте сгенерированный HTML код на ваш сайт.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-semibold mb-2">Как обеспечивается безопасность данных?</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Мы используем шифрование данных, безопасные соединения HTTPS, 
                    и не храним ваши API ключи в открытом виде. Все данные защищены современными протоколами.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Request Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-6 h-6 text-green-600" />
                <span>Отправить запрос в поддержку</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Имя</label>
                    <Input placeholder="Ваше имя" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input placeholder="your@email.com" type="email" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Тема обращения</label>
                  <select className="w-full border rounded-md px-3 py-2 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600">
                    <option>Техническая проблема</option>
                    <option>Вопрос по функциональности</option>
                    <option>Предложение по улучшению</option>
                    <option>Проблема с оплатой</option>
                    <option>Другое</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Описание проблемы</label>
                  <Textarea 
                    placeholder="Подробно опишите вашу проблему или вопрос..."
                    rows={5}
                  />
                </div>

                <Button className="w-full md:w-auto">
                  <Mail className="w-4 h-4 mr-2" />
                  Отправить запрос
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Status and Availability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <span>Время работы поддержки</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Понедельник - Пятница</span>
                    <Badge variant="outline">9:00 - 18:00 MSK</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Суббота - Воскресенье</span>
                    <Badge variant="outline">10:00 - 16:00 MSK</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Telegram/WhatsApp</span>
                    <Badge variant="secondary">24/7</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span>Статус сервисов</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Веб-платформа</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Работает
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>API сервис</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Работает
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>База данных</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Работает
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-purple-600" />
                <span>Полезные ресурсы</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-semibold">Документация</div>
                    <div className="text-sm text-gray-500">Полное руководство пользователя</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-semibold">Видео-уроки</div>
                    <div className="text-sm text-gray-500">Обучающие материалы</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-semibold">API Reference</div>
                    <div className="text-sm text-gray-500">Техническая документация</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-semibold">Форум сообщества</div>
                    <div className="text-sm text-gray-500">Обсуждения пользователей</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-semibold">Новости и обновления</div>
                    <div className="text-sm text-gray-500">Последние изменения</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-semibold">Telegram канал</div>
                    <div className="text-sm text-gray-500">Новости и советы</div>
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