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
import { GoogleDocsIntegration } from "@/components/google-docs-integration";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Settings, 
  Share, 
  ArrowLeft,
  Moon,
  Sun,
  PanelRightOpen,
  PanelRightClose
} from "lucide-react";
import { Link } from "wouter";

const DEMO_USER_ID = "84ac8242-6c19-42a0-825b-caa01572e5e6";

export default function Playground() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const assistantId = params.assistantId;
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const { toast } = useToast();
  const { user: authUser, isAuthenticated } = useAuth();

  // Always use demo user for playground access
  const currentUserId = DEMO_USER_ID;
  
  // Get user data
  const { data: user } = useQuery({
    queryKey: ['/api/users', currentUserId],
    queryFn: () => openaiClient.getUser(currentUserId),
  });

  // Get assistant data if editing existing
  const { data: assistant, refetch: refetchAssistant } = useQuery({
    queryKey: ['/api/assistants', assistantId],
    queryFn: () => openaiClient.getAssistant(assistantId!),
    enabled: !!assistantId,
  });

  // Get conversations for this assistant
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations/user', currentUserId],
    queryFn: () => openaiClient.getConversationsByUserId(currentUserId),
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
    mutationFn: (data: { assistantId: string; title?: string }) => {
      if (!isAuthenticated) {
        // For demo users, create temporary conversation that won't persist
        return Promise.resolve({
          id: `temp-${Date.now()}`,
          userId: currentUserId,
          assistantId: data.assistantId,
          title: data.title || 'Временный разговор',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      return openaiClient.createConversation({
        userId: currentUserId,
        assistantId: data.assistantId,
        title: data.title,
      });
    },
    onSuccess: (conversation) => {
      setCurrentConversation(conversation);
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['/api/conversations/user', currentUserId] });
      }
      if (!isAuthenticated) {
        toast({
          title: "Временная сессия",
          description: "Разговор не будет сохранен. Войдите для сохранения данных.",
          variant: "default",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать разговор",
        variant: "destructive",
      });
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
      queryClient.invalidateQueries({ queryKey: ['/api/conversations/user', currentUserId] });
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
    toast({
      title: "Assistant saved",
      description: "Your assistant configuration has been saved successfully.",
    });
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 overflow-hidden max-w-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 max-w-full">
        {/* Top Bar */}
        <div className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {assistant?.name || 'New Assistant'}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Model:</span>
                  <span className="font-medium">{assistant?.model || 'GPT-4o'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={!currentConversation}
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Playground Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Chat Area */}
          <div className="flex-1 min-w-0">
            <ChatInterface
              conversation={currentConversation}
              assistant={assistant}
              onSendMessage={handleSendMessage}
              isLoading={sendMessageMutation.isPending}
            />
          </div>

          {/* Panel Toggle Button */}
          {!showConfigPanel && (
            <div className="absolute right-4 top-4 z-10">
              <Button
                onClick={() => setShowConfigPanel(true)}
                variant="outline"
                size="sm"
                className="bg-white dark:bg-slate-800 border shadow-md"
              >
                <PanelRightOpen className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Configuration Panel */}
          {showConfigPanel && (
            <div className="w-96 flex-shrink-0 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-gray-700 relative">
              <div className="absolute top-4 left-4 z-10">
                <Button
                  onClick={() => setShowConfigPanel(false)}
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-slate-800 border shadow-md"
                >
                  <PanelRightClose className="w-4 h-4" />
                </Button>
              </div>
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
          )}
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
