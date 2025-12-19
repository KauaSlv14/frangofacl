import { Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import churrasqueira from '@/assets/churrasqueira.jpg';

export function Hero() {
  const scrollToMenu = () => {
    document.getElementById('cardapio')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      id="inicio"
      className="relative min-h-screen flex items-center justify-center pt-16"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${churrasqueira})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 text-center">
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-primary-foreground mb-4 text-shadow animate-float">
          Frango Fácil
        </h1>
        <p className="text-xl md:text-2xl text-primary-foreground/90 mb-2 font-semibold">
          O melhor frango da cidade
        </p>
        <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto">
          Entrega rápida e pratos quentinhos direto da churrasqueira para sua mesa
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            onClick={scrollToMenu}
            className="text-lg px-8 py-6 gradient-primary hover:scale-105 transition-transform"
          >
            Fazer Pedido
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={scrollToMenu}
            className="text-lg px-8 py-6 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
          >
            Ver Cardápio
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center text-primary-foreground/90">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-secondary" />
            <span>10h às 14h</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-secondary" />
            <span>Fortaleza, CE</span>
          </div>
          <a 
            href="tel:8598100235"
            className="flex items-center gap-2 hover:text-secondary transition-colors"
          >
            <Phone className="h-5 w-5 text-secondary" />
            <span>(85) 98100-2335</span>
          </a>
        </div>
      </div>
    </section>
  );
}
