import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const whatsappLink = "https://wa.me/5585999991111?text=Olá! Gostaria de fazer um pedido.";

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-pulse-glow"
      style={{ '--tw-shadow-color': 'rgb(34 197 94)' } as React.CSSProperties}
      aria-label="Chamar no WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
