import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordStrengthIndicator } from '@/components/ui/password-strength-indicator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validatePassword, validateEmail, validateName, sanitizeInput, formatPhone } from '@/lib/validation';
import logo from '@/assets/logo-frango-facil.png';

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Validação de senha em tempo real
  const passwordValidation = useMemo(() => validatePassword(password), [password]);

  // Verificar se as senhas coincidem
  const passwordsMatch = password === confirmPassword;
  const showPasswordMismatch = confirmPassword.length > 0 && !passwordsMatch;

  // Verificar se o formulário é válido
  const isFormValid = useMemo(() => {
    const nameValid = validateName(name).isValid;
    const emailValid = validateEmail(email).isValid;
    const passwordValid = passwordValidation.isValid;
    return nameValid && emailValid && passwordValid && passwordsMatch && confirmPassword.length > 0;
  }, [name, email, passwordValidation.isValid, passwordsMatch, confirmPassword]);

  const handlePhoneChange = (value: string) => {
    // Formatar telefone enquanto digita
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      setPhone(formatPhone(cleaned));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação final
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      toast.error(nameValidation.error);
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.error);
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error('Sua senha não atende aos requisitos de segurança');
      return;
    }

    if (!passwordsMatch) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    // Verificar se telefone já existe (se fornecido)
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone) {
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone', cleanedPhone)
          .maybeSingle();

        if (existingProfile) {
          toast.error('Já existe uma conta com esse telefone. Faça login ou recupere sua senha.');
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error('Erro ao verificar telefone:', err);
      }
    }

    const sanitizedName = sanitizeInput(name);
    const { error } = await signUp(email, password, sanitizedName);

    if (error) {
      if (error.message.includes('User already registered')) {
        toast.error('Já existe uma conta com esse email. Faça login ou recupere sua senha.');
      } else if (error.message.includes('Password')) {
        toast.error('Senha inválida. Escolha uma senha mais forte.');
      } else {
        toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
      }
      setIsLoading(false);
      return;
    }

    // Atualizar telefone no perfil se fornecido
    if (cleanedPhone) {
      setTimeout(async () => {
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            await supabase
              .from('profiles')
              .update({ phone: cleanedPhone })
              .eq('user_id', currentUser.id);
          }
        } catch (err) {
          console.error('Erro ao salvar telefone:', err);
        }
      }, 1000);
    }

    toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
    navigate('/');

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
              Criar Conta
            </CardTitle>
            <CardDescription>
              Cadastre-se para fazer seu pedido
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Nome */}
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
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email */}
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
                  />
                </div>
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(85) 99999-9999"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="pl-10"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <PasswordInput
                  id="password"
                  placeholder="Crie uma senha forte"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                {password.length > 0 && (
                  <PasswordStrengthIndicator validation={passwordValidation} />
                )}
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                {showPasswordMismatch && (
                  <p className="text-xs text-red-500">As senhas não coincidem</p>
                )}
                {confirmPassword.length > 0 && passwordsMatch && (
                  <p className="text-xs text-green-600">Senhas coincidem ✓</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary"
                disabled={isLoading || !isFormValid}
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
