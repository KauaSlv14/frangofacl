import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, Accompaniment } from '@/types';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Adding additional menu items as requested
      const additionalItems: Product[] = [
        {
          id: 'panelada-extra',
          name: 'Panelada',
          description: 'Deliciosa panelada tradicional',
          price: 17,
          category: 'Pratos',
          is_active: true,
          image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'feijoada-extra',
          name: 'Feijoada',
          description: 'Feijoada completa com pertences',
          price: 17,
          category: 'Pratos',
          is_active: true,
          image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'assado-panela-extra',
          name: 'Assado de Panela',
          description: 'Carne assada na panela com molho especial',
          price: 17,
          category: 'Pratos',
          is_active: true,
          image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      return [...(data as Product[]), ...additionalItems];
    }
  });
}

export function useAccompaniments() {
  return useQuery({
    queryKey: ['accompaniments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accompaniments')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Accompaniment[];
    }
  });
}

export function useDeliveryFee() {
  return useQuery({
    queryKey: ['delivery_fee'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'delivery_fee')
        .single();

      if (error) throw error;
      return parseFloat(data.value);
    }
  });
}
