import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Product, Accompaniment } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  accompaniments: Accompaniment[];
}

export function ProductCard({ product, accompaniments }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAccompaniments, setSelectedAccompaniments] = useState<string[]>([]);
  const [observations, setObservations] = useState('');
  const { addItem } = useCart();

  const handleAccompanimentChange = (name: string, checked: boolean) => {
    if (checked) {
      setSelectedAccompaniments(prev => [...prev, name]);
    } else {
      setSelectedAccompaniments(prev => prev.filter(a => a !== name));
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity, selectedAccompaniments, observations);
    toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`);
    setQuantity(1);
    setSelectedAccompaniments([]);
    setObservations('');
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-4 md:p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg text-foreground">{product.name}</h3>
            {product.description && (
              <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
            )}
          </div>
          <span className="text-xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-2">Acompanhamentos:</p>
          <div className="grid grid-cols-2 gap-2">
            {accompaniments.map((acc) => (
              <div key={acc.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${product.id}-${acc.id}`}
                  checked={selectedAccompaniments.includes(acc.name)}
                  onCheckedChange={(checked) => handleAccompanimentChange(acc.name, checked as boolean)}
                />
                <label 
                  htmlFor={`${product.id}-${acc.id}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {acc.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <Textarea
            placeholder="Observações (ex: sem cebola)"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="resize-none h-16 text-sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-8 w-8"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-bold text-lg w-6 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button 
            onClick={handleAddToCart}
            className="gradient-primary"
          >
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
