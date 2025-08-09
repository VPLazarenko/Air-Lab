import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { openaiClient } from "@/lib/openai-client";
import type { User } from "@/lib/openai-client";
import { Eye, EyeOff } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
}

export function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    apiKey: "",
    defaultModel: "gpt-4o",
    autoSave: true,
    darkMode: false,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setSettings({
        apiKey: user.apiKey || "",
        defaultModel: user.settings?.defaultModel || "gpt-4o",
        autoSave: user.settings?.autoSave ?? true,
        darkMode: user.settings?.darkMode ?? false,
      });
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: (data: { apiKey: string; settings: any }) => 
      openaiClient.updateUser(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', user!.id] });
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!user) return;

    updateUserMutation.mutate({
      apiKey: settings.apiKey,
      settings: {
        defaultModel: settings.defaultModel,
        autoSave: settings.autoSave,
        darkMode: settings.darkMode,
      },
    });
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                placeholder="sk-..."
                value={settings.apiKey}
                onChange={(e) => updateSetting('apiKey', e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Your API key is stored locally and never shared
            </p>
          </div>
          
          <div>
            <Label htmlFor="defaultModel">Default Model</Label>
            <Select value={settings.defaultModel} onValueChange={(value) => updateSetting('defaultModel', value)}>
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
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoSave"
              checked={settings.autoSave}
              onCheckedChange={(checked) => updateSetting('autoSave', !!checked)}
            />
            <Label htmlFor="autoSave" className="text-sm">
              Auto-save conversations
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="darkMode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => updateSetting('darkMode', !!checked)}
            />
            <Label htmlFor="darkMode" className="text-sm">
              Dark mode
            </Label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateUserMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
