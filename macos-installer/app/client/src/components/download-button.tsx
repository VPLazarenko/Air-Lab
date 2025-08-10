import { Button } from "@/components/ui/button";
import { Download, Monitor } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function DownloadButton() {
  const [open, setOpen] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();
  
  const VALID_LICENSE = "0403198422061962";

  const handleDownload = () => {
    if (licenseKey !== VALID_LICENSE) {
      toast({
        title: "Неверный лицензионный ключ",
        description: "Пожалуйста, введите корректный ключ для загрузки",
        variant: "destructive",
      });
      return;
    }

    setDownloading(true);
    
    // Simulate download preparation
    setTimeout(() => {
      // Create download link
      const link = document.createElement("a");
      link.href = "/downloads/AirLab-Platform-Windows-Installer.zip";
      link.download = "AirLab-Platform-Windows-Installer.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Загрузка началась",
        description: "Установщик Air Lab Platform загружается...",
      });
      
      setDownloading(false);
      setOpen(false);
      setLicenseKey("");
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900 dark:border-blue-800 dark:text-blue-300"
        >
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Скачать для Windows</span>
            <span className="sm:hidden">Windows</span>
          </div>
          <Badge className="ml-2 bg-blue-600 text-white">Air Lab</Badge>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            Air Lab Platform для Windows
          </DialogTitle>
          <DialogDescription className="pt-4 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Включено в установщик:</h4>
              <ul className="space-y-1 text-sm">
                <li>✓ Полная платформа AI ассистентов</li>
                <li>✓ Автоматическая установка Node.js и PostgreSQL</li>
                <li>✓ Предустановленный админ-аккаунт (Admin/admin)</li>
                <li>✓ Автозапуск как Windows-сервис</li>
                <li>✓ Интеграции с Telegram, VK, WhatsApp</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Системные требования:</strong> Windows 10/11 x64, 4GB RAM, 2GB свободного места
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="license">Лицензионный ключ</Label>
            <Input
              id="license"
              type="text"
              placeholder="Введите лицензионный ключ"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Ключ предоставляется при покупке лицензии
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={downloading}
          >
            Отмена
          </Button>
          <Button
            onClick={handleDownload}
            disabled={downloading || !licenseKey}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {downloading ? (
              <>Подготовка...</>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Скачать установщик
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}