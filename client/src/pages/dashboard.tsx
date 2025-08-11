import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery } from "@tanstack/react-query";
import { openaiClient } from "@/lib/openai-client";
import type { Assistant, User } from "@/lib/openai-client";
import type { Plan, Announcement } from "@shared/schema";
import { SettingsModal } from "@/components/settings-modal";
import { AuthModal } from "@/components/auth/AuthModal";
import { IntegrationModal } from "@/components/integrations/IntegrationModal";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useToast } from "@/hooks/use-toast";
import { DownloadButton } from "@/components/download-button";
import { ChatLogs } from "@/components/chat-logs";
import Footer from "@/components/Footer";
import VideoBackground from "@/components/video-background";
import { TariffActivationForm } from "@/components/tariff-activation-form";
import logoPath from "@assets/лого3_1754808405274.jpg";
import { 
  Bot, 
  Plus, 
  Settings, 
  Play, 
  Folder, 
  GraduationCap, 
  PenTool, 
  BarChart3,
  FileText,
  Bell,
  CreditCard,
  Info,
  Moon,
  Sun,
  User as UserIcon,
  LogIn,
  LogOut,
  Crown,
  Menu,
  X,
  AlertCircle,
  Lock,
  Trash2,
  CheckSquare,
  Square
} from "lucide-react";

const DEMO_USER_ID = "84ac8242-6c19-42a0-825b-caa01572e5e6";

export default function Dashboard() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'assistants' | 'logs' | 'integrations' | 'plans' | 'news' | 'activation'>('assistants');
  const [showActivationForm, setShowActivationForm] = useState(false);
  const [selectedAssistants, setSelectedAssistants] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Initialize demo user
  const { data: user } = useQuery({
    queryKey: ['/api/users', DEMO_USER_ID],
    queryFn: async () => {
      try {
        return await openaiClient.getUser(DEMO_USER_ID);
      } catch {
        // Create demo user if doesn't exist
        return await openaiClient.createUser({
          username: "Demo User",
          email: "demo@example.com",
          settings: { defaultModel: "gpt-4o", autoSave: true, darkMode: isDark }
        });
      }
    },
  });

  const { data: assistants = [], refetch: refetchAssistants } = useQuery({
    queryKey: ['/api/assistants/user', authUser?.id || DEMO_USER_ID],
    queryFn: () => openaiClient.getAssistantsByUserId(authUser?.id || DEMO_USER_ID),
    enabled: !!(authUser || user),
  });

  const { data: integrations = [], isLoading: integrationsLoading } = useQuery({
    queryKey: ["/api/integrations"],
    enabled: isAuthenticated,
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ["/api/plans"],
  });

  const { data: announcements = [], isLoading: announcementsLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDark.toString());
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  // Assistant selection functions
  const toggleAssistantSelection = (assistantId: string) => {
    setSelectedAssistants(prev => 
      prev.includes(assistantId) 
        ? prev.filter(id => id !== assistantId)
        : [...prev, assistantId]
    );
  };

  const selectAllAssistants = () => {
    if (selectedAssistants.length === assistants.length) {
      setSelectedAssistants([]);
    } else {
      setSelectedAssistants(assistants.map((assistant: Assistant) => assistant.id));
    }
  };

  const clearSelection = () => {
    setSelectedAssistants([]);
  };

  // Delete assistants function
  const handleDeleteAssistants = async () => {
    if (selectedAssistants.length === 0) return;
    
    setIsDeleting(true);
    try {
      const deletePromises = selectedAssistants.map(async (assistantId) => {
        const response = await fetch(`/api/assistants/${assistantId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`Failed to delete assistant ${assistantId}`);
        }
        return response.json();
      });

      await Promise.all(deletePromises);
      
      toast({
        title: "Успех",
        description: `Удалено ассистентов: ${selectedAssistants.length}`,
      });
      
      setSelectedAssistants([]);
      setShowDeleteConfirmation(false);
      refetchAssistants();
    } catch (error) {
      console.error('Error deleting assistants:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить некоторых ассистентов",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getAssistantIcon = (assistant: Assistant) => {
    const name = assistant.name.toLowerCase();
    if (name.includes('code')) return <GraduationCap className="w-3 h-3 text-white" />;
    if (name.includes('write') || name.includes('content')) return <PenTool className="w-3 h-3 text-white" />;
    if (name.includes('data') || name.includes('analyst')) return <BarChart3 className="w-3 h-3 text-white" />;
    return <Bot className="w-3 h-3 text-white" />;
  };

  const getAssistantColor = (assistant: Assistant) => {
    const name = assistant.name.toLowerCase();
    if (name.includes('code')) return 'bg-blue-500';
    if (name.includes('write') || name.includes('content')) return 'bg-purple-500';
    if (name.includes('data') || name.includes('analyst')) return 'bg-orange-500';
    return 'bg-gray-500';
  };

  const getIntegrationStatus = (type: string) => {
    return (integrations as any[]).find((integration: any) => integration.type === type.toLowerCase());
  };

  const handleIntegrationClick = (integration: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    setSelectedIntegration(integration.toLowerCase());
    setShowIntegrationModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <div className="flex h-screen overflow-hidden w-full">
        {/* Mobile Menu Button */}
        <Button
          className="lg:hidden fixed top-4 left-4 z-50"
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
        {/* Sidebar with mobile overlay */}
        <div className={`
          ${isMobileMenuOpen ? 'fixed inset-0 z-40 lg:relative' : 'hidden lg:block'}
          lg:w-80 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden
        `}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/assets/logo.jpg"
                alt="Air Lab Logo"
                className="w-10 h-10 rounded-lg object-contain"
              />
              <div>
                <h1 className="text-lg font-semibold">Air Lab.</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI Assistants Platform</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
          
          <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => {
              if (!isAuthenticated) {
                toast({
                  title: "Требуется авторизация",
                  description: "Платформа AI Ассистентов Air Lab доступна только авторизованным пользователям!",
                  variant: "destructive",
                });
                return;
              }
              setLocation('/playground');
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.createAssistant}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Workspace
            </div>
            
            <Link href="/">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                <Bot className="w-4 h-4" />
                <span>{t.dashboard}</span>
              </div>
            </Link>
            
            <Link href="/playground">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Play className="w-4 h-4" />
                <span>{t.playground}</span>
              </div>
            </Link>
            
            <Link href="/files">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Folder className="w-4 h-4" />
                <span>{t.fileManager}</span>
              </div>
            </Link>

            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 mt-6">
              {t.myAssistants} ({assistants.length})
            </div>
            
            <div className="space-y-1">
              {assistants.map((assistant: Assistant) => (
                <Link key={assistant.id} href={`/playground/${assistant.id}`}>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 ${getAssistantColor(assistant)} rounded-full flex items-center justify-center`}>
                        {getAssistantIcon(assistant)}
                      </div>
                      <span className="text-sm truncate">{assistant.name}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${assistant.isActive ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  </div>
                </Link>
              ))}
              
              {assistants.length === 0 && (
                <div className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                  <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t.noAssistants}</p>
                  <p className="text-xs">{t.createAssistant}</p>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* User Settings */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {authUser?.username || user?.username || t.user}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {authUser?.email || user?.email || "demo@example.com"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-2"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="p-2"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Download Button */}
          <div className="w-full">
            <DownloadButton />
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-16 lg:pt-8">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <img 
                src={logoPath} 
                alt="Air Lab Logo" 
                className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg object-cover shadow-md"
              />
              <div>
                <h1 className="text-xl lg:text-2xl font-bold mb-1">Air Lab.</h1>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">AI Assistants Platform</p>
              </div>
            </div>
            
            {/* Auth Button */}
            <div className="flex items-center space-x-2 lg:space-x-4 flex-wrap">
              {isAuthenticated && authUser ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <Link href="/profile">
                    <Button variant="outline" className="gap-2 w-full sm:w-auto">
                      <UserIcon className="w-4 h-4" />
                      <span className="truncate max-w-[100px]">{authUser.username}</span>
                    </Button>
                  </Link>
                  
                  {authUser.role === 'admin' && (
                    <Link href="/admin">
                      <Button variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto">
                        <Crown className="w-4 h-4" />
                        <span className="hidden sm:inline">{t.adminPanel}</span>
                        <span className="sm:hidden">{t.admin}</span>
                      </Button>
                    </Link>
                  )}
                  
                  {/* Tariff Activation Button */}
                  {(authUser?.plan === 'free' || authUser?.isAccountFrozen) && (
                    <Button 
                      variant={authUser?.isAccountFrozen ? "destructive" : "outline"}
                      onClick={() => setShowActivationForm(true)} 
                      className="gap-2 w-full sm:w-auto"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {authUser?.isAccountFrozen ? 'Разморозить аккаунт' : 'Активировать тариф'}
                      </span>
                      <span className="sm:hidden">
                        {authUser?.isAccountFrozen ? 'Разморозить' : 'Активировать'}
                      </span>
                    </Button>
                  )}
                  
                  <Button variant="ghost" onClick={logout} className="gap-2 w-full sm:w-auto">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.logout}</span>
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} className="gap-2 w-full sm:w-auto">
                  <LogIn className="w-4 h-4" />
                  {t.login}
                </Button>
              )}
            </div>
          </div>

          {/* Video Background */}
          <div className="mb-8 w-full h-96">
            <VideoBackground />
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            <Button
              variant={activeTab === 'assistants' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('assistants')}
              className="gap-2"
            >
              <Bot className="w-4 h-4" />
              Ассистенты
              <Badge variant="secondary">{assistants.length}</Badge>
            </Button>
            <Button
              variant={activeTab === 'logs' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('logs')}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Логи чатов
            </Button>
            <Button
              variant={activeTab === 'integrations' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('integrations')}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Интеграции
            </Button>
            <Button
              variant={activeTab === 'plans' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('plans')}
              className="gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Тарифы
              <Badge variant="secondary">{plans.length}</Badge>
            </Button>
            <Button
              variant={activeTab === 'news' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('news')}
              className="gap-2"
            >
              <Bell className="w-4 h-4" />
              Новости
              {announcements.length > 0 && <Badge variant="secondary">{announcements.length}</Badge>}
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === 'assistants' && (
            <Card className="w-full">
              {authUser?.isAccountFrozen && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 mb-4">
                  <div className="flex items-center">
                    <Lock className="w-5 h-5 text-red-500 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Аккаунт заморожен</h3>
                      <p className="text-sm text-red-700">Активируйте любой тарифный план для разморозки аккаунта и доступа к ассистентам.</p>
                    </div>
                  </div>
                </div>
              )}
              <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <span>Ваши ассистенты</span>
                    <Badge variant="secondary">{assistants.length}</Badge>
                  </CardTitle>
                  <Link href="/playground">
                    <Button 
                      className="gap-2 w-full sm:w-auto"
                      disabled={authUser?.isAccountFrozen === true}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Создать ассистента</span>
                      <span className="sm:hidden">Создать</span>
                    </Button>
                  </Link>
                </div>
                
                {/* Selection Controls */}
                {assistants.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllAssistants}
                        className="gap-2"
                      >
                        {selectedAssistants.length === assistants.length ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                        {selectedAssistants.length === assistants.length ? 'Снять выделение' : 'Выбрать все'}
                      </Button>
                      
                      {selectedAssistants.length > 0 && (
                        <>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Выбрано: {selectedAssistants.length}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearSelection}
                          >
                            Очистить
                          </Button>
                        </>
                      )}
                    </div>
                    
                    {selectedAssistants.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteConfirmation(true)}
                        className="gap-2"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                        Удалить выбранных ({selectedAssistants.length})
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {assistants.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">{t.noAssistants}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t.noAssistants}
                  </p>
                  <Link href="/playground">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="w-4 h-4 mr-2" />
                      {t.createAssistant}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 w-full">
                  {assistants.map((assistant: Assistant) => (
                    <div 
                      key={assistant.id} 
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg transition-colors ${
                        selectedAssistants.includes(assistant.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-4 flex-1">
                        {/* Checkbox */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAssistantSelection(assistant.id)}
                          className="p-1 h-auto min-w-0"
                        >
                          {selectedAssistants.includes(assistant.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </Button>
                        
                        <div className={`w-10 h-10 ${getAssistantColor(assistant)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          {getAssistantIcon(assistant)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium truncate">{assistant.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {assistant.description || 'No description'}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {assistant.model}
                            </Badge>
                            <Badge variant={assistant.isActive ? "default" : "secondary"} className="text-xs">
                              {assistant.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Link href={`/playground/${assistant.id}`}>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            <Play className="w-4 h-4 mr-1" />
                            {t.playground}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            </Card>
          )}

          {/* Chat Logs Tab */}
          {activeTab === 'logs' && (
            <ChatLogs userId={authUser?.id} />
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t.integrations}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Настройте интеграции с различными платформами для автоматизации работы ваших ассистентов.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Telegram Integration */}
                  <div 
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleIntegrationClick('Telegram')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Telegram</h3>
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                      </div>
                    </div>
                    <Badge variant={getIntegrationStatus('telegram') ? "default" : "outline"}>
                      {getIntegrationStatus('telegram') ? 'Настроено' : 'Настроить'}
                    </Badge>
                  </div>

                  {/* VK Integration */}
                  <div 
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleIntegrationClick('VK')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">VKontakte</h3>
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zM18.636 15.84c.648.648 1.008 1.2 1.008 1.584 0 .744-.624 1.368-1.368 1.368h-2.328c-.48 0-.816-.192-1.056-.432-.192-.192-.36-.36-.528-.528-.528-.528-.888-.888-1.248-.888-.12 0-.216.096-.216.216v1.632c0 .384-.312.696-.696.696h-1.728c-.384 0-.696-.312-.696-.696V13.8c0-.384.312-.696.696-.696h.912c.384 0 .696.312.696.696v.624c.168-.168.36-.36.576-.576.648-.648 1.296-1.296 1.944-1.944.216-.216.432-.432.648-.648.192-.192.432-.288.696-.288h2.328c.744 0 1.368.624 1.368 1.368 0 .384-.36.936-1.008 1.584z"/>
                        </svg>
                      </div>
                    </div>
                    <Badge variant={getIntegrationStatus('vk') ? "default" : "outline"}>
                      {getIntegrationStatus('vk') ? 'Настроено' : 'Настроить'}
                    </Badge>
                  </div>

                  {/* WhatsApp Integration */}
                  <div 
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleIntegrationClick('WhatsApp')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">WhatsApp</h3>
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.425 3.488"/>
                        </svg>
                      </div>
                    </div>
                    <Badge variant={getIntegrationStatus('whatsapp') ? "default" : "outline"}>
                      {getIntegrationStatus('whatsapp') ? 'Настроено' : 'Настроить'}
                    </Badge>
                  </div>

                  {/* OpenAI Integration */}
                  <div 
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleIntegrationClick('OpenAI')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">OpenAI API</h3>
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <Badge variant={getIntegrationStatus('openai') || user?.apiKey ? "default" : "outline"}>
                      {getIntegrationStatus('openai') || user?.apiKey ? 'Настроено' : 'Настроить'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Тарифные планы
                </CardTitle>
              </CardHeader>
              <CardContent>
                {plansLoading ? (
                  <div className="text-center py-8">Загрузка тарифов...</div>
                ) : plans.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Тарифные планы пока недоступны</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan: Plan) => (
                      <div key={plan.id} className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                        <div className="text-center mb-4">
                          <h3 className="text-xl font-bold">{plan.displayName}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{plan.description}</p>
                          <div className="text-3xl font-bold text-emerald-600">
                            {plan.price === 0 ? 'Бесплатно' : `${plan.price} ${plan.currency}`}
                          </div>
                          <p className="text-sm text-gray-500">
                            {plan.billingPeriod === 'monthly' ? 'в месяц' : 
                             plan.billingPeriod === 'yearly' ? 'в год' : 
                             plan.billingPeriod === 'lifetime' ? 'навсегда' : plan.billingPeriod}
                          </p>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          {plan.features?.maxAssistants && (
                            <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4 text-emerald-500" />
                              <span className="text-sm">До {plan.features.maxAssistants} ассистентов</span>
                            </div>
                          )}
                          {plan.features?.maxConversations && (
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-emerald-500" />
                              <span className="text-sm">До {plan.features.maxConversations} диалогов</span>
                            </div>
                          )}
                          {plan.features?.apiAccess && (
                            <div className="flex items-center gap-2">
                              <Settings className="w-4 h-4 text-emerald-500" />
                              <span className="text-sm">API доступ</span>
                            </div>
                          )}
                          {plan.features?.prioritySupport && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-emerald-500" />
                              <span className="text-sm">Приоритетная поддержка</span>
                            </div>
                          )}
                        </div>
                        
                        {plan.paymentLink ? (
                          <Button asChild className="w-full">
                            <a href={plan.paymentLink} target="_blank" rel="noopener noreferrer">
                              Выбрать план
                            </a>
                          </Button>
                        ) : (
                          <Button className="w-full" disabled>
                            {authUser?.plan === plan.name ? 'Текущий план' : 'Скоро доступно'}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Новости и объявления
                </CardTitle>
              </CardHeader>
              <CardContent>
                {announcementsLoading ? (
                  <div className="text-center py-8">Загрузка новостей...</div>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Пока нет новых объявлений</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement: Announcement) => (
                      <div key={announcement.id} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            announcement.type === 'success' ? 'bg-green-100 text-green-600' :
                            announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                            announcement.type === 'error' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <Info className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{announcement.title}</h3>
                              {announcement.isPinned && (
                                <Badge variant="outline" className="text-xs">Закреплено</Badge>
                              )}
                              <Badge variant={
                                announcement.priority === 'urgent' ? 'destructive' :
                                announcement.priority === 'high' ? 'default' :
                                'secondary'
                              } className="text-xs">
                                {announcement.priority === 'urgent' ? 'Срочно' :
                                 announcement.priority === 'high' ? 'Важно' :
                                 announcement.priority === 'normal' ? 'Обычное' : 'Низкий'}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 mb-2">{announcement.content}</p>
                            
                            <div className="text-xs text-gray-500">
                              {announcement.publishedAt ? 
                                new Date(announcement.publishedAt).toLocaleDateString('ru-RU') :
                                new Date(announcement.createdAt).toLocaleDateString('ru-RU')
                              }
                              {announcement.expiresAt && (
                                <span> • Действительно до: {new Date(announcement.expiresAt).toLocaleDateString('ru-RU')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        user={user}
      />
      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      {/* Integration Modal */}
      <IntegrationModal 
        open={showIntegrationModal}
        onClose={() => setShowIntegrationModal(false)}
        integration={selectedIntegration as "telegram" | "vk" | "whatsapp" | "openai" | null}
      />
      
      {/* Tariff Activation Modal */}
      {showActivationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <TariffActivationForm 
            user={authUser}
            onClose={() => setShowActivationForm(false)}
          />
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
            <AlertDialogDescription>
              Вы собираетесь удалить {selectedAssistants.length} ассистент(ов) со всеми накопленными данными. 
              Это действие нельзя отменить. Все связанные данные, включая:
              <br />• Историю разговоров
              <br />• Настройки ассистента
              <br />• OpenAI Assistant ID
              <br />• Загруженные файлы
              <br />
              будут безвозвратно удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAssistants}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Удаление...' : `Удалить ${selectedAssistants.length} ассистент(ов)`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
      <Footer />
    </div>
  );
}
