import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Lock, Calendar, AlertTriangle } from "lucide-react";

interface TariffActivationFormProps {
  user: any;
  onClose?: () => void;
}

export function TariffActivationForm({ user, onClose }: TariffActivationFormProps) {
  const [activationCode, setActivationCode] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const activationMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest('/api/activate-plan', 'POST', { activationCode: code });
    },
    onSuccess: (data) => {
      toast({
        title: "Тариф активирован!",
        description: `Тариф ${data.plan.toUpperCase()} успешно активирован на 1 месяц`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setActivationCode("");
      onClose?.();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка активации",
        description: error.message || "Неверный код активации",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCode.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите код активации",
        variant: "destructive",
      });
      return;
    }
    activationMutation.mutate(activationCode.trim());
  };

  // Проверка, заморожен ли аккаунт
  const isAccountFrozen = user?.isAccountFrozen;
  const daysSinceRegistration = user?.createdAt ? 
    Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const isNearFreeze = daysSinceRegistration >= 2 && user?.plan === 'free';

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Активация тарифного плана
        </CardTitle>
        {isAccountFrozen && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">Аккаунт заморожен</span>
          </div>
        )}
        {isNearFreeze && !isAccountFrozen && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Заморозка через {3 - daysSinceRegistration} дн.</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activation-code">Код активации</Label>
            <Input
              id="activation-code"
              type="password"
              placeholder="Введите код активации"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              disabled={activationMutation.isPending}
              maxLength={10}
            />
          </div>

          {/* Информация о текущем плане */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Текущий план:</span>
              <Badge variant={user?.plan === 'free' ? 'outline' : 'default'}>
                {user?.plan === 'free' ? 'Бесплатный' :
                 user?.plan === 'basic' ? 'BASIC' :
                 user?.plan === 'pro' ? 'PRO' :
                 user?.plan === 'premium' ? 'PREMIUM' : user?.plan?.toUpperCase()}
              </Badge>
            </div>
            
            {user?.planExpiresAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>Действует до: {new Date(user.planExpiresAt).toLocaleDateString('ru-RU')}</span>
              </div>
            )}
          </div>

          {/* Доступные планы (без раскрытия кодов) */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600 dark:text-gray-400">Доступные тарифы:</Label>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>BASIC (1 месяц)</span>
                <span className="text-gray-500">Код активации</span>
              </div>
              <div className="flex justify-between">
                <span>PRO (1 месяц)</span>
                <span className="text-gray-500">Код активации</span>
              </div>
              <div className="flex justify-between">
                <span>PREMIUM (1 месяц)</span>
                <span className="text-gray-500">Код активации</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={activationMutation.isPending || !activationCode.trim()}
              className="flex-1"
            >
              {activationMutation.isPending ? "Активация..." : "Активировать"}
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
            )}
          </div>
        </form>
        
        {isAccountFrozen && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            <p className="text-sm">
              <strong>Аккаунт заморожен.</strong> Для разморозки активируйте любой тарифный план.
              Все ваши ассистенты и данные сохранены и будут доступны после активации.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}