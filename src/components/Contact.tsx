import { Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Contact() {
  const whatsappLink = "https://wa.me/558581002335?text=Olá! Gostaria de fazer um pedido.";

  return (
    <section id="contato" className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">
            Entre em Contato
          </h2>
          <p className="text-muted-foreground text-lg">
            Estamos prontos para atender você!
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg">
            <h3 className="font-bold text-xl mb-6 text-foreground">Informações</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Horário de Funcionamento</p>
                  <p className="text-muted-foreground">Terça a Domingo: 10h às 14h</p>
                  <p className="text-muted-foreground">Segunda-feira: Fechado</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Endereço</p>
                  <p className="text-muted-foreground">Av. Central, 333 - Quadra 33</p>
                  <p className="text-muted-foreground">Cidade 2000, Fortaleza - CE</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Telefone / WhatsApp</p>
                  <a 
                    href="tel:8581002335" 
                    className="text-primary hover:underline"
                  >
                    (85) 8100-2335 (WhatsApp)
                  </a>
                  <br />
                  <a 
                    href="tel:8532490764" 
                    className="text-primary hover:underline"
                  >
                    (85) 3249-0764 (Ligações)
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button variant="outline" size="icon" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          <div className="bg-primary rounded-2xl p-6 md:p-8 shadow-lg text-primary-foreground flex flex-col justify-center items-center text-center">
            <h3 className="font-bold text-2xl mb-4">Peça pelo WhatsApp</h3>
            <p className="mb-6 opacity-90">
              Atendimento rápido e personalizado! Tire suas dúvidas e faça seu pedido.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8"
              asChild
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Phone className="mr-2 h-5 w-5" />
                Chamar no WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
