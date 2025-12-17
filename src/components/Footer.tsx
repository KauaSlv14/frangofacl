import { Link } from 'react-router-dom';
import logo from '@/assets/logo-frango-facil.png';

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Frango Fácil" className="h-10 w-auto" />
            <span className="font-display text-xl">Frango Fácil</span>
          </div>
          
          <div className="flex gap-6 text-sm">
            <a href="#inicio" className="hover:text-secondary transition-colors">Início</a>
            <a href="#sobre" className="hover:text-secondary transition-colors">Sobre</a>
            <a href="#cardapio" className="hover:text-secondary transition-colors">Cardápio</a>
            <a href="#contato" className="hover:text-secondary transition-colors">Contato</a>
            <Link to="/admin" className="hover:text-secondary transition-colors">Admin</Link>
          </div>

          <p className="text-sm opacity-70">
            © 2024 Frango Fácil. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
