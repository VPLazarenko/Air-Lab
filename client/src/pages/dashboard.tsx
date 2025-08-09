import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { openaiClient } from "@/lib/openai-client";
import type { Assistant, User } from "@/lib/openai-client";
import { SettingsModal } from "@/components/settings-modal";
import { 
  Bot, 
  Plus, 
  Settings, 
  Play, 
  Folder, 
  GraduationCap, 
  PenTool, 
  BarChart3,
  Moon,
  Sun,
  User as UserIcon
} from "lucide-react";

const DEMO_USER_ID = "84ac8242-6c19-42a0-825b-caa01572e5e6";

export default function Dashboard() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [showSettings, setShowSettings] = useState(false);

  // Initialize demo user
  const { data: user } = useQuery({
    queryKey: ['/api/users', DEMO_USER_ID],
    queryFn: async () => {
      try {
        return await openaiClient.getUser(DEMO_USER_ID);
      } catch {
        // Create demo user if doesn't exist
        return await openaiClient.createUser({
          username: "Demo User",
          email: "demo@example.com",
          settings: { defaultModel: "gpt-4o", autoSave: true, darkMode: isDark }
        });
      }
    },
  });

  const { data: assistants = [], refetch: refetchAssistants } = useQuery({
    queryKey: ['/api/assistants/user', DEMO_USER_ID],
    queryFn: () => openaiClient.getAssistantsByUserId(DEMO_USER_ID),
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
              <h1 className="text-lg font-semibold">Assistant Constructor</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">for Mac OS</p>
            </div>
          </div>
          
          <Link href="/playground">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Assistant
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Workspace
            </div>
            
            <Link href="/">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                <Bot className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </Link>
            
            <Link href="/playground">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Play className="w-4 h-4" />
                <span>Playground</span>
              </div>
            </Link>
            
            <Link href="/files">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Folder className="w-4 h-4" />
                <span>File Manager</span>
              </div>
            </Link>

            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 mt-6">
              Assistants ({assistants.length})
            </div>
            
            <div className="space-y-1">
              {assistants.map((assistant) => (
                <Link key={assistant.id} href={`/playground/${assistant.id}`}>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 ${getAssistantColor(assistant)} rounded-full flex items-center justify-center`}>
                        {getAssistantIcon(assistant)}
                      </div>
                      <span className="text-sm truncate">{assistant.name}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${assistant.isActive ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  </div>
                </Link>
              ))}
              
              {assistants.length === 0 && (
                <div className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                  <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No assistants yet</p>
                  <p className="text-xs">Create your first assistant to get started</p>
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
                <p className="text-sm font-medium">{user?.username || "Demo User"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || "demo@example.com"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-2"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your AI assistants and monitor their performance
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assistants</CardTitle>
                <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assistants.length}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {assistants.filter(a => a.isActive).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Status</CardTitle>
                <div className={`w-2 h-2 rounded-full ${user?.apiKey ? 'bg-green-400' : 'bg-red-400'}`}></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user?.apiKey ? 'Connected' : 'Not Set'}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  OpenAI API Key
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Default Model</CardTitle>
                <BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user?.settings?.defaultModel || 'GPT-4o'}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Current default
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Assistants */}
          <Card>
            <CardHeader>
              <CardTitle>Your Assistants</CardTitle>
            </CardHeader>
            <CardContent>
              {assistants.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No assistants yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first AI assistant to get started with the platform.
                  </p>
                  <Link href="/playground">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Assistant
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {assistants.map((assistant) => (
                    <div key={assistant.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 ${getAssistantColor(assistant)} rounded-lg flex items-center justify-center`}>
                          {getAssistantIcon(assistant)}
                        </div>
                        <div>
                          <h3 className="font-medium">{assistant.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {assistant.description || 'No description'}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {assistant.model}
                            </Badge>
                            <Badge variant={assistant.isActive ? "default" : "secondary"} className="text-xs">
                              {assistant.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/playground/${assistant.id}`}>
                          <Button variant="outline" size="sm">
                            <Play className="w-4 h-4 mr-1" />
                            Open
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
