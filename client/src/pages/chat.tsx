import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { openaiClient } from "@/lib/openai-client";
import type { Assistant, Conversation } from "@/lib/openai-client";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot } from "lucide-react";
import Footer from "@/components/Footer";

const DEMO_USER_ID = "84ac8242-6c19-42a0-825b-caa01572e5e6";

export default function Chat() {
  const params = useParams();
  const assistantId = params.assistantId;
  const [message, setMessage] = useState("");
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const { toast } = useToast();

  const { data: assistant } = useQuery({
    queryKey: ['/api/assistants', assistantId],
    queryFn: () => openaiClient.getAssistant(assistantId!),
    enabled: !!assistantId,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations/user', DEMO_USER_ID],
    queryFn: () => openaiClient.getConversationsByUserId(DEMO_USER_ID),
  });

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
      if (currentConversation && currentConversation.id === variables.conversationId) {
        const updatedConversation = {
          ...currentConversation,
          messages: [...(currentConversation.messages || []), data.userMessage, data.assistantMessage],
        };
        setCurrentConversation(updatedConversation);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/conversations/user', DEMO_USER_ID] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка отправки сообщения",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async (): Promise<void> => {
    if (!message.trim()) return;

    if (!currentConversation) {
      if (!assistantId) {
        toast({
          title: "Ассистент не выбран",
          description: "Пожалуйста, выберите ассистента",
          variant: "destructive",
        });
        return;
      }

      const conversation = await createConversationMutation.mutateAsync({
        assistantId,
        title: `Чат с ${assistant?.name || 'Ассистент'}`,
      });
      
      await sendMessageMutation.mutateAsync({
        conversationId: conversation.id,
        message,
      });
      setMessage("");
      return;
    }

    await sendMessageMutation.mutateAsync({
      conversationId: currentConversation.id,
      message,
    });
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Find current conversation for this assistant
  const assistantConversation = conversations.find(c => c.assistantId === assistantId);

  useEffect(() => {
    if (assistantConversation && !currentConversation) {
      setCurrentConversation(assistantConversation);
    }
  }, [assistantConversation, currentConversation]);

  useEffect(() => {
    document.title = `Чат с ${assistant?.name || 'Ассистент'}`;
  }, [assistant]);

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Simple Header */}
      <div className="border-b border-gray-200 p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-gray-900">{assistant?.name || 'Ассистент'}</h1>
          <p className="text-sm text-gray-500">Онлайн</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentConversation?.messages?.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        
        {sendMessageMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">Печатает...</span>
              </div>
            </div>
          </div>
        )}

        {!currentConversation?.messages?.length && !sendMessageMutation.isPending && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-gray-500">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Начните диалог</p>
              <p>Напишите сообщение ассистенту {assistant?.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите ваше сообщение..."
            disabled={sendMessageMutation.isPending}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}