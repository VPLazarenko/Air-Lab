import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Settings, Moon, Sun, Share, ArrowLeft, Plus, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { ConversationView } from "@/components/conversation-view";
import { AssistantConfigPanel } from "@/components/assistant-config-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { openaiClient } from "@/lib/openai-client";

interface PlaygroundProps {}

export default function Playground({}: PlaygroundProps) {
  // All hooks at the top level
  const { assistantId } = useParams<{ assistantId?: string }>();
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Authentication hooks
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Query hooks
  const { data: assistant, refetch: refetchAssistant } = useQuery({
    queryKey: ['/api/assistants', assistantId],
    queryFn: () => openaiClient.getAssistant(assistantId!),
    enabled: !!assistantId && isAuthenticated,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations/user', user?.id],
    queryFn: () => openaiClient.getConversationsByUserId(user?.id!),
    enabled: !!user?.id,
  });

  // Mutation hooks
  const createConversationMutation = useMutation({
    mutationFn: (data: { assistantId: string; title?: string }) =>
      openaiClient.createConversation({
        userId: user?.id!,
        assistantId: data.assistantId,
        title: data.title,
      }),
    onSuccess: (conversation) => {
      setCurrentConversation(conversation);
      queryClient.invalidateQueries({ queryKey: ['/api/conversations/user', user?.id] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: string; message: string }) =>
      openaiClient.sendMessage(conversationId, message),
    onSuccess: (data, variables) => {
      if (currentConversation && currentConversation.id === variables.conversationId) {
        const updatedConversation = {
          ...currentConversation,
          messages: [...(currentConversation.messages || []), data.userMessage, data.assistantMessage],
        };
        setCurrentConversation(updatedConversation);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/conversations/user', user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Effect hooks
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDark.toString());
  }, [isDark]);

  useEffect(() => {
    const assistantConversation = conversations.find(c => c.assistantId === assistantId);
    if (assistantConversation && !currentConversation) {
      setCurrentConversation(assistantConversation);
    }
  }, [conversations, assistantId, currentConversation]);

  // Event handlers
  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  const handleSendMessage = async (message: string): Promise<void> => {
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to send messages.",
        variant: "destructive",
      });
      return;
    }

    if (!currentConversation && assistantId) {
      const conversation = await createConversationMutation.mutateAsync({
        assistantId,
        title: `Chat with ${assistant?.name || 'Assistant'}`,
      });
      
      await sendMessageMutation.mutateAsync({
        conversationId: conversation.id,
        message,
      });
      return;
    }

    if (currentConversation) {
      await sendMessageMutation.mutateAsync({
        conversationId: currentConversation.id,
        message,
      });
    }
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

  const handleNewConversation = () => {
    if (assistantId && user?.id) {
      createConversationMutation.mutate({
        assistantId,
        title: `New Chat with ${assistant?.name || 'Assistant'}`,
      });
    }
  };

  // Render logic
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Вход в систему</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Войдите в систему для создания ассистентов
          </p>
          <Button onClick={() => setShowAuthModal(true)}>
            Войти
          </Button>
        </div>
        <AuthModal 
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

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
            <h1 className="text-lg font-semibold">
              {assistant?.name || 'New Assistant'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentConversation && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewConversation}
                  disabled={createConversationMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfigPanel(!showConfigPanel)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
            
            <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {currentConversation ? (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4">
                  <p>Чат с {assistant?.name || 'Ассистентом'}</p>
                  {/* TODO: Implement chat interface */}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-xl font-semibold mb-2">
                    Ready to Chat
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start a conversation with your assistant. Configure its behavior using the settings panel.
                  </p>
                  {assistantId && (
                    <Button onClick={handleNewConversation} disabled={createConversationMutation.isPending}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Start Conversation
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Config Panel */}
          {showConfigPanel && (
            <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 overflow-hidden">
              <AssistantConfigPanel
                assistant={assistant}
                onSave={handleAssistantSave}
                onAssistantCreated={(newAssistant) => {
                  // Handle new assistant creation
                  queryClient.invalidateQueries({ queryKey: ['/api/assistants'] });
                }}
              />
            </div>
          )}
        </div>
      </div>

      <AuthModal 
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}