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
      return data as Product[];
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
