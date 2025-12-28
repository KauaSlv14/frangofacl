import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderStatus, OrderWithItems, CartItem, PaymentMethod, DeliveryType } from '@/types';
import { useEffect } from 'react';

export function useOrders() {
    const queryClient = useQueryClient();

    const ordersQuery = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            const { data: items, error: itemsError } = await supabase
                .from('order_items')
                .select('*');

            if (itemsError) throw itemsError;

            return (orders as Order[]).map(order => ({
                ...order,
                items: (items as OrderItem[]).filter(item => item.order_id === order.id)
            })) as OrderWithItems[];
        }
    });

    useEffect(() => {
        const channel = supabase
            .channel('orders-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    return ordersQuery;
}

interface CreateOrderParams {
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    deliveryType: DeliveryType;
    paymentMethod: PaymentMethod;
    observations?: string;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    userId: string;
}

export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: CreateOrderParams) => {
            // Geramos o ID no cliente para não precisar de RETURNING/SELECT (que é bloqueado por RLS para usuários públicos)
            const orderId = crypto.randomUUID();

            // Separate real DB items from mock/extra items
            // Mock items have IDs like 'panelada-extra' which cause FK errors in order_items
            const regularItems = params.items.filter(item => !item.product.id.includes('-extra'));
            const mockItems = params.items.filter(item => item.product.id.includes('-extra'));

            let finalObservations = params.observations || '';

            // Append mock items to observations
            if (mockItems.length > 0) {
                const mockNotes = mockItems.map(item => {
                    const acc = item.accompaniments.length > 0 ? ` (+ ${item.accompaniments.join(', ')})` : '';
                    return `${item.quantity}x ${item.product.name}${acc}`;
                }).join('; ');

                finalObservations = finalObservations
                    ? `${finalObservations}\n\n[ITENS EXTRAS]: ${mockNotes}`
                    : `[ITENS EXTRAS]: ${mockNotes}`;
            }

            const { error: orderError } = await supabase
                .from('orders')
                .insert({
                    id: orderId,
                    customer_name: params.customerName,
                    customer_phone: params.customerPhone,
                    customer_address: params.customerAddress || null,
                    delivery_type: params.deliveryType,
                    payment_method: params.paymentMethod,
                    observations: finalObservations || null,
                    subtotal: params.subtotal,
                    delivery_fee: params.deliveryFee,
                    total: params.total,
                    status: 'novo',
                    user_id: params.userId
                });

            if (orderError) throw orderError;

            if (regularItems.length > 0) {
                const orderItems = regularItems.map(item => ({
                    order_id: orderId,
                    product_id: item.product.id,
                    product_name: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price,
                    accompaniments: item.accompaniments,
                    observations: item.observations || null
                }));

                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(orderItems);

                if (itemsError) throw itemsError;
            }

            return { id: orderId } as unknown as Order;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
    });
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
            const { error } = await supabase
                .from('orders')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', orderId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
    });
}
