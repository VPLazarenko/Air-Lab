import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, Bot, MessageSquare, Phone, ExternalLink } from "lucide-react";

interface IntegrationModalProps {
  open: boolean;
  onClose: () => void;
  integration: 'telegram' | 'vk' | 'whatsapp' | 'openai' | null;
}

// Схемы валидации для каждой интеграции
const telegramSchema = z.object({
  botToken: z.string().min(1, "Введите токен бота"),
  assistantId: z.string().min(1, "Введите ID ассистента"),
  openaiApiKey: z.string().min(1, "Введите OpenAI API Key"),
  webhookUrl: z.string().optional().or(z.literal("")),
});

const vkSchema = z.object({
  accessToken: z.string().min(1, "Введите токен доступа"),
  groupId: z.string().min(1, "Введите ID группы"),
  assistantId: z.string().min(1, "Введите ID ассистента"),
  openaiApiKey: z.string().min(1, "Введите OpenAI API Key"),
});

const whatsappSchema = z.object({
  phoneNumberId: z.string().min(1, "Введите ID номера телефона"),
  accessToken: z.string().min(1, "Введите токен доступа"),
  verifyToken: z.string().min(1, "Введите токен верификации"),
  webhookUrl: z.string().url("Введите корректный URL").optional().or(z.literal("")),
});

const openaiSchema = z.object({
  apiKey: z.string().min(1, "Введите API ключ OpenAI"),
  assistantId: z.string().min(1, "Введите ID ассистента"),
  model: z.string().default("gpt-4o"),
});

type TelegramFormData = z.infer<typeof telegramSchema>;
type VkFormData = z.infer<typeof vkSchema>;
type WhatsappFormData = z.infer<typeof whatsappSchema>;
type OpenaiFormData = z.infer<typeof openaiSchema>;

export function IntegrationModal({ open, onClose, integration }: IntegrationModalProps) {
  const [copied, setCopied] = useState(false);
  const [currentTab, setCurrentTab] = useState("config");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const telegramForm = useForm<TelegramFormData>({
    resolver: zodResolver(telegramSchema),
    defaultValues: { botToken: "", assistantId: "", openaiApiKey: "", webhookUrl: "" },
  });

  const vkForm = useForm<VkFormData>({
    resolver: zodResolver(vkSchema),
    defaultValues: { accessToken: "", groupId: "", assistantId: "", openaiApiKey: "" },
  });

  const whatsappForm = useForm<WhatsappFormData>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: { phoneNumberId: "", accessToken: "", verifyToken: "", webhookUrl: "" },
  });

  const openaiForm = useForm<OpenaiFormData>({
    resolver: zodResolver(openaiSchema),
    defaultValues: { apiKey: "", assistantId: "", model: "gpt-4o" },
  });

  // Мутации для создания интеграций
  const telegramMutation = useMutation({
    mutationFn: async (data: TelegramFormData) => {
      await apiRequest(`/api/integrations`, {
        method: "POST",
        body: JSON.stringify({
          type: "telegram",
          name: "Telegram Bot",
          config: {
            botToken: data.botToken,
            assistantId: data.assistantId,
            openaiApiKey: data.openaiApiKey,
            webhookUrl: data.webhookUrl || "",
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      toast({ title: "Успешно", description: "Интеграция Telegram настроена!" });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const vkMutation = useMutation({
    mutationFn: async (data: VkFormData) => {
      await apiRequest(`/api/integrations`, {
        method: "POST",
        body: JSON.stringify({
          type: "vk",
          name: "VK Bot",
          config: {
            accessToken: data.accessToken,
            groupId: data.groupId,
            assistantId: data.assistantId,
            openaiApiKey: data.openaiApiKey,
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      toast({ title: "Успешно", description: "Интеграция VK настроена!" });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const whatsappMutation = useMutation({
    mutationFn: async (data: WhatsappFormData) => {
      await apiRequest(`/api/integrations`, {
        method: "POST",
        body: JSON.stringify({
          type: "whatsapp",
          name: "WhatsApp Business",
          config: {
            phoneNumberId: data.phoneNumberId,
            accessToken: data.accessToken,
            verifyToken: data.verifyToken,
            webhookUrl: data.webhookUrl || "",
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      toast({ title: "Успешно", description: "Интеграция WhatsApp настроена!" });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const openaiMutation = useMutation({
    mutationFn: async (data: OpenaiFormData) => {
      await apiRequest(`/api/integrations`, {
        method: "POST",
        body: JSON.stringify({
          type: "openai",
          name: "OpenAI Assistant",
          config: {
            apiKey: data.apiKey,
            assistantId: data.assistantId,
            model: data.model,
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      toast({ title: "Успешно", description: "Интеграция OpenAI настроена!" });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIntegrationTitle = () => {
    switch (integration) {
      case 'telegram': return 'Настройка Telegram Bot';
      case 'vk': return 'Настройка VK Бот';
      case 'whatsapp': return 'Настройка WhatsApp Business';
      case 'openai': return 'Настройка OpenAI Assistant';
      default: return 'Настройка интеграции';
    }
  };

  const getIntegrationIcon = () => {
    switch (integration) {
      case 'telegram': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'vk': return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'whatsapp': return <Phone className="w-5 h-5 text-green-500" />;
      case 'openai': return <Bot className="w-5 h-5 text-purple-500" />;
      default: return null;
    }
  };

  const onSubmitTelegram = (data: TelegramFormData) => {
    telegramMutation.mutate(data);
  };

  const onSubmitVk = (data: VkFormData) => {
    vkMutation.mutate(data);
  };

  const onSubmitWhatsapp = (data: WhatsappFormData) => {
    whatsappMutation.mutate(data);
  };

  const onSubmitOpenai = (data: OpenaiFormData) => {
    openaiMutation.mutate(data);
  };

  if (!integration) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIntegrationIcon()}
            {getIntegrationTitle()}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Настройки</TabsTrigger>
            <TabsTrigger value="instructions">Инструкция</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            {integration === 'telegram' && (
              <form onSubmit={telegramForm.handleSubmit(onSubmitTelegram)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="botToken">Токен бота</Label>
                  <Input
                    id="botToken"
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                    {...telegramForm.register("botToken")}
                  />
                  {telegramForm.formState.errors.botToken && (
                    <p className="text-sm text-red-500">{telegramForm.formState.errors.botToken.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assistantId">ID ассистента</Label>
                  <Input
                    id="assistantId"
                    placeholder="asst_..."
                    {...telegramForm.register("assistantId")}
                  />
                  {telegramForm.formState.errors.assistantId && (
                    <p className="text-sm text-red-500">{telegramForm.formState.errors.assistantId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                  <Input
                    id="openaiApiKey"
                    type="password"
                    placeholder="sk-..."
                    {...telegramForm.register("openaiApiKey")}
                  />
                  {telegramForm.formState.errors.openaiApiKey && (
                    <p className="text-sm text-red-500">{telegramForm.formState.errors.openaiApiKey.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL (опционально)</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://yourapp.com/webhook/telegram"
                    {...telegramForm.register("webhookUrl")}
                  />
                  {telegramForm.formState.errors.webhookUrl && (
                    <p className="text-sm text-red-500">{telegramForm.formState.errors.webhookUrl.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={telegramMutation.isPending}>
                  {telegramMutation.isPending ? "Сохранение..." : "Сохранить настройки Telegram"}
                </Button>
              </form>
            )}

            {integration === 'vk' && (
              <form onSubmit={vkForm.handleSubmit(onSubmitVk)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accessToken">Токен доступа</Label>
                  <Input
                    id="accessToken"
                    placeholder="vk1.a.abcdefghijklmnop..."
                    {...vkForm.register("accessToken")}
                  />
                  {vkForm.formState.errors.accessToken && (
                    <p className="text-sm text-red-500">{vkForm.formState.errors.accessToken.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupId">ID группы</Label>
                  <Input
                    id="groupId"
                    placeholder="123456789"
                    {...vkForm.register("groupId")}
                  />
                  {vkForm.formState.errors.groupId && (
                    <p className="text-sm text-red-500">{vkForm.formState.errors.groupId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assistantId">ID ассистента</Label>
                  <Input
                    id="assistantId"
                    placeholder="asst_..."
                    {...vkForm.register("assistantId")}
                  />
                  {vkForm.formState.errors.assistantId && (
                    <p className="text-sm text-red-500">{vkForm.formState.errors.assistantId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                  <Input
                    id="openaiApiKey"
                    type="password"
                    placeholder="sk-..."
                    {...vkForm.register("openaiApiKey")}
                  />
                  {vkForm.formState.errors.openaiApiKey && (
                    <p className="text-sm text-red-500">{vkForm.formState.errors.openaiApiKey.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={vkMutation.isPending}>
                  {vkMutation.isPending ? "Сохранение..." : "Сохранить настройки VK"}
                </Button>
              </form>
            )}

            {integration === 'whatsapp' && (
              <form onSubmit={whatsappForm.handleSubmit(onSubmitWhatsapp)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumberId">ID номера телефона</Label>
                  <Input
                    id="phoneNumberId"
                    placeholder="123456789012345"
                    {...whatsappForm.register("phoneNumberId")}
                  />
                  {whatsappForm.formState.errors.phoneNumberId && (
                    <p className="text-sm text-red-500">{whatsappForm.formState.errors.phoneNumberId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessToken">Токен доступа</Label>
                  <Input
                    id="accessToken"
                    placeholder="EAABwz..."
                    {...whatsappForm.register("accessToken")}
                  />
                  {whatsappForm.formState.errors.accessToken && (
                    <p className="text-sm text-red-500">{whatsappForm.formState.errors.accessToken.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verifyToken">Токен верификации</Label>
                  <Input
                    id="verifyToken"
                    placeholder="your_verify_token"
                    {...whatsappForm.register("verifyToken")}
                  />
                  {whatsappForm.formState.errors.verifyToken && (
                    <p className="text-sm text-red-500">{whatsappForm.formState.errors.verifyToken.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL (опционально)</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://yourapp.com/webhook/whatsapp"
                    {...whatsappForm.register("webhookUrl")}
                  />
                  {whatsappForm.formState.errors.webhookUrl && (
                    <p className="text-sm text-red-500">{whatsappForm.formState.errors.webhookUrl.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={whatsappMutation.isPending}>
                  {whatsappMutation.isPending ? "Сохранение..." : "Сохранить настройки WhatsApp"}
                </Button>
              </form>
            )}

            {integration === 'openai' && (
              <form onSubmit={openaiForm.handleSubmit(onSubmitOpenai)} className="space-y-4">
                <Alert>
                  <Bot className="h-4 w-4" />
                  <AlertDescription>
                    Настройте подключение к OpenAI Assistants API для использования готовых ассистентов
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API ключ OpenAI</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-..."
                    {...openaiForm.register("apiKey")}
                  />
                  {openaiForm.formState.errors.apiKey && (
                    <p className="text-sm text-red-500">{openaiForm.formState.errors.apiKey.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assistantId">ID Ассистента</Label>
                  <Input
                    id="assistantId"
                    placeholder="asst_..."
                    {...openaiForm.register("assistantId")}
                  />
                  {openaiForm.formState.errors.assistantId && (
                    <p className="text-sm text-red-500">{openaiForm.formState.errors.assistantId.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    ID ассистента можно найти в OpenAI Playground
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Модель (по умолчанию)</Label>
                  <Input
                    id="model"
                    placeholder="gpt-4o"
                    {...openaiForm.register("model")}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={openaiMutation.isPending}>
                  {openaiMutation.isPending ? "Сохранение..." : "Сохранить настройки OpenAI"}
                </Button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="instructions" className="space-y-4">
            {integration === 'telegram' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">1. Создайте бота в Telegram</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-gray-600">Напишите @BotFather в Telegram и создайте нового бота:</p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm">
                      /newbot<br/>
                      Введите имя бота<br/>
                      Введите username бота (должен заканчиваться на 'bot')
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">2. Скопируйте токен</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      BotFather отправит вам токен. Скопируйте его и вставьте в поле "Токен бота"
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">3. Настройте webhook (опционально)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Для получения сообщений в реальном времени настройте webhook URL
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {integration === 'vk' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">1. Создайте сообщество VK</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Перейдите в VK, создайте сообщество и получите токен доступа в настройках API
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">2. Настройте Callback API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      В настройках сообщества включите Callback API и укажите URL для получения событий
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {integration === 'whatsapp' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">1. Создайте приложение Facebook</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Зарегистрируйтеся в Facebook for Developers и создайте приложение WhatsApp Business
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">2. Получите токены</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      В разделе WhatsApp получите Phone Number ID и Access Token
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {integration === 'openai' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">1. Получите API ключ OpenAI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Перейдите на <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">
                        platform.openai.com <ExternalLink className="w-3 h-3" />
                      </a> и создайте новый API ключ
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">2. Создайте ассистента</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      В <a href="https://platform.openai.com/assistants" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">
                        OpenAI Playground <ExternalLink className="w-3 h-3" />
                      </a> создайте нового ассистента и скопируйте его ID
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">3. Найдите ID ассистента</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      ID ассистента начинается с "asst_" и находится в URL или в настройках ассистента
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}