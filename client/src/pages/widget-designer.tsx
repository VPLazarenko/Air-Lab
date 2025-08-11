import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { openaiClient } from "@/lib/openai-client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Palette, 
  Monitor, 
  Smartphone, 
  Copy, 
  Download,
  Eye,
  Code,
  MessageCircle,
  Maximize2,
  Minimize2,
  ExternalLink
} from "lucide-react";


interface WidgetConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  fontSize: number;
  fontFamily: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size: 'small' | 'medium' | 'large';
  showAvatar: boolean;
  showTyping: boolean;
  welcomeMessage: string;
  placeholder: string;
  buttonText: string;
  theme: 'light' | 'dark' | 'auto';
  avatarUrl?: string;
}

const defaultConfig: WidgetConfig = {
  primaryColor: '#10B981',
  secondaryColor: '#065F46',
  backgroundColor: '#FFFFFF',
  textColor: '#111827',
  borderRadius: 12,
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  position: 'bottom-right',
  size: 'medium',
  showAvatar: true,
  showTyping: true,
  welcomeMessage: 'Привет! Как дела? Чем могу помочь?',
  placeholder: 'Введите ваше сообщение...',
  buttonText: 'Отправить',
  theme: 'light',
  avatarUrl: ''
};

export default function WidgetDesigner() {
  const params = useParams();
  const assistantId = params.assistantId;
  const [config, setConfig] = useState<WidgetConfig>(defaultConfig);
  const [previewMode, setPreviewMode] = useState<'minimized' | 'open' | 'fullscreen'>('open');
  const [showCode, setShowCode] = useState(false);
  const { toast } = useToast();

  const { data: assistant } = useQuery({
    queryKey: ['/api/assistants', assistantId],
    queryFn: () => openaiClient.getAssistant(assistantId!),
    enabled: !!assistantId,
  });

  const updateConfig = (key: keyof WidgetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const generateWidgetCode = () => {
    return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Чат-виджет ${assistant?.name || 'Ассистент'}</title>
    <style>
        .chat-widget {
            position: fixed;
            ${config.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
            ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
            z-index: 10000;
            font-family: ${config.fontFamily};
        }
        
        .chat-button {
            width: ${config.size === 'small' ? '50px' : config.size === 'medium' ? '60px' : '70px'};
            height: ${config.size === 'small' ? '50px' : config.size === 'medium' ? '60px' : '70px'};
            background: ${config.primaryColor};
            border-radius: 50%;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
        }
        
        .chat-button:hover {
            transform: scale(1.1);
            background: ${config.secondaryColor};
        }
        
        .chat-window {
            position: absolute;
            bottom: ${config.size === 'small' ? '60px' : config.size === 'medium' ? '70px' : '80px'};
            right: 0;
            width: 350px;
            height: 500px;
            background: ${config.backgroundColor};
            border-radius: ${config.borderRadius}px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            display: none;
            flex-direction: column;
            overflow: hidden;
        }
        
        .chat-window.open {
            display: flex;
        }
        
        .chat-header {
            background: ${config.primaryColor};
            color: white;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
        }
        
        .avatar-initial {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: ${config.primaryColor};
            color: white;
            font-size: 14px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .chat-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background: ${config.backgroundColor};
        }
        
        .chat-input-area {
            padding: 15px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 10px;
        }
        
        .chat-input {
            flex: 1;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: ${config.borderRadius / 2}px;
            font-size: ${config.fontSize}px;
            color: ${config.textColor};
        }
        
        .send-button {
            background: ${config.primaryColor};
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: ${config.borderRadius / 2}px;
            cursor: pointer;
            font-size: ${config.fontSize}px;
        }
        
        .message {
            margin-bottom: 10px;
            padding: 8px 12px;
            border-radius: ${config.borderRadius / 2}px;
            max-width: 80%;
            font-size: ${config.fontSize}px;
        }
        
        .message.user {
            background: ${config.primaryColor};
            color: white;
            margin-left: auto;
        }
        
        .message.assistant {
            background: #f3f4f6;
            color: ${config.textColor};
        }
    </style>
</head>
<body>
    <div class="chat-widget">
        <button class="chat-button" onclick="toggleChat()">
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h8V12c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8v8h-8z"/>
                <circle cx="9" cy="12" r="1"/>
                <circle cx="12" cy="12" r="1"/>
                <circle cx="15" cy="12" r="1"/>
            </svg>
        </button>
        
        <div class="chat-window" id="chatWindow">
            <div class="chat-header">
                ${config.showAvatar ? (config.avatarUrl ? 
                    '<div class="avatar"><img src="' + config.avatarUrl + '" alt="Avatar" /></div>' : 
                    '<div class="avatar"><div class="avatar-initial">' + (assistant?.name || 'А').charAt(0).toUpperCase() + '</div></div>'
                ) : ''}
                <div>
                    <div style="font-weight: 600;">${assistant?.name || 'Ассистент'}</div>
                    <div style="font-size: 12px; opacity: 0.9;">В сети</div>
                </div>
            </div>
            
            <div class="chat-messages" id="chatMessages">
                <div class="message assistant">${config.welcomeMessage}</div>
            </div>
            
            <div class="chat-input-area">
                <input type="text" class="chat-input" placeholder="${config.placeholder}" id="messageInput" onkeypress="handleKeyPress(event)">
                <button class="send-button" onclick="sendMessage()">${config.buttonText}</button>
            </div>
        </div>
    </div>

    <script>
        let isOpen = false;
        
        function toggleChat() {
            const chatWindow = document.getElementById('chatWindow');
            isOpen = !isOpen;
            chatWindow.classList.toggle('open', isOpen);
        }
        
        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }
        
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const messages = document.getElementById('chatMessages');
            
            if (input.value.trim()) {
                // Добавить сообщение пользователя
                const userMessage = document.createElement('div');
                userMessage.className = 'message user';
                userMessage.textContent = input.value;
                messages.appendChild(userMessage);
                
                // Здесь должен быть вызов к API ассистента
                // Для демо добавим простой ответ
                setTimeout(() => {
                    const assistantMessage = document.createElement('div');
                    assistantMessage.className = 'message assistant';
                    assistantMessage.textContent = 'Спасибо за ваше сообщение! Это демо-ответ.';
                    messages.appendChild(assistantMessage);
                    messages.scrollTop = messages.scrollHeight;
                }, 1000);
                
                input.value = '';
                messages.scrollTop = messages.scrollHeight;
            }
        }
    </script>
</body>
</html>`;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateWidgetCode());
    toast({
      title: "Код скопирован",
      description: "HTML код виджета скопирован в буфер обмена",
    });
  };

  const downloadCode = () => {
    const code = generateWidgetCode();
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-widget-${assistant?.name || 'assistant'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Файл загружен",
      description: "HTML файл виджета успешно загружен",
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="min-h-[4rem] bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 lg:px-6 gap-3 lg:gap-0">
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Link href={`/playground/${assistantId}`}>
              <Button variant="ghost" size="sm" className="p-2 lg:px-3">
                <ArrowLeft className="w-4 h-4 lg:mr-2" />
                <span className="hidden lg:inline">Назад к ассистенту</span>
              </Button>
            </Link>
            
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base lg:text-lg font-semibold">Дизайнер виджетов</h1>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px] lg:max-w-none">
                  {assistant?.name || 'Новый ассистент'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-3">
            <Link href={`/chat/${assistantId}`}>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <ExternalLink className="w-4 h-4 lg:mr-2" />
                <span className="hidden lg:inline">Открыть чат</span>
              </Button>
            </Link>
            
            <Button onClick={copyCode} variant="outline" size="sm">
              <Copy className="w-4 h-4 lg:mr-2" />
              <span className="hidden sm:inline">Копировать код</span>
            </Button>
            
            <Button onClick={downloadCode} size="sm">
              <Download className="w-4 h-4 lg:mr-2" />
              <span className="hidden sm:inline">Скачать HTML</span>
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Settings Panel */}
          <div className="w-full lg:w-80 bg-white dark:bg-slate-800 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[40vh] lg:max-h-full">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Настройки дизайна</h2>
              
              <Tabs defaultValue="colors" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="colors">Цвета</TabsTrigger>
                  <TabsTrigger value="layout">Макет</TabsTrigger>
                  <TabsTrigger value="content">Контент</TabsTrigger>
                </TabsList>
                
                <TabsContent value="colors" className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="primaryColor">Основной цвет</Label>
                      <Input
                        id="primaryColor"
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => updateConfig('primaryColor', e.target.value)}
                        className="h-10"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="secondaryColor">Вторичный цвет</Label>
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={config.secondaryColor}
                        onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                        className="h-10"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="backgroundColor">Фон</Label>
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={config.backgroundColor}
                        onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                        className="h-10"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="textColor">Цвет текста</Label>
                      <Input
                        id="textColor"
                        type="color"
                        value={config.textColor}
                        onChange={(e) => updateConfig('textColor', e.target.value)}
                        className="h-10"
                      />
                    </div>
                    
                    <div>
                      <Label>Тема</Label>
                      <Select value={config.theme} onValueChange={(value: 'light' | 'dark' | 'auto') => updateConfig('theme', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Светлая</SelectItem>
                          <SelectItem value="dark">Темная</SelectItem>
                          <SelectItem value="auto">Авто</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="layout" className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label>Позиция</Label>
                      <Select value={config.position} onValueChange={(value: any) => updateConfig('position', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-right">Снизу справа</SelectItem>
                          <SelectItem value="bottom-left">Снизу слева</SelectItem>
                          <SelectItem value="top-right">Сверху справа</SelectItem>
                          <SelectItem value="top-left">Сверху слева</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Размер</Label>
                      <Select value={config.size} onValueChange={(value: any) => updateConfig('size', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Маленький</SelectItem>
                          <SelectItem value="medium">Средний</SelectItem>
                          <SelectItem value="large">Большой</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Скругление углов: {config.borderRadius}px</Label>
                      <Slider
                        value={[config.borderRadius]}
                        onValueChange={([value]) => updateConfig('borderRadius', value)}
                        max={30}
                        min={0}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label>Размер шрифта: {config.fontSize}px</Label>
                      <Slider
                        value={[config.fontSize]}
                        onValueChange={([value]) => updateConfig('fontSize', value)}
                        max={20}
                        min={10}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label>Шрифт</Label>
                      <Select value={config.fontFamily} onValueChange={(value) => updateConfig('fontFamily', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                          <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                          <SelectItem value="Open Sans, sans-serif">Open Sans</SelectItem>
                          <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showAvatar">Показать аватар</Label>
                      <Switch
                        id="showAvatar"
                        checked={config.showAvatar}
                        onCheckedChange={(checked) => updateConfig('showAvatar', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showTyping">Индикатор печати</Label>
                      <Switch
                        id="showTyping"
                        checked={config.showTyping}
                        onCheckedChange={(checked) => updateConfig('showTyping', checked)}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="welcomeMessage">Приветственное сообщение</Label>
                      <Textarea
                        id="welcomeMessage"
                        value={config.welcomeMessage}
                        onChange={(e) => updateConfig('welcomeMessage', e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="placeholder">Плейсхолдер</Label>
                      <Input
                        id="placeholder"
                        value={config.placeholder}
                        onChange={(e) => updateConfig('placeholder', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="buttonText">Текст кнопки</Label>
                      <Input
                        id="buttonText"
                        value={config.buttonText}
                        onChange={(e) => updateConfig('buttonText', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="avatarUrl">URL аватарки</Label>
                      <Input
                        id="avatarUrl"
                        value={config.avatarUrl || ''}
                        onChange={(e) => updateConfig('avatarUrl', e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Введите URL изображения или оставьте пустым для использования первой буквы имени
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Preview Controls */}
              <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="font-semibold">Превью виджета</h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={previewMode === 'minimized' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('minimized')}
                      >
                        <Minimize2 className="w-4 h-4 mr-1" />
                        Мини
                      </Button>
                      <Button
                        variant={previewMode === 'open' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('open')}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Открыт
                      </Button>
                      <Button
                        variant={previewMode === 'fullscreen' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('fullscreen')}
                      >
                        <Maximize2 className="w-4 h-4 mr-1" />
                        Полный
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={showCode ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowCode(!showCode)}
                    >
                      <Code className="w-4 h-4 mr-1" />
                      {showCode ? 'Превью' : 'Код'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 p-6 overflow-auto">
                {showCode ? (
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        HTML код виджета
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-auto h-full">
                        <code>{generateWidgetCode()}</code>
                      </pre>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="h-full flex items-center justify-center relative">
                    {/* Widget Preview */}
                    <div
                      className="relative bg-white rounded-lg shadow-lg overflow-hidden"
                      style={{
                        width: previewMode === 'fullscreen' ? '100%' : 
                               previewMode === 'open' ? '350px' : '60px',
                        height: previewMode === 'fullscreen' ? '100%' : 
                                previewMode === 'open' ? '500px' : '60px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {previewMode === 'minimized' ? (
                        <div
                          className="w-full h-full rounded-full flex items-center justify-center cursor-pointer"
                          style={{ 
                            backgroundColor: config.primaryColor,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                          }}
                          onClick={() => setPreviewMode('open')}
                        >
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="h-full flex flex-col bg-white rounded-lg shadow-xl overflow-hidden">
                          {/* Header */}
                          <div
                            className="p-4 flex items-center gap-3 text-white"
                            style={{ backgroundColor: config.primaryColor }}
                          >
                            {config.showAvatar && (
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                                {config.avatarUrl ? (
                                  <img 
                                    src={config.avatarUrl} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: config.primaryColor }}>
                                    {(assistant?.name || 'А').charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-semibold text-lg">{assistant?.name || 'Виртуальный Ассистент'}</div>
                              <div className="text-sm opacity-90 flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                В сети
                              </div>
                            </div>
                            {previewMode === 'open' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPreviewMode('minimized')}
                                className="text-white hover:bg-white/20 p-1"
                              >
                                <Minimize2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          {/* Messages */}
                          <div 
                            className="flex-1 p-4 overflow-y-auto space-y-4"
                            style={{ backgroundColor: config.backgroundColor }}
                          >
                            {/* Assistant welcome message */}
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: config.primaryColor }}>
                                {config.avatarUrl ? (
                                  <img 
                                    src={config.avatarUrl} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                                    {(assistant?.name || 'А').charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div
                                className="flex-1 p-3 rounded-2xl rounded-tl-sm max-w-[80%]"
                                style={{
                                  backgroundColor: '#f8f9fa',
                                  color: config.textColor,
                                  fontSize: config.fontSize,
                                  fontFamily: config.fontFamily
                                }}
                              >
                                <div className="font-medium text-sm mb-1">{assistant?.name || 'Виртуальный Ассистент'}</div>
                                <div>{config.welcomeMessage}</div>
                              </div>
                            </div>
                            
                            {/* User message */}
                            <div className="flex justify-end">
                              <div
                                className="p-3 rounded-2xl rounded-tr-sm max-w-[80%] text-white"
                                style={{
                                  backgroundColor: config.primaryColor,
                                  fontSize: config.fontSize,
                                  fontFamily: config.fontFamily
                                }}
                              >
                                Здравствуйте! 👋 Добро пожаловать в цифровую помощницу! Название команды). Чем я могу вам помочь? Если у вас есть вопросы о наших продуктах, услугах или о чём-то ещё, пожалуйста, сообщите нам!
                              </div>
                            </div>
                            
                            {/* Assistant response */}
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: config.primaryColor }}>
                                {config.avatarUrl ? (
                                  <img 
                                    src={config.avatarUrl} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                                    {(assistant?.name || 'А').charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div
                                className="flex-1 p-3 rounded-2xl rounded-tl-sm max-w-[80%]"
                                style={{
                                  backgroundColor: '#f8f9fa',
                                  color: config.textColor,
                                  fontSize: config.fontSize,
                                  fontFamily: config.fontFamily
                                }}
                              >
                                <div className="font-medium text-sm mb-1">{assistant?.name || 'Виртуальный Ассистент'}</div>
                                <div>Привет! 👋 Добро пожаловать в цифровую помощницу! Чем я могу вам помочь? Если у вас есть вопросы о наших продуктах, услугах или о чём-то ещё, пожалуйста, сообщите нам!</div>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                  <span>👍</span>
                                  <span>👎</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Input Area */}
                          <div className="p-4 border-t border-gray-200">
                            <div className="flex gap-2 items-end">
                              <div className="flex-1 relative">
                                <input
                                  type="text"
                                  placeholder={config.placeholder}
                                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none"
                                  style={{
                                    fontSize: config.fontSize,
                                    fontFamily: config.fontFamily
                                  }}
                                />
                                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1">
                                  📎
                                </button>
                              </div>
                              <div className="text-xs text-gray-400">@ автор: {assistant?.name || 'Ваш'}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}