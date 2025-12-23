import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Menu } from '@/components/Menu';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { MobileBanner } from '@/components/MobileBanner';
import { CartDrawer } from '@/components/CartDrawer';

const Index = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className={`min-h-screen bg-background ${itemCount > 0 ? 'pb-24 md:pb-0' : ''}`}>
      <Header onCartClick={() => setIsCartOpen(true)} />
      <Hero />
      <About />
      <Menu />
      <Contact />
      <Footer />
      <WhatsAppButton />
      <MobileBanner onCartClick={() => setIsCartOpen(true)} />
      <CartDrawer 
        open={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default Index;
