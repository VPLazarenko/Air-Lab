import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { openaiClient } from "@/lib/openai-client";
import type { Assistant, Conversation } from "@/lib/openai-client";
import { ChatInterface } from "@/components/chat-interface";
import { AssistantConfigPanel } from "@/components/assistant-config-panel";
import { SettingsModal } from "@/components/settings-modal";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Settings, 
  Share, 
  ArrowLeft,
  Moon,
  Sun,
  Plus,
  Play,
  Folder,
  GraduationCap,
  PenTool,
  BarChart3,
  User as UserIcon
} from "lucide-react";
import { Link } from "wouter";

const DEMO_USER_ID = "84ac8242-6c19-42a0-825b-caa01572e5e6";

export default function Playground() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const assistantId = params.assistantId;
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const { toast } = useToast();

  // Get user data
  const { data: user } = useQuery({
    queryKey: ['/api/users', DEMO_USER_ID],
    queryFn: () => openaiClient.getUser(DEMO_USER_ID),
  });

  // Get assistant data if editing existing
  const { data: assistant, refetch: refetchAssistant } = useQuery({
    queryKey: ['/api/assistants', assistantId],
    queryFn: () => openaiClient.getAssistant(assistantId!),
    enabled: !!assistantId,
  });

  // Get all assistants for sidebar
  const { data: assistants = [], refetch: refetchAssistants } = useQuery({
    queryKey: ['/api/assistants/user', DEMO_USER_ID],
    queryFn: () => openaiClient.getAssistantsByUserId(DEMO_USER_ID),
    enabled: !!user,
  });

  // Get conversations for this assistant
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations/user', DEMO_USER_ID],
    queryFn: () => openaiClient.getConversationsByUserId(DEMO_USER_ID),
    enabled: !!user,
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

  // Create new conversation when assistant is selected
  const createConversationMutation = useMutation({
    mutationFn: (data: { assistantId: string; title?: string }) =>
      openaiClient.createConversation({
        userId: DEMO_USER_ID,
        assistantId: data.assistantId,
        title: data.title,
      }),
    onSuccess: (conversation) => {
      setCurrentConversation(conversation);
      queryClient.invalidateQueries({ queryKey: ['/api/conversations/user', DEMO_USER_ID] });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: string; message: string }) =>
      openaiClient.sendMessage(conversationId, message),
    onSuccess: (data, variables) => {
      // Update conversation state immediately with new messages
      if (currentConversation && currentConversation.id === variables.conversationId) {
        const updatedConversation = {
          ...currentConversation,
          messages: [...(currentConversation.messages || []), data.userMessage, data.assistantMessage],
        };
        setCurrentConversation(updatedConversation);
      }
      
      // Invalidate queries for fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/conversations/user', DEMO_USER_ID] });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async (message: string): Promise<void> => {
    if (!currentConversation) {
      if (!assistantId) {
        toast({
          title: "No assistant selected",
          description: "Please select or create an assistant first",
          variant: "destructive",
        });
        return;
      }

      // Create new conversation
      const conversation = await createConversationMutation.mutateAsync({
        assistantId,
        title: `Chat with ${assistant?.name || 'Assistant'}`,
      });
      
      // Send message to new conversation
      await sendMessageMutation.mutateAsync({
        conversationId: conversation.id,
        message,
      });
      return;
    }

    await sendMessageMutation.mutateAsync({
      conversationId: currentConversation.id,
      message,
    });
  };

  const handleAssistantSave = () => {
    refetchAssistant();
    refetchAssistants(); // Update sidebar list
    toast({
      title: "Assistant saved",
      description: "Your assistant configuration has been saved successfully.",
    });
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

  const handleShare = () => {
    if (currentConversation) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Conversation link has been copied to clipboard.",
      });
    }
  };

  // Find current conversation for this assistant
  const assistantConversation = conversations.find(c => c.assistantId === assistantId);

  useEffect(() => {
    if (assistantConversation && !currentConversation) {
      setCurrentConversation(assistantConversation);
    }
  }, [assistantConversation, currentConversation]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">OpenAI Assistant Platform</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Управление ассистентами</p>
            </div>
          </div>
          
          <Link href="/playground">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Создать ассистента
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Рабочая область
            </div>
            
            <Link href="/">
              <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${!assistantId ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <Play className="w-4 h-4" />
                <span>Playground</span>
              </div>
            </Link>
            
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-50 cursor-not-allowed">
              <Folder className="w-4 h-4" />
              <span>База знаний</span>
            </div>

            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 mt-6">
              Ассистенты ({assistants.length})
            </div>
            
            <div className="space-y-1">
              {assistants.map((asst) => (
                <Link key={asst.id} href={`/playground/${asst.id}`}>
                  <div className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${asst.id === assistantId ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 ${getAssistantColor(asst)} rounded-full flex items-center justify-center`}>
                        {getAssistantIcon(asst)}
                      </div>
                      <span className="text-sm truncate">{asst.name}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${asst.isActive ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  </div>
                </Link>
              ))}
              
              {assistants.length === 0 && (
                <div className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                  <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Пока нет ассистентов</p>
                  <p className="text-xs">Создайте первого ассистента для начала работы</p>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* User Settings */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-medium">{user?.username || 'Demo User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-1"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="p-1"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 ${assistant ? getAssistantColor(assistant) : 'bg-emerald-600'} rounded-lg flex items-center justify-center`}>
              {assistant ? getAssistantIcon(assistant) : <Bot className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {assistant?.name || 'Новый ассистент'}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Модель:</span>
                <span className="font-medium">{assistant?.model || 'GPT-4o'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={!currentConversation}
            >
              <Share className="w-4 h-4 mr-2" />
              Поделиться
            </Button>
          </div>
        </div>

        {/* Main Playground Area */}
        <div className="flex-1 flex">
          {/* Chat Area */}
          <div className="flex-1">
            <ChatInterface
              conversation={currentConversation}
              assistant={assistant}
              onSendMessage={handleSendMessage}
              isLoading={sendMessageMutation.isPending}
            />
          </div>

          {/* Configuration Panel */}
          <div className="w-80 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-gray-700">
            <AssistantConfigPanel
              assistant={assistant}
              assistantId={assistantId}
              userId={DEMO_USER_ID}
              onSave={handleAssistantSave}
              onAssistantCreated={(newAssistant) => {
                setLocation(`/playground/${newAssistant.id}`);
              }}
            />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        user={user}
      />
    </div>
  );
}
