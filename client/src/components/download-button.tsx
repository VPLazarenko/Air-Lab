import { Button } from "@/components/ui/button";
import { Download, Monitor, Apple } from "lucide-react";
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
  const [openWindows, setOpenWindows] = useState(false);
  const [openMacOS, setOpenMacOS] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();
  
  const VALID_LICENSE = "0403198422061962";

  const handleDownload = (platform: 'windows' | 'macos') => {
    if (licenseKey !== VALID_LICENSE) {
      toast({
        title: "Неверный лицензионный ключ",
        description: "Пожалуйста, введите корректный ключ для загрузки",
        variant: "destructive",
      });
      return;
    }

    setDownloading(true);
    
    const fileMap = {
      windows: {
        href: "/downloads/AirLab-Platform-Windows-Installer.zip",
        filename: "AirLab-Platform-Windows-Installer.zip",
        description: "Установщик Air Lab Platform для Windows загружается..."
      },
      macos: {
        href: "/downloads/AirLab-Assistant-Builder-MacOS.zip", 
        filename: "AirLab-Assistant-Builder-MacOS.zip",
        description: "Установщик Air Lab Platform для Mac OS загружается..."
      }
    };
    
    // Simulate download preparation
    setTimeout(() => {
      // Create download link
      const file = fileMap[platform];
      const link = document.createElement("a");
      link.href = file.href;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Загрузка началась",
        description: file.description,
      });
      
      setDownloading(false);
      setOpenWindows(false);
      setOpenMacOS(false);
      setLicenseKey("");
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Windows Download */}
      <Dialog open={openWindows} onOpenChange={setOpenWindows}>
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
            <DialogDescription>
              Автономный установщик со всеми компонентами платформы
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Включено в установщик:</h4>
              <ul className="space-y-1 text-sm">
                <li>✓ Полная платформа AI ассистентов</li>
                <li>✓ Автоматическая установка Node.js и PostgreSQL</li>
                <li>✓ Предустановленный админ-аккаунт (admin/admin)</li>
                <li>✓ Автозапуск как Windows-сервис</li>
                <li>✓ Интеграции с Telegram, VK, WhatsApp</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Системные требования:</strong> Windows 10/11 x64, 4GB RAM, 2GB свободного места
              </p>
            </div>
            
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
              onClick={() => setOpenWindows(false)}
              disabled={downloading}
            >
              Отмена
            </Button>
            <Button
              onClick={() => handleDownload('windows')}
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

      {/* Mac OS Download */}
      <Dialog open={openMacOS} onOpenChange={setOpenMacOS}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2 bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-800 dark:text-gray-300"
          >
            <div className="flex items-center gap-2">
              <Apple className="w-4 h-4" />
              <span className="hidden sm:inline">Скачать для Mac OS</span>
              <span className="sm:hidden">Mac OS</span>
            </div>
            <Badge className="ml-2 bg-gray-600 text-white">Air Lab</Badge>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                <Apple className="w-6 h-6 text-white" />
              </div>
              Air Lab Platform для Mac OS
            </DialogTitle>
            <DialogDescription>
              Автономный установщик с поддержкой Homebrew
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Включено в установщик:</h4>
              <ul className="space-y-1 text-sm">
                <li>✓ Полная платформа AI ассистентов</li>
                <li>✓ Автоматическая установка Node.js и PostgreSQL через Homebrew</li>
                <li>✓ Предустановленный админ-аккаунт (admin/admin)</li>
                <li>✓ Автозапуск приложения в Applications</li>
                <li>✓ Интеграции с Telegram, VK, WhatsApp</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Системные требования:</strong> Mac OS 10.15+, 8GB RAM, 2GB свободного места
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="license-mac">Лицензионный ключ</Label>
              <Input
                id="license-mac"
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
              onClick={() => setOpenMacOS(false)}
              disabled={downloading}
            >
              Отмена
            </Button>
            <Button
              onClick={() => handleDownload('macos')}
              disabled={downloading || !licenseKey}
              className="bg-gray-600 hover:bg-gray-700"
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
    </div>
  );
}