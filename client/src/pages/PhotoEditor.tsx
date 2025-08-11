import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Wand2, 
  Settings, 
  MessageSquare, 
  Download, 
  Share2, 
  Eye, 
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Bot,
  User,
  Palette
} from "lucide-react";
import type { PhotoEditorSession, PhotoEditorImage, PhotoEditorSettings } from "@shared/schema";

export default function PhotoEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentSession, setCurrentSession] = useState<PhotoEditorSession | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [settings, setSettings] = useState<PhotoEditorSettings>({
    model: "gpt-4o",
    quality: "standard",
    style: "vivid",
    size: "1024x1024",
    responseFormat: "url"
  });

  // Получение сессий пользователя
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/photo-editor/sessions"],
  });

  // Получение изображений текущей сессии
  const { data: sessionImages } = useQuery({
    queryKey: ["/api/photo-editor/sessions", currentSession?.id, "images"],
    enabled: !!currentSession?.id,
  });

  // Получение чата текущей сессии
  const { data: sessionChat } = useQuery({
    queryKey: ["/api/photo-editor/sessions", currentSession?.id, "chat"],
    enabled: !!currentSession?.id,
  });

  // Создание новой сессии
  const createSessionMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; settings: PhotoEditorSettings }) => {
      return await apiRequest("POST", "/api/photo-editor/sessions", data);
    },
    onSuccess: (session) => {
      setCurrentSession(session);
      queryClient.invalidateQueries({ queryKey: ["/api/photo-editor/sessions"] });
      toast({
        title: "Успешно",
        description: "Новая сессия создана"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать сессию",
        variant: "destructive"
      });
    }
  });

  // Генерация изображения
  const generateImageMutation = useMutation({
    mutationFn: async (data: { prompt: string; settings?: PhotoEditorSettings; sessionId?: string }) => {
      return await apiRequest("POST", "/api/photo-editor/generate", data);
    },
    onSuccess: (result) => {
      setSelectedImage(result.url);
      queryClient.invalidateQueries({ queryKey: ["/api/photo-editor/sessions", currentSession?.id, "images"] });
      toast({
        title: "Изображение создано",
        description: "Новое изображение успешно сгенерировано"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка генерации",
        description: error.message || "Не удалось сгенерировать изображение",
        variant: "destructive"
      });
    }
  });

  // Редактирование изображения
  const editImageMutation = useMutation({
    mutationFn: async (data: { imageUrl: string; editInstructions: string; settings?: PhotoEditorSettings; sessionId?: string }) => {
      return await apiRequest("POST", "/api/photo-editor/edit", data);
    },
    onSuccess: (result) => {
      setSelectedImage(result.url);
      queryClient.invalidateQueries({ queryKey: ["/api/photo-editor/sessions", currentSession?.id, "images"] });
      toast({
        title: "Изображение отредактировано",
        description: "Изображение успешно обработано"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка редактирования",
        description: error.message || "Не удалось отредактировать изображение",
        variant: "destructive"
      });
    }
  });

  // Анализ изображения
  const analyzeImageMutation = useMutation({
    mutationFn: async (data: { imageUrl: string; prompt?: string }) => {
      return await apiRequest("POST", "/api/photo-editor/analyze", data);
    },
    onSuccess: (result) => {
      toast({
        title: "Анализ завершен",
        description: result.description
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка анализа",
        description: error.message || "Не удалось проанализировать изображение",
        variant: "destructive"
      });
    }
  });

  // Чат с изображением
  const chatMutation = useMutation({
    mutationFn: async (data: { imageUrl: string; message: string; sessionId?: string }) => {
      return await apiRequest("POST", "/api/photo-editor/chat", data);
    },
    onSuccess: () => {
      setChatMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/photo-editor/sessions", currentSession?.id, "chat"] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка чата",
        description: error.message || "Не удалось отправить сообщение",
        variant: "destructive"
      });
    }
  });

  // Создание новой сессии по умолчанию
  useEffect(() => {
    if (!sessionsLoading && sessions && sessions.length === 0) {
      createSessionMutation.mutate({
        title: "Моя первая сессия",
        description: "Создание и редактирование изображений с ИИ",
        settings
      });
    } else if (sessions && sessions.length > 0 && !currentSession) {
      setCurrentSession(sessions[0]);
    }
  }, [sessions, sessionsLoading, currentSession]);

  // Обработка загрузки файла
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Неверный формат",
        description: "Пожалуйста, выберите файл изображения",
        variant: "destructive"
      });
      return;
    }

    // Создаем URL для превью
    const imageUrl = URL.createObjectURL(file);
    setUploadedImageUrl(imageUrl);
    setSelectedImage(imageUrl);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI Фоторедактор
        </h1>
        <p className="text-center text-muted-foreground">
          Создавайте, редактируйте и улучшайте изображения с помощью искусственного интеллекта
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая панель - Инструменты */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Загрузить изображение
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Выбрать файл
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Генерация изображения
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt">Описание изображения</Label>
                <Textarea
                  id="prompt"
                  placeholder="Опишите, какое изображение вы хотите создать..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
              </div>
              <Button 
                onClick={() => generateImageMutation.mutate({ 
                  prompt, 
                  settings, 
                  sessionId: currentSession?.id 
                })}
                disabled={!prompt.trim() || generateImageMutation.isPending}
                className="w-full"
              >
                {generateImageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Создать изображение
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Редактирование
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="editInstructions">Инструкции для редактирования</Label>
                <Textarea
                  id="editInstructions"
                  placeholder="Опишите, как нужно изменить изображение..."
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  rows={3}
                />
              </div>
              <Button 
                onClick={() => editImageMutation.mutate({ 
                  imageUrl: selectedImage, 
                  editInstructions, 
                  settings, 
                  sessionId: currentSession?.id 
                })}
                disabled={!selectedImage || !editInstructions.trim() || editImageMutation.isPending}
                className="w-full"
                variant="secondary"
              >
                {editImageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Редактировать изображение
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Настройки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="quality">Качество</Label>
                <Select 
                  value={settings.quality} 
                  onValueChange={(value: "standard" | "hd") => 
                    setSettings(prev => ({ ...prev, quality: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Стандартное</SelectItem>
                    <SelectItem value="hd">Высокое качество</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="style">Стиль</Label>
                <Select 
                  value={settings.style} 
                  onValueChange={(value: "vivid" | "natural") => 
                    setSettings(prev => ({ ...prev, style: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vivid">Яркий</SelectItem>
                    <SelectItem value="natural">Естественный</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="size">Размер</Label>
                <Select 
                  value={settings.size} 
                  onValueChange={(value: "1024x1024" | "1792x1024" | "1024x1792") => 
                    setSettings(prev => ({ ...prev, size: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1024x1024">Квадрат (1024×1024)</SelectItem>
                    <SelectItem value="1792x1024">Широкий (1792×1024)</SelectItem>
                    <SelectItem value="1024x1792">Высокий (1024×1792)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Центральная панель - Изображение */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Текущее изображение
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedImage ? (
                <div className="space-y-4">
                  <div className="relative group">
                    <img 
                      src={selectedImage} 
                      alt="Выбранное изображение" 
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => analyzeImageMutation.mutate({ imageUrl: selectedImage })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Загрузите изображение или создайте новое с помощью ИИ
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Галерея изображений сессии */}
          {sessionImages && sessionImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>История изображений</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="flex gap-2">
                    {sessionImages.map((image: PhotoEditorImage) => (
                      <div 
                        key={image.id}
                        className="relative cursor-pointer group"
                        onClick={() => setSelectedImage(image.url)}
                      >
                        <img 
                          src={image.url} 
                          alt="История" 
                          className="w-16 h-16 object-cover rounded border-2 border-transparent hover:border-primary"
                        />
                        <Badge 
                          className="absolute -top-1 -right-1 text-xs"
                          variant={image.type === "generated" ? "default" : "secondary"}
                        >
                          {image.type === "generated" ? "Ген" : "Ред"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Правая панель - Чат */}
        <div className="lg:col-span-1">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                ИИ Ассистент
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4">
                  {sessionChat?.messages?.map((message: any) => (
                    <div 
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === "user" ? "bg-primary" : "bg-secondary"
                      }`}>
                        {message.role === "user" ? (
                          <User className="h-4 w-4 text-primary-foreground" />
                        ) : (
                          <Bot className="h-4 w-4 text-secondary-foreground" />
                        )}
                      </div>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === "user" 
                          ? "bg-primary text-primary-foreground ml-auto" 
                          : "bg-muted"
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        {message.imageUrl && (
                          <img 
                            src={message.imageUrl} 
                            alt="Изображение в чате" 
                            className="mt-2 max-w-full h-auto rounded"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="space-y-2">
                <Textarea
                  placeholder="Спросите что-нибудь об изображении..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  rows={2}
                />
                <Button 
                  onClick={() => chatMutation.mutate({ 
                    imageUrl: selectedImage, 
                    message: chatMessage, 
                    sessionId: currentSession?.id 
                  })}
                  disabled={!selectedImage || !chatMessage.trim() || chatMutation.isPending}
                  className="w-full"
                  size="sm"
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4 mr-2" />
                  )}
                  Отправить
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}