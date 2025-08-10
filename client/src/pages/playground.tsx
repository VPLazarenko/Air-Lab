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
import { useAuth } from "@/hooks/useAuth";
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

  // Get user data - use authenticated user or demo user
  const userId = authUser?.id || DEMO_USER_ID;
  const { data: user } = useQuery({
    queryKey: ['/api/users', userId],
    queryFn: () => openaiClient.getUser(userId),
  });

  // Get assistant data if editing existing
  const { data: assistant, refetch: refetchAssistant } = useQuery({
    queryKey: ['/api/assistants', assistantId],
    queryFn: () => openaiClient.getAssistant(assistantId!),
    enabled: !!assistantId,
  });

  // Get conversations for this assistant
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations/user', userId],
    queryFn: () => openaiClient.getConversationsByUserId(userId),
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
        userId: userId,
        assistantId: data.assistantId,
        title: data.title,
      }),
    onSuccess: (conversation) => {
      setCurrentConversation(conversation);
      queryClient.invalidateQueries({ queryKey: ['/api/conversations/user', userId] });
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
        <div className="min-h-[4rem] bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 lg:px-6 gap-3 lg:gap-0">
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2 lg:px-3">
                <ArrowLeft className="w-4 h-4 lg:mr-2" />
                <span className="hidden lg:inline">Back</span>
              </Button>
            </Link>
            
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <h2 className="text-base lg:text-lg font-semibold truncate max-w-[200px] lg:max-w-none">
                  {assistant?.name || 'New Assistant'}
                </h2>
                <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                  <span>Model:</span>
                  <span className="font-medium">{assistant?.model || 'GPT-4o'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="p-2"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={!currentConversation}
              className="hidden sm:flex"
            >
              <Share className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Share</span>
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
            <div className="absolute lg:relative inset-0 lg:inset-auto w-full lg:w-96 flex-shrink-0 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-gray-700 z-20 lg:z-auto">
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
                userId={userId}
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
