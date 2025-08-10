import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { openaiClient } from "@/lib/openai-client";
import type { User } from "@/lib/openai-client";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
}

export function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    defaultModel: "gpt-4o",
    autoSave: true,
    darkMode: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setSettings({
        defaultModel: user.settings?.defaultModel || "gpt-4o",
        autoSave: user.settings?.autoSave ?? true,
        darkMode: user.settings?.darkMode ?? false,
      });
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: (data: { settings: any }) => 
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

          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              OpenAI API key is configured on the server
            </p>
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