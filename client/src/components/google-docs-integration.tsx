import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  FileText, 
  Search, 
  ExternalLink, 
  Download,
  FolderOpen,
  Plus,
  CheckCircle2
} from "lucide-react";

interface GoogleDocsIntegrationProps {
  assistantId: string;
}

interface GoogleDoc {
  id: string;
  title: string;
  lastModified: string;
  url: string;
  content?: string;
  keyInformation?: {
    summary: string;
    keyPoints: string[];
    topics: string[];
    metadata: {
      wordCount: number;
      estimatedReadTime: number;
      documentType: string;
      importance?: string;
    };
  };
}

export function GoogleDocsIntegration({ assistantId }: GoogleDocsIntegrationProps) {
  const [documentUrl, setDocumentUrl] = useState("");
  const [documentUrls, setDocumentUrls] = useState("");
  const [previewDocument, setPreviewDocument] = useState<GoogleDoc | null>(null);
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const { toast } = useToast();

  // Preview document by URL
  const previewMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch('/api/google-docs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) throw new Error('Failed to fetch document');
      return response.json();
    },
    onSuccess: (data) => {
      setPreviewDocument(data);
      toast({
        title: "Document loaded",
        description: `Loaded: ${data.title}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to load document",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Validate multiple URLs
  const validateMutation = useMutation({
    mutationFn: async (urls: string[]) => {
      const response = await fetch('/api/google-docs/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      if (!response.ok) throw new Error('Failed to validate documents');
      return response.json();
    },
    onSuccess: (data) => {
      setBatchResults(data);
      const validCount = data.filter((r: any) => r.valid).length;
      toast({
        title: "Validation completed",
        description: `${validCount} of ${data.length} documents are accessible`,
      });
    },
    onError: (error) => {
      toast({
        title: "Validation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Import single document to knowledge base
  const importMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch(`/api/assistants/${assistantId}/import-google-doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) throw new Error('Failed to import document');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-base/assistant', assistantId] });
      toast({
        title: "Document imported",
        description: `${data.document.title} has been added to the knowledge base`,
      });
    },
    onError: (error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Batch import multiple documents
  const batchImportMutation = useMutation({
    mutationFn: async (urls: string[]) => {
      const response = await fetch(`/api/assistants/${assistantId}/batch-import-google-docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      if (!response.ok) throw new Error('Failed to batch import documents');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-base/assistant', assistantId] });
      setBatchResults(data.results);
      toast({
        title: "Batch import completed",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Batch import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePreview = () => {
    if (documentUrl.trim()) {
      previewMutation.mutate(documentUrl.trim());
    }
  };

  const handleValidateUrls = () => {
    const urls = documentUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    if (urls.length > 0) {
      validateMutation.mutate(urls);
    }
  };

  const handleBatchImport = () => {
    const urls = documentUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    if (urls.length > 0) {
      batchImportMutation.mutate(urls);
    }
  };

  const isValidGoogleDocsUrl = (url: string): boolean => {
    return /docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+/.test(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Google Docs Integration
          </CardTitle>
          <CardDescription>
            Import Google Docs with AI-powered analysis and key information extraction for efficient storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Single Document URL */}
          <div className="space-y-2">
            <Label htmlFor="documentUrl">Google Docs URL</Label>
            <div className="flex gap-2">
              <Input
                id="documentUrl"
                placeholder="Paste Google Docs URL here..."
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePreview()}
                className={documentUrl && !isValidGoogleDocsUrl(documentUrl) ? "border-red-500" : ""}
              />
              <Button 
                onClick={handlePreview} 
                disabled={previewMutation.isPending || !documentUrl.trim()}
                size="sm"
                variant="outline"
              >
                <Search className="w-4 h-4" />
                Preview
              </Button>
              <Button 
                onClick={() => documentUrl && importMutation.mutate(documentUrl)} 
                disabled={importMutation.isPending || !documentUrl.trim()}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Import
              </Button>
            </div>
            {documentUrl && !isValidGoogleDocsUrl(documentUrl) && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Please enter a valid Google Docs URL
              </p>
            )}
          </div>

          {/* Multiple Documents URLs */}
          <div className="space-y-2">
            <Label htmlFor="documentUrls">Multiple Google Docs URLs (one per line)</Label>
            <textarea
              id="documentUrls"
              placeholder={`Paste multiple Google Docs URLs here (one per line):
https://docs.google.com/document/d/...
https://docs.google.com/document/d/...`}
              value={documentUrls}
              onChange={(e) => setDocumentUrls(e.target.value)}
              className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none"
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleValidateUrls} 
                disabled={validateMutation.isPending || !documentUrls.trim()}
                size="sm"
                variant="outline"
              >
                <CheckCircle2 className="w-4 h-4" />
                Validate
              </Button>
              <Button 
                onClick={handleBatchImport} 
                disabled={batchImportMutation.isPending || !documentUrls.trim()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Batch Import
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Preview */}
      {previewDocument && (
        <Card>
          <CardHeader>
            <CardTitle>Document Preview</CardTitle>
            <CardDescription>{previewDocument.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h4 className="font-medium">{previewDocument.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Google Docs</Badge>
                    <Badge variant="secondary">ID: {previewDocument.id}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(previewDocument.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => importMutation.mutate(previewDocument.url)}
                    disabled={importMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {importMutation.isPending ? (
                      <Plus className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Import
                  </Button>
                </div>
              </div>
              {previewDocument.keyInformation && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <h5 className="text-sm font-medium mb-1">Summary</h5>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {previewDocument.keyInformation.summary}
                    </p>
                  </div>
                  
                  {previewDocument.keyInformation.keyPoints.length > 0 && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                      <h5 className="text-sm font-medium mb-1">Key Points</h5>
                      <ul className="text-xs space-y-1">
                        {previewDocument.keyInformation.keyPoints.map((point, index) => (
                          <li key={index} className="text-gray-700 dark:text-gray-300">• {point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {previewDocument.keyInformation.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    <Badge variant="secondary" className="text-xs">
                      {previewDocument.keyInformation.metadata.wordCount} words
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {previewDocument.keyInformation.metadata.estimatedReadTime} min read
                    </Badge>
                    <Badge 
                      variant={previewDocument.keyInformation.metadata.importance === 'high' ? 'destructive' : 
                               previewDocument.keyInformation.metadata.importance === 'low' ? 'outline' : 'default'} 
                      className="text-xs"
                    >
                      {previewDocument.keyInformation.metadata.importance || 'medium'} priority
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {previewDocument.keyInformation.metadata.documentType}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Results */}
      {batchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Results</CardTitle>
            <CardDescription>{batchResults.length} documents processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {batchResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <p className="text-sm truncate">{result.url}</p>
                    {result.error && (
                      <p className="text-xs text-red-600 dark:text-red-400">{result.error}</p>
                    )}
                    {result.document && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ✓ {result.document.title}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <Badge variant="default" className="bg-green-600">Success</Badge>
                    ) : (
                      <Badge variant="destructive">Failed</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}