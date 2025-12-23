import { MessageCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export function WhatsAppButton() {
  const { itemCount } = useCart();
  const whatsappLink = "https://wa.me/5585999991111?text=Olá! Gostaria de fazer um pedido.";

  // Calculate bottom position based on cart visibility
  // Mobile banner height is approximately 72px (p-4 + content)
  const bottomPosition = itemCount > 0 ? 'bottom-24' : 'bottom-6';

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed right-6 z-30 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 md:bottom-6 ${bottomPosition}`}
      aria-label="Chamar no WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
