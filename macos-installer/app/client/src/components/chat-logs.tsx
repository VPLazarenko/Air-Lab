import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { 
  FileText, 
  MessageCircle, 
  Clock, 
  User, 
  Bot,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";

interface ChatLog {
  id: string;
  userId: string;
  conversationId: string;
  assistantId: string;
  sessionId: string | null;
  action: string;
  messageId: string | null;
  messageContent: string | null;
  messageRole: string | null;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    model?: string;
    temperature?: number;
    tokensUsed?: number;
    responseTime?: number;
    error?: string;
  };
  createdAt: string;
}

interface ChatLogsProps {
  userId?: string;
}

export function ChatLogs({ userId }: ChatLogsProps) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const targetUserId = userId || user?.id;

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/chat-logs/user', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const response = await fetch(`/api/chat-logs/user/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Не удалось получить логи чатов');
      }
      
      return response.json();
    },
    enabled: !!targetUserId,
  });

  const filteredLogs = logs.filter((log: ChatLog) => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'sent' && log.action === 'message_sent') ||
      (filter === 'received' && log.action === 'message_received');
    
    const matchesSession = !selectedSession || log.sessionId === selectedSession;
    
    return matchesFilter && matchesSession;
  });

  const sessions = [...new Set(logs.map((log: ChatLog) => log.sessionId).filter(Boolean))];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'message_sent':
        return <User className="w-4 h-4 text-emerald-600" />;
      case 'message_received':
        return <Bot className="w-4 h-4 text-blue-500" />;
      case 'chat_started':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'pdf_exported':
        return <Download className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    const variants = {
      message_sent: "default" as const,
      message_received: "secondary" as const,
      chat_started: "outline" as const,
      chat_ended: "destructive" as const,
      pdf_exported: "outline" as const,
    };
    
    const labels = {
      message_sent: "Отправлено",
      message_received: "Получено",
      chat_started: "Чат начат",
      chat_ended: "Чат завершен",
      pdf_exported: "PDF экспорт",
    };

    return (
      <Badge variant={variants[action as keyof typeof variants] || "outline"}>
        {labels[action as keyof typeof labels] || action}
      </Badge>
    );
  };

  const exportLogs = () => {
    const csvContent = [
      'Время,Действие,Сессия,Роль,Содержимое,Модель,User Agent',
      ...filteredLogs.map((log: ChatLog) => {
        const time = new Date(log.createdAt).toLocaleString('ru-RU');
        const action = log.action;
        const session = log.sessionId || '';
        const role = log.messageRole || '';
        const content = (log.messageContent || '').replace(/"/g, '""');
        const model = log.metadata.model || '';
        const userAgent = (log.metadata.userAgent || '').replace(/"/g, '""');
        
        return `"${time}","${action}","${session}","${role}","${content}","${model}","${userAgent}"`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `chat-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Логи чатов</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Загрузка логов...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Логи чатов</span>
            <Badge variant="outline">{filteredLogs.length}</Badge>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
              disabled={filteredLogs.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Экспорт
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            <Filter className="w-4 h-4 mr-2" />
            Все
          </Button>
          <Button
            variant={filter === 'sent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('sent')}
          >
            <User className="w-4 h-4 mr-2" />
            Отправленные
          </Button>
          <Button
            variant={filter === 'received' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('received')}
          >
            <Bot className="w-4 h-4 mr-2" />
            Полученные
          </Button>
        </div>

        {sessions.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            <Button
              variant={selectedSession === null ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedSession(null)}
            >
              Все сессии
            </Button>
            {sessions.slice(0, 5).map((session) => (
              <Button
                key={session}
                variant={selectedSession === session ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedSession(session)}
                className="text-xs"
              >
                {session?.slice(-8)}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Логи чатов не найдены</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {filteredLogs.map((log: ChatLog) => (
                <div key={log.id} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(log.action)}
                      {getActionBadge(log.action)}
                      {log.sessionId && (
                        <Badge variant="outline" className="text-xs">
                          {log.sessionId.slice(-8)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(log.createdAt), { 
                          addSuffix: true,
                          locale: ru 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {log.messageContent && (
                    <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded text-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        {log.messageRole === 'user' ? (
                          <User className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Bot className="w-3 h-3 text-blue-500" />
                        )}
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {log.messageRole === 'user' ? 'Пользователь' : 'Ассистент'}
                        </span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 line-clamp-2">
                        {log.messageContent}
                      </p>
                    </div>
                  )}
                  
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      {log.metadata.model && (
                        <div>Модель: {log.metadata.model}</div>
                      )}
                      {log.metadata.temperature && (
                        <div>Температура: {log.metadata.temperature}</div>
                      )}
                      {log.metadata.userAgent && (
                        <div className="truncate">
                          User Agent: {log.metadata.userAgent}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}