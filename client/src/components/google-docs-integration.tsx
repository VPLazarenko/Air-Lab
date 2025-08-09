import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Link, FileText, Trash2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { GoogleDocsDocument } from "@shared/schema";

interface GoogleDocsIntegrationProps {
  assistantId: string;
  userId: string;
}

export function GoogleDocsIntegration({ assistantId, userId }: GoogleDocsIntegrationProps) {
  const [documentUrl, setDocumentUrl] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing Google Docs documents
  const { data: documents, isLoading } = useQuery<GoogleDocsDocument[]>({
    queryKey: ['/api/assistants', assistantId, 'google-drive'],
    refetchInterval: false, // Disable automatic refetch
    refetchOnWindowFocus: false,
  });

  // Add Google Drive document mutation
  const addDocumentMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch(`/api/assistants/${assistantId}/google-drive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          documentUrl: url,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add document');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Документ добавлен",
        description: "Google Docs документ добавлен в базу знаний и обрабатывается.",
      });
      setDocumentUrl("");
      queryClient.invalidateQueries({ queryKey: ['/api/assistants', assistantId, 'google-drive'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Не удалось добавить документ',
        variant: "destructive",
      });
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/google-drive/${documentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete document');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Документ удален",
        description: "Документ удален из базы знаний.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assistants', assistantId, 'google-drive'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Не удалось удалить документ',
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentUrl.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ссылку на Google Docs документ",
        variant: "destructive",
      });
      return;
    }

    if (!documentUrl.includes("docs.google.com")) {
      toast({
        title: "Ошибка",
        description: "Введите корректную ссылку на Google Docs документ",
        variant: "destructive",
      });
      return;
    }

    addDocumentMutation.mutate(documentUrl);
  };

  const handleDelete = (documentId: string) => {
    deleteDocumentMutation.mutate(documentId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Обработан";
      case "processing":
        return "Обрабатывается";
      case "error":
        return "Ошибка";
      case "pending":
        return "В очереди";
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Интеграция с Google Docs
        </CardTitle>
        <CardDescription>
          Добавьте Google Docs документы в базу знаний ассистента. 
          <span className="text-orange-600 dark:text-orange-400 font-medium">
            Важно: документ должен быть публично доступен для чтения.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document-url">Ссылка на Google Docs документ</Label>
            <Input
              id="document-url"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="https://docs.google.com/document/d/..."
              disabled={addDocumentMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Чтобы сделать документ доступным: Поделиться → Общий доступ → "Все, у кого есть ссылка" → Читатель
            </p>
          </div>
          <Button 
            type="submit" 
            disabled={addDocumentMutation.isPending || !documentUrl.trim()}
            className="w-full"
          >
            {addDocumentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Добавляется...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Добавить документ
              </>
            )}
          </Button>
        </form>

        <div className="space-y-2">
          <Label>Документы в базе знаний</Label>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : documents && documents.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{doc.title}</span>
                        {getStatusIcon(doc.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {getStatusText(doc.status)}
                        </Badge>
                        {doc.processedAt && (
                          <span className="text-xs">
                            Обработан: {new Date(doc.processedAt).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                      </div>
                      {doc.errorMessage && (
                        <div className="text-xs text-red-500 mt-1">
                          {doc.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    disabled={deleteDocumentMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              Нет добавленных документов
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}