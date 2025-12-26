import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import logo from '@/assets/logo-frango-facil.png';

// Rate limiting - máximo de tentativas
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60000; // 1 minuto em ms

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Rate limiting state
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const lockoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Limpar timer ao desmontar
  useEffect(() => {
    return () => {
      if (lockoutTimerRef.current) {
        clearInterval(lockoutTimerRef.current);
      }
    };
  }, []);

  // Verificar se está em lockout
  const isLockedOut = lockoutUntil !== null && Date.now() < lockoutUntil;
  const remainingLockout = isLockedOut ? Math.ceil((lockoutUntil! - Date.now()) / 1000) : 0;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar lockout
    if (isLockedOut) {
      toast.error(`Aguarde ${remainingLockout} segundos antes de tentar novamente`);
      return;
    }

    if (!email.trim() || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      // Ativar lockout se exceder tentativas
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutEnd = Date.now() + LOCKOUT_DURATION;
        setLockoutUntil(lockoutEnd);

        // Timer para atualizar UI durante lockout
        lockoutTimerRef.current = setInterval(() => {
          if (Date.now() >= lockoutEnd) {
            setLockoutUntil(null);
            setAttempts(0);
            if (lockoutTimerRef.current) {
              clearInterval(lockoutTimerRef.current);
            }
          }
        }, 1000);

        toast.error('Muitas tentativas. Aguarde 1 minuto antes de tentar novamente.');
      } else {
        // Mensagem genérica por segurança (não revelar se email existe)
        toast.error('Email ou senha incorretos');
      }
    } else {
      // Reset attempts on success
      setAttempts(0);
      setLockoutUntil(null);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    }

    setIsLoading(false);
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="Frango Fácil" className="h-16 w-auto" />
            </div>
            <CardTitle className="font-display text-3xl text-primary">
              Entrar
            </CardTitle>
            <CardDescription>
              Faça login para continuar seu pedido
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
                    autoComplete="email"
                    disabled={isLockedOut}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isLockedOut}
                />
              </div>

              {/* Link para recuperação de senha */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              {/* Aviso de lockout */}
              {isLockedOut && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600 text-center">
                    Muitas tentativas. Aguarde {remainingLockout}s
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full gradient-primary"
                disabled={isLoading || isLockedOut}
              >
                {isLoading ? 'Entrando...' : isLockedOut ? `Aguarde ${remainingLockout}s` : 'Entrar'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Cadastre-se
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
