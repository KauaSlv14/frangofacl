import { useNavigate } from 'react-router-dom';
import { LogOut, RefreshCw, Users, Shield, LayoutDashboard, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useAdminRequests, useApproveAdminRequest, useRejectAdminRequest } from '@/hooks/useAdminRequests';
import { OrderStatus } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import logo from '@/assets/logo-frango-facil.png';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { Check, X } from 'lucide-react';

export function AdminPage() {
    const navigate = useNavigate();
    const { user, isAdmin, signOut, loading } = useAuth();
    const { data: orders, isLoading, refetch } = useOrders();
    const { data: adminRequests } = useAdminRequests();
    const approveRequest = useApproveAdminRequest();
    const rejectRequest = useRejectAdminRequest();
    const updateStatus = useUpdateOrderStatus();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Carregando...</p>
            </div>
        );
    }

    if (!user) return null;

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
                        <p className="text-muted-foreground mb-4">
                            Você não tem permissão para acessar esta área.
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={() => navigate('/')}>
                                Voltar ao site
                            </Button>
                            <Button variant="ghost" onClick={signOut}>
                                Sair
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await updateStatus.mutateAsync({ orderId, status: newStatus });
            toast.success('Status atualizado com sucesso');
        } catch {
            toast.error('Erro ao atualizar status');
        }
    };

    const handleApproveRequest = async (requestId: string, userId: string) => {
        try {
            await approveRequest.mutateAsync({ requestId, userId });
            toast.success('Solicitação aprovada!');
        } catch {
            toast.error('Erro ao aprovar solicitação');
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            await rejectRequest.mutateAsync(requestId);
            toast.success('Solicitação rejeitada.');
        } catch {
            toast.error('Erro ao rejeitar solicitação');
        }
    };

    return (
        <div className="min-h-screen bg-muted/40">
            {/* Sidebar / Topnav */}
            <header className="bg-background border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Frango Fácil" className="h-8 w-auto" />
                        <div className="hidden md:block">
                            <h1 className="font-bold">Painel Administrativo</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => refetch()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Atualizar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                            Ver Loja
                        </Button>
                        <Button variant="ghost" size="sm" onClick={signOut}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <Tabs defaultValue="dashboard" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="dashboard">
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="orders">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Pedidos
                        </TabsTrigger>
                        <TabsTrigger value="users" className="relative">
                            <Users className="h-4 w-4 mr-2" />
                            Usuários
                            {adminRequests && adminRequests.length > 0 && (
                                <span className="ml-2 flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Dashboard Tab */}
                    <TabsContent value="dashboard" className="space-y-6">
                        <DashboardStats orders={orders || []} />

                        <Card>
                            <CardHeader>
                                <CardTitle>Pedidos Recentes</CardTitle>
                                <CardDescription>Últimos pedidos realizados na plataforma.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <OrdersTable
                                    orders={orders?.slice(0, 5) || []}
                                    onUpdateStatus={handleStatusChange}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Orders Tab */}
                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gerenciamento de Pedidos</CardTitle>
                                <CardDescription>Visualize e gerencie todos os pedidos.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <OrdersTable
                                    orders={orders || []}
                                    onUpdateStatus={handleStatusChange}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users">
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Solicitações de Admin
                                    </CardTitle>
                                    <CardDescription>
                                        Aprove ou rejeite solicitações de acesso administrativo.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!adminRequests || adminRequests.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Nenhuma solicitação pendente
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {adminRequests.map((request) => (
                                                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                                    <div>
                                                        <p className="font-medium">{request.full_name || 'Sem nome'}</p>
                                                        <p className="text-sm text-muted-foreground">{request.email}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {format(new Date(request.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => handleApproveRequest(request.id, request.user_id)}
                                                            disabled={approveRequest.isPending}
                                                        >
                                                            <Check className="h-4 w-4 mr-1" />
                                                            Aprovar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleRejectRequest(request.id)}
                                                            disabled={rejectRequest.isPending}
                                                        >
                                                            <X className="h-4 w-4 mr-1" />
                                                            Rejeitar
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Future feature: List of all users could go here */}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
