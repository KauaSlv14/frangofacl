import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logo from '@/assets/logo-frango-facil.png';

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    // Check if phone already exists
    if (phone) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

      if (existingProfile) {
        toast.error('Já existe uma conta com esse telefone. Faça login ou recupere sua senha.');
        setIsLoading(false);
        return;
      }
    }

    const { error } = await signUp(email, password, name);
    
    if (error) {
      if (error.message.includes('User already registered')) {
        toast.error('Já existe uma conta com esse email. Faça login ou recupere sua senha.');
      } else {
        toast.error(error.message);
      }
      setIsLoading(false);
      return;
    }

    // Update phone in profile if provided
    if (phone) {
      // The profile is created by the trigger, we'll update it after a short delay
      setTimeout(async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          await supabase
            .from('profiles')
            .update({ phone })
            .eq('user_id', currentUser.id);
        }
      }, 1000);
    }

    toast.success('Conta criada com sucesso!');
    navigate('/');
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="Frango Fácil" className="h-16 w-auto" />
            </div>
            <CardTitle className="font-display text-3xl text-primary">
              Criar Conta
            </CardTitle>
            <CardDescription>
              Cadastre-se para fazer seu pedido
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(85) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
