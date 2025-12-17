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
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateOrderParams) => {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: params.customerName,
          customer_phone: params.customerPhone,
          customer_address: params.customerAddress || null,
          delivery_type: params.deliveryType,
          payment_method: params.paymentMethod,
          observations: params.observations || null,
          subtotal: params.subtotal,
          delivery_fee: params.deliveryFee,
          total: params.total,
          status: 'novo'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = params.items.map(item => ({
        order_id: order.id,
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

      return order as Order;
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
