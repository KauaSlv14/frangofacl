import { ProductCard } from './ProductCard';
import { useProducts, useAccompaniments } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

export function Menu() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: accompaniments, isLoading: accompanimentsLoading } = useAccompaniments();

  const isLoading = productsLoading || accompanimentsLoading;

  return (
    <section id="cardapio" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">
            Nosso Cardápio
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escolha entre nossos deliciosos pratos, todos preparados na hora com 
            ingredientes frescos e muito carinho
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[350px] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {products?.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                accompaniments={accompaniments || []}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Todos os pratos acompanham os acompanhamentos selecionados
          </p>
        </div>
      </div>
    </section>
  );
}
