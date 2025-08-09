import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { openaiClient } from "@/lib/openai-client";
import type { Assistant } from "@/lib/openai-client";
import { ObjectUploader } from "@/components/ObjectUploader";
import { GoogleDocsIntegration } from "@/components/google-docs-integration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  Download, 
  Upload, 
  X, 
  FileText, 
  Code, 
  File,
  Link,
  Globe
} from "lucide-react";

interface AssistantConfigPanelProps {
  assistant?: Assistant;
  assistantId?: string;
  userId: string;
  onSave: () => void;
  onAssistantCreated: (assistant: Assistant) => void;
}

export function AssistantConfigPanel({ 
  assistant, 
  assistantId, 
  userId, 
  onSave, 
  onAssistantCreated 
}: AssistantConfigPanelProps) {
  const [config, setConfig] = useState({
    name: "",
    description: "",
    instructions: "",
    model: "gpt-4o",
    temperature: 0.7,
    tools: [
      { type: "code_interpreter", enabled: false },
      { type: "file_search", enabled: false },
      { type: "web_search", enabled: false },
    ],
    files: [] as Array<{ id: string; name: string; path: string }>,
  });

  const { toast } = useToast();

  // Получаем Google Docs документы для отображения в файл менеджере
  const { data: googleDocs } = useQuery({
    queryKey: [`/api/assistants/${assistantId}/google-drive`],
    enabled: !!assistantId,
  });

  useEffect(() => {
    if (assistant) {
      setConfig({
        name: assistant.name,
        description: assistant.description || "",
        instructions: assistant.instructions || "",
        model: assistant.model,
        temperature: assistant.temperature,
        tools: assistant.tools.length > 0 ? assistant.tools : config.tools,
        files: assistant.files || [],
      });
    }
  }, [assistant]);

  const createAssistantMutation = useMutation({
    mutationFn: (data: any) => openaiClient.createAssistant(data),
    onSuccess: (newAssistant) => {
      queryClient.invalidateQueries({ queryKey: ['/api/assistants/user', userId] });
      onAssistantCreated(newAssistant);
      onSave();
      toast({
        title: "Assistant created",
        description: "Your assistant has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating assistant",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAssistantMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      openaiClient.updateAssistant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assistants', assistantId] });
      queryClient.invalidateQueries({ queryKey: ['/api/assistants/user', userId] });
      onSave();
    },
    onError: (error) => {
      toast({
        title: "Error updating assistant",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exportAssistantMutation = useMutation({
    mutationFn: (id: string) => openaiClient.exportAssistant(id),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.name || 'assistant'}-config.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Configuration exported",
        description: "Assistant configuration has been downloaded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!config.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your assistant.",
        variant: "destructive",
      });
      return;
    }

    const assistantData = {
      userId,
      name: config.name,
      description: config.description,
      instructions: config.instructions,
      model: config.model,
      temperature: config.temperature,
      tools: config.tools,
      files: config.files,
    };

    if (assistantId) {
      updateAssistantMutation.mutate({ id: assistantId, data: assistantData });
    } else {
      createAssistantMutation.mutate(assistantData);
    }
  };

  const handleExport = () => {
    if (assistantId) {
      exportAssistantMutation.mutate(assistantId);
    }
  };

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateTool = (toolType: string, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      tools: prev.tools.map(tool => 
        tool.type === toolType ? { ...tool, enabled } : tool
      )
    }));
  };

  const handleFileUpload = async () => {
    try {
      const response = await openaiClient.getUploadUrl();
      return {
        method: 'PUT' as const,
        url: response.uploadURL,
      };
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to get upload URL",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleFileComplete = async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const newFile = {
        id: `file_${Date.now()}`,
        name: uploadedFile.name,
        path: uploadedFile.uploadURL,
      };
      
      // Add to local config first
      setConfig(prev => ({
        ...prev,
        files: [...prev.files, newFile]
      }));

      // If assistant exists, upload file to OpenAI knowledge base
      if (assistant?.id) {
        try {
          toast({
            title: "Processing file",
            description: `Adding ${uploadedFile.name} to assistant's knowledge base...`,
          });

          await openaiClient.uploadFileToAssistant(
            assistant.id, 
            uploadedFile.uploadURL, 
            uploadedFile.name
          );

          toast({
            title: "File processed",
            description: `${uploadedFile.name} has been added to the assistant's knowledge base and is ready for analysis.`,
          });
        } catch (error) {
          console.error("Failed to upload file to assistant:", error);
          toast({
            title: "Upload warning",
            description: `File uploaded but couldn't be added to knowledge base. You may need to recreate the assistant.`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "File uploaded",
          description: `${uploadedFile.name} will be added to knowledge base when assistant is saved.`,
        });
      }
    }
  };

  const removeFile = (fileId: string) => {
    setConfig(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId)
    }));
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) return <FileText className="w-4 h-4 text-red-500" />;
    if (['py', 'js', 'ts', 'html', 'css'].includes(ext || '')) return <Code className="w-4 h-4 text-blue-500" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Assistant Info */}
        <div>
          <h3 className="font-semibold mb-3">Assistant Configuration</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => updateConfig('name', e.target.value)}
                placeholder="Enter assistant name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => updateConfig('description', e.target.value)}
                placeholder="Describe your assistant"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Model Settings */}
        <div>
          <h3 className="font-semibold mb-3">Model Settings</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="model">Model</Label>
              <Select value={config.model} onValueChange={(value) => updateConfig('model', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="temperature">
                Temperature: {config.temperature.toFixed(1)}
              </Label>
              <Slider
                id="temperature"
                min={0}
                max={2}
                step={0.1}
                value={[config.temperature]}
                onValueChange={(value) => updateConfig('temperature', value[0])}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <h3 className="font-semibold mb-3">Instructions</h3>
          <Textarea
            value={config.instructions}
            onChange={(e) => updateConfig('instructions', e.target.value)}
            placeholder="Enter system instructions for your assistant..."
            rows={6}
            className="text-sm"
          />
        </div>

        {/* Tools */}
        <div>
          <h3 className="font-semibold mb-3">Tools</h3>
          <div className="space-y-2">
            {config.tools.map((tool) => (
              <div key={tool.type} className="flex items-center space-x-2">
                <Checkbox
                  id={tool.type}
                  checked={tool.enabled}
                  onCheckedChange={(checked) => updateTool(tool.type, !!checked)}
                />
                <Label htmlFor={tool.type} className="text-sm">
                  {tool.type === 'code_interpreter' && 'Code Interpreter'}
                  {tool.type === 'file_search' && 'File Search'}
                  {tool.type === 'web_search' && 'Web Search'}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Base */}
        <div>
          <h3 className="font-semibold mb-3">Knowledge Base</h3>
          
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="files" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                File Upload
              </TabsTrigger>
              <TabsTrigger value="google-docs" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Google Docs
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="files" className="space-y-3">
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Drag & drop files here</p>
                <ObjectUploader
                  maxNumberOfFiles={5}
                  maxFileSize={10485760} // 10MB
                  onGetUploadParameters={handleFileUpload}
                  onComplete={handleFileComplete}
                  buttonClassName="text-emerald-600 text-sm hover:underline"
                >
                  Browse files
                </ObjectUploader>
              </div>
              
              {/* Uploaded Files List */}
              {(config.files.length > 0 || (googleDocs && googleDocs.length > 0)) && (
                <div className="space-y-2">
                  {/* Regular uploaded files */}
                  {config.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(file.name)}
                        <span className="text-sm truncate">{file.name}</span>
                        <Badge variant="outline" className="text-xs">File</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {/* Google Docs files */}
                  {googleDocs?.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm truncate">{doc.title}</span>
                        <Badge 
                          variant={doc.status === 'completed' ? 'default' : doc.status === 'error' ? 'destructive' : 'secondary'} 
                          className="text-xs"
                        >
                          {doc.status === 'completed' ? 'Готов' : doc.status === 'error' ? 'Ошибка' : 'Обработка'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(doc.documentUrl, '_blank')}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-blue-500"
                          title="Открыть документ"
                        >
                          <Link className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="google-docs">
              {assistantId ? (
                <GoogleDocsIntegration
                  assistantId={assistantId}
                  userId={userId}
                />
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Сохраните ассистента для добавления Google Docs документов</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <Button
            onClick={handleSave}
            disabled={createAssistantMutation.isPending || updateAssistantMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {assistantId ? 'Save Assistant' : 'Create Assistant'}
          </Button>
          
          {assistantId && (
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exportAssistantMutation.isPending}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Configuration
            </Button>
          )}
        </div>

        {/* Status */}
        {(createAssistantMutation.isPending || updateAssistantMutation.isPending) && (
          <div className="text-center py-2">
            <Badge variant="secondary">Saving...</Badge>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
