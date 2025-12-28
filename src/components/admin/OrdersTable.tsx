import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { OrderWithItems, OrderStatus } from "@/types";
import { MoreHorizontal, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrdersTableProps {
    orders: OrderWithItems[];
    onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
    pendente: 'Pendente',
    pago: 'Pago',
    em_preparacao: 'Em Preparo',
    pronto_para_entrega: 'Pronto p/ Entrega',
    em_entrega: 'Em Rota',
    entregue: 'Entregue',
    cancelado: 'Cancelado'
};

const STATUS_COLORS: Record<OrderStatus, string> = {
    pendente: 'bg-yellow-500',
    pago: 'bg-blue-500',
    em_preparacao: 'bg-orange-500',
    pronto_para_entrega: 'bg-purple-500',
    em_entrega: 'bg-indigo-500',
    entregue: 'bg-green-500',
    cancelado: 'bg-red-500'
};

export function OrdersTable({ orders, onUpdateStatus }: OrdersTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_phone.includes(searchTerm) ||
            order.order_number.toString().includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const formatPrice = (price: number) => {
        return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
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
                        <SelectValue placeholder="Filtrar Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pedido</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    Nenhum pedido encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.order_number}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{order.customer_name}</span>
                                            <span className="text-xs text-muted-foreground">{order.customer_phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatPrice(order.total)}</TableCell>
                                    <TableCell>
                                        <Badge className={`${STATUS_COLORS[order.status]} text-white hover:${STATUS_COLORS[order.status]}`}>
                                            {STATUS_LABELS[order.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(order.created_at), "dd/MM HH:mm", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Atualizar Status</DropdownMenuLabel>
                                                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                                                    <DropdownMenuItem
                                                        key={status}
                                                        onClick={() => onUpdateStatus(order.id, status as OrderStatus)}
                                                    >
                                                        {label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                    Página {page} de {totalPages || 1}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                >
                    Próxima
                </Button>
            </div>
        </div>
    );
}
