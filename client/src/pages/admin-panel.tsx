import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Settings, 
  Crown, 
  Calendar, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import type { User } from "@shared/schema";
import Footer from "@/components/Footer";

export default function AdminPanel() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [showPasswords, setShowPasswords] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && isAdmin,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) =>
      apiRequest(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Успех",
        description: "Пользователь обновлен",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Ошибка обновления пользователя",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Доступ запрещен
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              У вас нет прав доступа к панели администратора.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUserUpdate = (userId: string, updates: Partial<User>) => {
    updateUserMutation.mutate({ id: userId, updates });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="gap-1"><Crown className="w-3 h-3" />Администратор</Badge>;
      case 'user':
        return <Badge variant="secondary">Пользователь</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getPlanBadge = (plan: string | null | undefined) => {
    switch (plan) {
      case 'pro':
        return <Badge variant="default">Pro</Badge>;
      case 'enterprise':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Enterprise</Badge>;
      case 'free':
      default:
        return <Badge variant="outline">Бесплатный</Badge>;
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle2 className="w-4 h-4 text-green-500" />
    ) : (
      <AlertTriangle className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 lg:w-8 h-6 lg:h-8 text-red-600" />
            <h1 className="text-2xl lg:text-3xl font-bold">Панель администратора</h1>
          </div>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
            Управление пользователями и системными настройками
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Всего пользователей</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Активных</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.isActive).length}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Администраторов</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <Crown className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pro пользователей</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {users.filter(u => u.plan === 'pro' || u.plan === 'enterprise').length}
                  </p>
                </div>
                <Settings className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Управление пользователями
                </CardTitle>
                <CardDescription>
                  Просмотр и редактирование учетных записей пользователей
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswords(!showPasswords)}
                className="gap-2"
              >
                {showPasswords ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Скрыть пароли
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Показать пароли
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">Загрузка пользователей...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((u, index) => (
                  <div key={u.id}>
                    <div className="p-4 rounded-lg border bg-white dark:bg-slate-800">
                      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                        {/* User Info */}
                        <div className="lg:col-span-2">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(u.isActive)}
                            <div>
                              <h3 className="font-semibold">{u.username}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{u.email}</p>
                              {showPasswords && (
                                <p className="text-xs text-red-500 font-mono mt-1">
                                  Пароль: {u.password.substring(0, 20)}...
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Role */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Роль</p>
                          <Select
                            value={u.role}
                            onValueChange={(value) => handleUserUpdate(u.id, { role: value })}
                            disabled={updateUserMutation.isPending}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Пользователь</SelectItem>
                              <SelectItem value="admin">Администратор</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Plan */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Тариф</p>
                          <Select
                            value={u.plan || "free"}
                            onValueChange={(value) => handleUserUpdate(u.id, { plan: value })}
                            disabled={updateUserMutation.isPending}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Бесплатный</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Status */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Статус</p>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={u.isActive}
                              onCheckedChange={(checked) => handleUserUpdate(u.id, { isActive: checked })}
                              disabled={updateUserMutation.isPending}
                            />
                            <span className="text-sm">
                              {u.isActive ? 'Активен' : 'Заблокирован'}
                            </span>
                          </div>
                        </div>

                        {/* Created Date */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Регистрация</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">
                              {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {index < users.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}