import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, ChevronDown, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import logo from '@/assets/logo-frango-facil.png';

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, isAdmin, signOut } = useAuth();

  // Pegar nome do usuário dos metadados
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
    setIsMenuOpen(false);
  };

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
            {/* Usuário não logado - mostrar botão de entrar */}
            {!user && (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Entrar
                </Button>
              </Link>
            )}

            {/* Usuário logado - mostrar dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex items-center gap-2"
                  >
                    <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {userInitial}
                    </div>
                    <span className="max-w-24 truncate">{userName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/meus-pedidos" className="cursor-pointer">
                      <Package className="h-4 w-4 mr-2" />
                      Meus Pedidos
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          Painel Admin
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Carrinho */}
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

            {/* Menu mobile */}
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

        {/* Menu mobile expandido */}
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

              {/* Opções de autenticação mobile */}
              <div className="border-t border-border pt-4 mt-2">
                {!user ? (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Entrar
                  </Link>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {userInitial}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{userName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>

                    <Link
                      to="/meus-pedidos"
                      className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Package className="h-4 w-4" />
                      Meus Pedidos
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium mb-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Painel Admin
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors font-medium w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
