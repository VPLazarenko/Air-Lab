import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  File, 
  Search, 
  Filter,
  Download,
  Eye,
  Trash2,
  Upload,
  RefreshCw
} from "lucide-react";
import { openaiClient } from "@/lib/openai-client";

const DEMO_USER_ID = "demo-user-1";

export default function FileManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // all, uploads, google-docs

  // Fetch assistants to get file data
  const { data: assistants = [], refetch: refetchAssistants } = useQuery({
    queryKey: ['/api/assistants/user', DEMO_USER_ID],
    queryFn: () => openaiClient.getAssistantsByUserId(DEMO_USER_ID),
  });

  // Fetch Google Docs for all assistants
  const { data: allGoogleDocs = [], refetch: refetchGoogleDocs } = useQuery({
    queryKey: ['/api/google-docs/all'],
    queryFn: async () => {
      const docs: any[] = [];
      for (const assistant of assistants) {
        try {
          const assistantDocs = await openaiClient.getGoogleDriveDocuments(assistant.id);
          docs.push(...assistantDocs.map((doc: any) => ({ ...doc, assistantName: assistant.name })));
        } catch (error) {
          console.error(`Error fetching docs for assistant ${assistant.id}:`, error);
        }
      }
      return docs;
    },
    enabled: assistants.length > 0,
  });

  // Get all files from assistants
  const allFiles = assistants.flatMap(assistant => 
    (assistant.files || []).map(file => ({ 
      ...file, 
      assistantName: assistant.name,
      assistantId: assistant.id,
      type: 'upload'
    }))
  );

  // Combine files and Google Docs
  const allDocuments = [
    ...allFiles,
    ...allGoogleDocs.map(doc => ({
      id: doc.id,
      name: doc.title || 'Untitled Document',
      type: 'google-docs',
      status: doc.status,
      assistantName: doc.assistantName,
      assistantId: doc.assistantId,
      url: doc.documentUrl,
      createdAt: doc.createdAt,
      content: doc.content
    }))
  ];

  // Filter documents
  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.assistantName && doc.assistantName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "uploads" && doc.type === "upload") ||
                         (selectedFilter === "google-docs" && doc.type === "google-docs");
    
    return matchesSearch && matchesFilter;
  });

  const handleRefresh = () => {
    refetchAssistants();
    refetchGoogleDocs();
  };

  const getFileIcon = (doc: any) => {
    if (doc.type === 'google-docs') {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const getStatusBadge = (doc: any) => {
    if (doc.type === 'google-docs') {
      const variant = doc.status === 'completed' ? 'default' : 
                     doc.status === 'processing' ? 'secondary' : 'destructive';
      return <Badge variant={variant} className="text-xs">{doc.status}</Badge>;
    }
    return <Badge variant="default" className="text-xs">uploaded</Badge>;
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">File Manager</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage uploaded files and Google Docs integrated with your assistants
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search files and documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border rounded px-3 py-2 text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600"
                >
                  <option value="all">All Files</option>
                  <option value="uploads">Uploaded Files</option>
                  <option value="google-docs">Google Docs</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <File className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allDocuments.length}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {allFiles.length} uploads, {allGoogleDocs.length} Google Docs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Google Docs</CardTitle>
              <FileText className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allGoogleDocs.length}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {allGoogleDocs.filter(doc => doc.status === 'completed').length} processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">File Uploads</CardTitle>
              <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allFiles.length}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Available in knowledge base
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Files List */}
        <Card>
          <CardHeader>
            <CardTitle>Documents & Files</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <File className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No files found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm || selectedFilter !== "all" 
                    ? "Try adjusting your search or filter criteria."
                    : "Upload files or add Google Docs to your assistants to get started."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <div key={`${doc.type}-${doc.id}`} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center space-x-4">
                      {getFileIcon(doc)}
                      <div className="flex-1">
                        <h3 className="font-medium">{doc.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Assistant: {doc.assistantName}
                          </span>
                          {getStatusBadge(doc)}
                          <Badge variant="outline" className="text-xs">
                            {doc.type === 'google-docs' ? 'Google Docs' : 'Upload'}
                          </Badge>
                        </div>
                        {doc.content && typeof doc.content === 'string' && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md truncate">
                            {doc.content.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(doc as any).url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={(doc as any).url} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {doc.type === 'upload' && (
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}