import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, RefreshCw, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { OrderStatus, OrderWithItems } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import logo from '@/assets/logo-frango-facil.png';

const STATUS_LABELS: Record<OrderStatus, string> = {
  novo: 'Novo',
  em_preparo: 'Em Preparo',
  a_caminho: 'A Caminho',
  entregue: 'Entregue',
  cancelado: 'Cancelado'
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  novo: 'bg-blue-500',
  em_preparo: 'bg-yellow-500',
  a_caminho: 'bg-purple-500',
  entregue: 'bg-green-500',
  cancelado: 'bg-red-500'
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  novo: 'em_preparo',
  em_preparo: 'a_caminho',
  a_caminho: 'entregue',
  entregue: null,
  cancelado: null
};

export function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, signOut, loading } = useAuth();
  const { data: orders, isLoading, refetch } = useOrders();
  const updateStatus = useUpdateOrderStatus();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-4">
              Você não tem permissão para acessar esta área.
              Peça a um administrador para liberar seu acesso.
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

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm) ||
      order.order_number.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: newStatus });
      toast.success(`Status atualizado para "${STATUS_LABELS[newStatus]}"`);
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Frango Fácil" className="h-10 w-auto" />
              <div>
                <h1 className="font-bold text-lg">Painel Admin</h1>
                <p className="text-xs text-muted-foreground">Frango Fácil</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                Ver Site
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{orders?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Novos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-500">
                {orders?.filter(o => o.status === 'novo').length || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Preparo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-500">
                {orders?.filter(o => o.status === 'em_preparo').length || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Entregues Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-500">
                {orders?.filter(o => 
                  o.status === 'entregue' && 
                  new Date(o.created_at).toDateString() === new Date().toDateString()
                ).length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando pedidos...</p>
          </div>
        ) : filteredOrders?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders?.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order}
                onStatusChange={handleStatusChange}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

interface OrderCardProps {
  order: OrderWithItems;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  formatPrice: (price: number) => string;
}

function OrderCard({ order, onStatusChange, formatPrice }: OrderCardProps) {
  const nextStatus = NEXT_STATUS[order.status];

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-bold text-lg">#{order.order_number}</span>
              <Badge className={`${STATUS_COLORS[order.status]} text-white`}>
                {STATUS_LABELS[order.status]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {format(new Date(order.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">{order.customer_name}</p>
                <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                {order.customer_address && (
                  <p className="text-sm text-muted-foreground mt-1">{order.customer_address}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">
                    {order.delivery_type === 'entrega' ? 'Entrega' : 'Retirada'}
                  </Badge>
                  <Badge variant="outline">
                    {order.payment_method === 'pix' ? 'Pix' : 'Na entrega'}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Itens:</p>
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground">
                    <span>{item.quantity}x {item.product_name}</span>
                    {item.accompaniments && item.accompaniments.length > 0 && (
                      <span className="text-xs"> ({item.accompaniments.join(', ')})</span>
                    )}
                  </div>
                ))}
                {order.observations && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    Obs: {order.observations}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{formatPrice(order.total)}</p>
              {order.delivery_fee > 0 && (
                <p className="text-xs text-muted-foreground">
                  inclui {formatPrice(order.delivery_fee)} de entrega
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {nextStatus && (
                <Button
                  size="sm"
                  onClick={() => onStatusChange(order.id, nextStatus)}
                >
                  {STATUS_LABELS[nextStatus]}
                </Button>
              )}
              {order.status !== 'cancelado' && order.status !== 'entregue' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onStatusChange(order.id, 'cancelado')}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
