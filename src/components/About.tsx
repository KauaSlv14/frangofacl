import { Flame, Heart, Bike } from 'lucide-react';
import churrasqueira from '@/assets/churrasqueira.jpg';

export function About() {
  return (
    <section id="sobre" className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-6">
              Nossa História
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              O Frango Fácil é uma galeteria/marmitaria com forte presença local na Cidade 2000, Fortaleza. Nossa especialidade é frango assado e pratos executivos para o almoço, preparados diariamente com temperos caseiros e porções generosas. Há anos, servimos os melhores frangos assados na brasa, com aquele sabor inconfundível que só a churrasqueira tradicional pode oferecer.
            </p>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              A unidade fica na Av. Central, 333 (Quadra 33) e funciona de terça a domingo no horário de almoço. Oferecemos retirada no local e entrega rápida para sua comodidade.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-card rounded-lg shadow-sm">
                <Flame className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Na Brasa</p>
              </div>
              <div className="text-center p-4 bg-card rounded-lg shadow-sm">
                <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Com Amor</p>
              </div>
              <div className="text-center p-4 bg-card rounded-lg shadow-sm">
                <Bike className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Entrega Rápida</p>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="relative">
              <img 
                src={churrasqueira} 
                alt="Frango na churrasqueira" 
                className="rounded-2xl shadow-2xl w-full h-[300px] md:h-[400px] object-cover"
              />
              <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground p-4 rounded-xl shadow-lg">
                <p className="font-bold text-2xl">+10 anos</p>
                <p className="text-sm">de tradição</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
