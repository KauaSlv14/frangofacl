import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

interface MobileBannerProps {
  onCartClick: () => void;
}

export function MobileBanner({ onCartClick }: MobileBannerProps) {
  const { itemCount, subtotal } = useCart();

  if (itemCount === 0) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-primary text-primary-foreground p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</p>
          <p className="text-sm opacity-90">{formatPrice(subtotal)}</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={onCartClick}
          className="flex items-center gap-2"
        >
          <ShoppingCart className="h-5 w-5" />
          Ver Carrinho
        </Button>
      </div>
    </div>
  );
}
