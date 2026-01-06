import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { OrderWithItems, OrderStatus } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Clock, CheckCircle, RefreshCcw, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const STATUS_LABELS: Record<OrderStatus, string> = {
    novo: 'Pendente',
    pendente: 'Pendente',
    pago: 'Pago',
    em_preparacao: 'Em Preparo',
    pronto_para_entrega: 'Pronto p/ Entrega',
    em_entrega: 'Em Rota',
    entregue: 'Entregue',
    cancelado: 'Cancelado'
};

const STATUS_COLORS: Record<OrderStatus, string> = {
    novo: 'bg-yellow-500',
    pendente: 'bg-yellow-500',
    pago: 'bg-blue-500',
    em_preparacao: 'bg-orange-500',
    pronto_para_entrega: 'bg-purple-500',
    em_entrega: 'bg-indigo-500',
    entregue: 'bg-green-500',
    cancelado: 'bg-red-500'
};

export function MyOrdersPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { addItem } = useCart();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const { data: orders, isLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: async () => {
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .in('order_id', ordersData.map(o => o.id));

            if (itemsError) throw itemsError;

            return ordersData.map(order => ({
                ...order,
                items: itemsData.filter(item => item.order_id === order.id)
            })) as OrderWithItems[];
        },
        enabled: !!user
    });

    // Realtime subscription
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('my-orders-update')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `user_id=eq.${user.id}`
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['my-orders'] });
                    toast.info('Status do pedido atualizado!');
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    const handleReorder = (order: OrderWithItems) => {
        order.items.forEach(item => {
            // Reconstruct product object enough for cart
            // Note: We might be missing current description/image if it changed, 
            // but price/name is preserved in order_item. 
            // Ideally we would fetch latest product data, but for MVP:
            addItem({
                id: item.product_id,
                name: item.product_name,
                price: item.price,
                category: 'Reorder', // Placeholder
                description: '',
                is_active: true,
                image_url: null,
                created_at: '',
                updated_at: ''
            }, item.quantity, item.accompaniments || [], item.observations || '');
        });
        toast.success('Itens adicionados ao carrinho!');
        navigate('/checkout'); // Or open cart drawer
    };

    const formatPrice = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (loading || isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const activeOrders = orders?.filter(o => !['entregue', 'cancelado'].includes(o.status)) || [];
    const pastOrders = orders?.filter(o => ['entregue', 'cancelado'].includes(o.status)) || [];

    return (
        <div className="min-h-screen bg-muted/30 pb-10">
            <div className="container px-4 py-8 mx-auto max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Meus Pedidos</h1>
                    <Button variant="outline" onClick={() => navigate('/')}>
                        Voltar ao Menu
                    </Button>
                </div>

                <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="active">Em Andamento ({activeOrders.length})</TabsTrigger>
                        <TabsTrigger value="history">Histórico ({pastOrders.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-4">
                        {activeOrders.length === 0 ? (
                            <EmptyState message="Você não tem pedidos em andamento." />
                        ) : (
                            activeOrders.map(order => (
                                <OrderCard key={order.id} order={order} formatPrice={formatPrice} />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        {pastOrders.length === 0 ? (
                            <EmptyState message="Você ainda não tem histórico de pedidos." />
                        ) : (
                            pastOrders.map(order => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    formatPrice={formatPrice}
                                    isHistory
                                    onReorder={() => handleReorder(order)}
                                />
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{message}</p>
            <Button variant="link" className="mt-2" onClick={() => window.location.href = '/'}>
                Fazer um pedido agora
            </Button>
        </div>
    );
}

function OrderCard({
    order,
    formatPrice,
    isHistory,
    onReorder
}: {
    order: OrderWithItems;
    formatPrice: (n: number) => string;
    isHistory?: boolean;
    onReorder?: () => void;
}) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Badge className={`${STATUS_COLORS[order.status]} hover:${STATUS_COLORS[order.status]} text-white border-0`}>
                            {STATUS_LABELS[order.status] || order.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            #{order.order_number} • {format(new Date(order.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </span>
                    </div>
                    <p className="font-bold">{formatPrice(order.total)}</p>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-3">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <div className="flex gap-2">
                                <span className="font-medium text-foreground">{item.quantity}x</span>
                                <span>
                                    {item.product_name}
                                    {item.accompaniments && item.accompaniments.length > 0 && (
                                        <span className="text-muted-foreground text-xs block">
                                            + {item.accompaniments.join(', ')}
                                        </span>
                                    )}
                                </span>
                            </div>
                            <span className="text-muted-foreground">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                    ))}

                    {/* Mock items in observations */}
                    {order.observations && order.observations.includes('[ITENS EXTRAS]') && (
                        <div className="text-sm bg-yellow-50 p-2 rounded border border-yellow-100 mt-2">
                            <span className="font-semibold text-yellow-700 block text-xs mb-1">Itens Adicionais:</span>
                            <pre className="whitespace-pre-wrap font-sans text-yellow-800">
                                {order.observations.split('[ITENS EXTRAS]:')[1]}
                            </pre>
                        </div>
                    )}
                </div>

                {isHistory && (
                    <div className="mt-4 pt-4 border-t flex justify-end">
                        <Button variant="outline" size="sm" onClick={onReorder} className="gap-2">
                            <RefreshCcw className="h-4 w-4" />
                            Refazer Pedido
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
