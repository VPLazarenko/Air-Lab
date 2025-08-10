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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  EyeOff,
  CreditCard,
  Bell,
  Plus,
  Trash2,
  Edit,
  Megaphone
} from "lucide-react";
import type { User, Plan, Announcement } from "@shared/schema";
import Footer from "@/components/Footer";

interface PlanFormData {
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: string;
  features: {
    maxAssistants: number;
    maxConversations: number;
    maxFileUploads: number;
    maxFileSize: number;
    apiAccess: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
    analytics: boolean;
  };
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
}

interface AnnouncementFormData {
  title: string;
  content: string;
  type: string;
  priority: string;
  targetUsers: string;
  isActive: boolean;
  isPinned: boolean;
  expiresAt: string;
}

export default function AdminPanel() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [showPasswords, setShowPasswords] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [planForm, setPlanForm] = useState<PlanFormData>({
    name: "",
    displayName: "",
    description: "",
    price: 0,
    currency: "RUB",
    billingPeriod: "monthly",
    features: {
      maxAssistants: 1,
      maxConversations: 10,
      maxFileUploads: 5,
      maxFileSize: 5,
      apiAccess: false,
      prioritySupport: false,
      customBranding: false,
      analytics: false
    },
    isActive: true,
    isDefault: false,
    sortOrder: 0
  });

  const [announcementForm, setAnnouncementForm] = useState<AnnouncementFormData>({
    title: "",
    content: "",
    type: "info",
    priority: "normal",
    targetUsers: "all",
    isActive: true,
    isPinned: false,
    expiresAt: ""
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ["/api/admin/plans"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: announcements = [], isLoading: announcementsLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/admin/announcements"],
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

  const createPlanMutation = useMutation({
    mutationFn: (planData: PlanFormData) =>
      apiRequest("/api/admin/plans", {
        method: "POST",
        body: JSON.stringify(planData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      setPlanDialogOpen(false);
      setEditingPlan(null);
      resetPlanForm();
      toast({
        title: "Успех",
        description: "План создан",
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: PlanFormData }) =>
      apiRequest(`/api/admin/plans/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      setPlanDialogOpen(false);
      setEditingPlan(null);
      resetPlanForm();
      toast({
        title: "Успех",
        description: "План обновлен",
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/plans/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      toast({
        title: "Успех",
        description: "План удален",
      });
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: (announcementData: AnnouncementFormData) =>
      apiRequest("/api/admin/announcements", {
        method: "POST",
        body: JSON.stringify({
          ...announcementData,
          expiresAt: announcementData.expiresAt ? new Date(announcementData.expiresAt) : null,
          publishedAt: new Date()
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      setAnnouncementDialogOpen(false);
      setEditingAnnouncement(null);
      resetAnnouncementForm();
      toast({
        title: "Успех",
        description: "Объявление создано",
      });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: AnnouncementFormData }) =>
      apiRequest(`/api/admin/announcements/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...updates,
          expiresAt: updates.expiresAt ? new Date(updates.expiresAt) : null
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      setAnnouncementDialogOpen(false);
      setEditingAnnouncement(null);
      resetAnnouncementForm();
      toast({
        title: "Успех",
        description: "Объявление обновлено",
      });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/announcements/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      toast({
        title: "Успех",
        description: "Объявление удалено",
      });
    },
  });

  const resetPlanForm = () => {
    setPlanForm({
      name: "",
      displayName: "",
      description: "",
      price: 0,
      currency: "RUB",
      billingPeriod: "monthly",
      features: {
        maxAssistants: 1,
        maxConversations: 10,
        maxFileUploads: 5,
        maxFileSize: 5,
        apiAccess: false,
        prioritySupport: false,
        customBranding: false,
        analytics: false
      },
      isActive: true,
      isDefault: false,
      sortOrder: 0
    });
  };

  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: "",
      content: "",
      type: "info",
      priority: "normal",
      targetUsers: "all",
      isActive: true,
      isPinned: false,
      expiresAt: ""
    });
  };

  const openPlanDialog = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        displayName: plan.displayName,
        description: plan.description || "",
        price: plan.price,
        currency: plan.currency,
        billingPeriod: plan.billingPeriod,
        features: plan.features as any,
        isActive: plan.isActive || false,
        isDefault: plan.isDefault || false,
        sortOrder: plan.sortOrder || 0
      });
    } else {
      setEditingPlan(null);
      resetPlanForm();
    }
    setPlanDialogOpen(true);
  };

  const openAnnouncementDialog = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setAnnouncementForm({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        priority: announcement.priority,
        targetUsers: announcement.targetUsers,
        isActive: announcement.isActive || false,
        isPinned: announcement.isPinned || false,
        expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().split('T')[0] : ""
      });
    } else {
      setEditingAnnouncement(null);
      resetAnnouncementForm();
    }
    setAnnouncementDialogOpen(true);
  };

  const handlePlanSubmit = () => {
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, updates: planForm });
    } else {
      createPlanMutation.mutate(planForm);
    }
  };

  const handleAnnouncementSubmit = () => {
    if (editingAnnouncement) {
      updateAnnouncementMutation.mutate({ id: editingAnnouncement.id, updates: announcementForm });
    } else {
      createAnnouncementMutation.mutate(announcementForm);
    }
  };

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

  const getStatusIcon = (isActive: boolean | null) => {
    return isActive ? (
      <CheckCircle2 className="w-4 h-4 text-green-500" />
    ) : (
      <AlertTriangle className="w-4 h-4 text-red-500" />
    );
  };

  const getAnnouncementTypeBadge = (type: string) => {
    switch (type) {
      case 'success':
        return <Badge className="bg-green-500">Успех</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Предупреждение</Badge>;
      case 'error':
        return <Badge variant="destructive">Ошибка</Badge>;
      case 'info':
      default:
        return <Badge variant="outline">Информация</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 flex-1">
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 lg:w-8 h-6 lg:h-8 text-red-600" />
            <h1 className="text-2xl lg:text-3xl font-bold">Панель администратора</h1>
          </div>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
            Управление пользователями, планами и объявлениями
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Активных планов</p>
                  <p className="text-2xl font-bold text-green-600">{plans.filter(p => p.isActive).length}</p>
                </div>
                <CreditCard className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Объявлений</p>
                  <p className="text-2xl font-bold text-blue-600">{announcements.length}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-500" />
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
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Планы
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Объявления
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
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
                  <div className="text-center py-8">Загрузка пользователей...</div>
                ) : (
                  <div className="space-y-4">
                    {users.map((u) => (
                      <div key={u.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(u.isActive)}
                            <div>
                              <p className="font-medium">{u.username}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{u.email}</p>
                              {showPasswords && (
                                <p className="text-xs font-mono text-red-600">
                                  Пароль: {u.password?.slice(0, 20)}...
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getRoleBadge(u.role)}
                            {getPlanBadge(u.plan)}
                            <div className="flex items-center gap-1">
                              <Switch
                                checked={u.isActive || false}
                                onCheckedChange={(checked) => 
                                  handleUserUpdate(u.id, { isActive: checked })
                                }
                              />
                            </div>
                            <Select
                              value={u.role}
                              onValueChange={(role) => handleUserUpdate(u.id, { role })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Пользователь</SelectItem>
                                <SelectItem value="admin">Администратор</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              value={u.plan || "free"}
                              onValueChange={(plan) => handleUserUpdate(u.id, { plan })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="free">Бесплатный</SelectItem>
                                <SelectItem value="pro">Pro</SelectItem>
                                <SelectItem value="enterprise">Enterprise</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Управление планами
                    </CardTitle>
                    <CardDescription>
                      Создание и настройка тарифных планов
                    </CardDescription>
                  </div>
                  <Button onClick={() => openPlanDialog()} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Добавить план
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {plansLoading ? (
                  <div className="text-center py-8">Загрузка планов...</div>
                ) : (
                  <div className="space-y-4">
                    {plans.map((plan) => (
                      <div key={plan.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(plan.isActive)}
                            <div>
                              <p className="font-medium">{plan.displayName}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                              <p className="text-sm font-mono">
                                {plan.price} {plan.currency} / {plan.billingPeriod === 'monthly' ? 'месяц' : plan.billingPeriod === 'yearly' ? 'год' : plan.billingPeriod}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {plan.isDefault && <Badge variant="outline">По умолчанию</Badge>}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPlanDialog(plan)}
                              className="gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Изменить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deletePlanMutation.mutate(plan.id)}
                              className="gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              Удалить
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Управление объявлениями
                    </CardTitle>
                    <CardDescription>
                      Создание и публикация новостей для пользователей
                    </CardDescription>
                  </div>
                  <Button onClick={() => openAnnouncementDialog()} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Добавить объявление
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {announcementsLoading ? (
                  <div className="text-center py-8">Загрузка объявлений...</div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getStatusIcon(announcement.isActive)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{announcement.title}</p>
                                {getAnnouncementTypeBadge(announcement.type)}
                                {announcement.isPinned && <Badge variant="outline">Закреплено</Badge>}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{announcement.content}</p>
                              <div className="text-xs text-gray-500">
                                Целевая аудитория: {announcement.targetUsers === 'all' ? 'Все пользователи' : announcement.targetUsers}
                                {announcement.expiresAt && (
                                  <span> • Истекает: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAnnouncementDialog(announcement)}
                              className="gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Изменить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                              className="gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              Удалить
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Plan Dialog */}
        <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Редактировать план" : "Создать новый план"}
              </DialogTitle>
              <DialogDescription>
                Настройте параметры тарифного плана
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Название (ID)</Label>
                <Input
                  value={planForm.name}
                  onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                  placeholder="free, pro, enterprise"
                />
              </div>
              <div className="space-y-2">
                <Label>Отображаемое название</Label>
                <Input
                  value={planForm.displayName}
                  onChange={(e) => setPlanForm({...planForm, displayName: e.target.value})}
                  placeholder="Бесплатный план"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Описание</Label>
                <Textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                  placeholder="Описание возможностей плана"
                />
              </div>
              <div className="space-y-2">
                <Label>Цена</Label>
                <Input
                  type="number"
                  value={planForm.price}
                  onChange={(e) => setPlanForm({...planForm, price: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label>Валюта</Label>
                <Select value={planForm.currency} onValueChange={(value) => setPlanForm({...planForm, currency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RUB">RUB</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Возможности плана</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Макс. ассистентов</Label>
                  <Input
                    type="number"
                    value={planForm.features.maxAssistants}
                    onChange={(e) => setPlanForm({
                      ...planForm,
                      features: {...planForm.features, maxAssistants: Number(e.target.value)}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Макс. разговоров</Label>
                  <Input
                    type="number"
                    value={planForm.features.maxConversations}
                    onChange={(e) => setPlanForm({
                      ...planForm,
                      features: {...planForm.features, maxConversations: Number(e.target.value)}
                    })}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={planForm.features.apiAccess}
                    onCheckedChange={(checked) => setPlanForm({
                      ...planForm,
                      features: {...planForm.features, apiAccess: checked}
                    })}
                  />
                  <Label>Доступ к API</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={planForm.features.prioritySupport}
                    onCheckedChange={(checked) => setPlanForm({
                      ...planForm,
                      features: {...planForm.features, prioritySupport: checked}
                    })}
                  />
                  <Label>Приоритетная поддержка</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handlePlanSubmit}>
                {editingPlan ? "Обновить" : "Создать"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Announcement Dialog */}
        <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? "Редактировать объявление" : "Создать новое объявление"}
              </DialogTitle>
              <DialogDescription>
                Настройте параметры объявления
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Заголовок</Label>
                <Input
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                  placeholder="Заголовок объявления"
                />
              </div>

              <div className="space-y-2">
                <Label>Содержание</Label>
                <Textarea
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({...announcementForm, content: e.target.value})}
                  placeholder="Текст объявления"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <Select value={announcementForm.type} onValueChange={(value) => setAnnouncementForm({...announcementForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Информация</SelectItem>
                      <SelectItem value="success">Успех</SelectItem>
                      <SelectItem value="warning">Предупреждение</SelectItem>
                      <SelectItem value="error">Ошибка</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Приоритет</Label>
                  <Select value={announcementForm.priority} onValueChange={(value) => setAnnouncementForm({...announcementForm, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Низкий</SelectItem>
                      <SelectItem value="normal">Обычный</SelectItem>
                      <SelectItem value="high">Высокий</SelectItem>
                      <SelectItem value="urgent">Срочный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Дата истечения (необязательно)</Label>
                <Input
                  type="date"
                  value={announcementForm.expiresAt}
                  onChange={(e) => setAnnouncementForm({...announcementForm, expiresAt: e.target.value})}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={announcementForm.isActive}
                    onCheckedChange={(checked) => setAnnouncementForm({...announcementForm, isActive: checked})}
                  />
                  <Label>Активно</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={announcementForm.isPinned}
                    onCheckedChange={(checked) => setAnnouncementForm({...announcementForm, isPinned: checked})}
                  />
                  <Label>Закрепить</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleAnnouncementSubmit}>
                {editingAnnouncement ? "Обновить" : "Создать"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}