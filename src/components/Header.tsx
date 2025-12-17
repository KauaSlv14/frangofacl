import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo-frango-facil.png';

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, isAdmin } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Frango Fácil" className="h-12 md:h-16 w-auto" />
            <span className="font-display text-2xl md:text-3xl text-primary hidden sm:inline">
              Frango Fácil
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#inicio" className="text-foreground hover:text-primary transition-colors font-medium">
              Início
            </a>
            <a href="#sobre" className="text-foreground hover:text-primary transition-colors font-medium">
              Sobre
            </a>
            <a href="#cardapio" className="text-foreground hover:text-primary transition-colors font-medium">
              Cardápio
            </a>
            <a href="#contato" className="text-foreground hover:text-primary transition-colors font-medium">
              Contato
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {user && isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="icon" className="text-foreground">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
            
            <Button
              variant="default"
              size="icon"
              onClick={onCartClick}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <a 
                href="#inicio" 
                className="text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </a>
              <a 
                href="#sobre" 
                className="text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </a>
              <a 
                href="#cardapio" 
                className="text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Cardápio
              </a>
              <a 
                href="#contato" 
                className="text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </a>
              {user && isAdmin && (
                <Link 
                  to="/admin" 
                  className="text-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
