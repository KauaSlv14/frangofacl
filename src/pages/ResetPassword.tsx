import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordStrengthIndicator } from '@/components/ui/password-strength-indicator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { validatePassword } from '@/lib/validation';
import logo from '@/assets/logo-frango-facil.png';

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const { updatePassword, session, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState(false);
    const [hasValidSession, setHasValidSession] = useState(false);
    const [checking, setChecking] = useState(true);

    // Verificar se usuário tem sessão de recuperação
    useEffect(() => {
        // Aguardar o loading do auth terminar
        if (loading) return;

        // Verificar se há sessão válida (usuário veio do link de recuperação)
        if (session) {
            setHasValidSession(true);
        }
        setChecking(false);
    }, [session, loading]);

    // Validação de senha em tempo real
    const passwordValidation = useMemo(() => validatePassword(password), [password]);

    // Verificar se as senhas coincidem
    const passwordsMatch = password === confirmPassword;
    const showPasswordMismatch = confirmPassword.length > 0 && !passwordsMatch;

    // Verificar se o formulário é válido
    const isFormValid = passwordValidation.isValid && passwordsMatch && confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordValidation.isValid) {
            toast.error('Sua senha não atende aos requisitos de segurança');
            return;
        }

        if (!passwordsMatch) {
            toast.error('As senhas não coincidem');
            return;
        }

        setIsLoading(true);

        const { error } = await updatePassword(password);

        if (error) {
            if (error.message.includes('same password')) {
                toast.error('A nova senha deve ser diferente da senha anterior');
            } else {
                toast.error(error.message || 'Erro ao atualizar senha. Tente novamente.');
            }
            setIsLoading(false);
            return;
        }

        setSuccess(true);
        toast.success('Senha atualizada com sucesso!');

        // Redirecionar após 3 segundos
        setTimeout(() => {
            navigate('/');
        }, 3000);

        setIsLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Card className="shadow-xl">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <CardTitle className="font-display text-2xl text-primary">
                                Senha Atualizada!
                            </CardTitle>
                            <CardDescription className="text-base">
                                Sua senha foi alterada com sucesso. Você será redirecionado automaticamente.
                            </CardDescription>
                        </CardHeader>

                        <CardFooter>
                            <Link to="/" className="w-full">
                                <Button variant="default" className="w-full gradient-primary">
                                    Ir para a página inicial
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    }

    // Loading enquanto verifica sessão
    if (checking || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Sessão inválida ou expirada
    if (!hasValidSession) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Card className="shadow-xl">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                                    <ArrowLeft className="h-8 w-8 text-red-600" />
                                </div>
                            </div>
                            <CardTitle className="font-display text-2xl text-primary">
                                Link Expirado
                            </CardTitle>
                            <CardDescription className="text-base">
                                O link de recuperação de senha expirou ou é inválido. Solicite um novo link.
                            </CardDescription>
                        </CardHeader>

                        <CardFooter className="flex flex-col gap-2">
                            <Link to="/forgot-password" className="w-full">
                                <Button variant="default" className="w-full gradient-primary">
                                    Solicitar novo link
                                </Button>
                            </Link>
                            <Link to="/login" className="w-full">
                                <Button variant="outline" className="w-full">
                                    Voltar para login
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <img src={logo} alt="Frango Fácil" className="h-16 w-auto" />
                        </div>
                        <CardTitle className="font-display text-2xl text-primary">
                            Nova Senha
                        </CardTitle>
                        <CardDescription>
                            Crie uma nova senha segura para sua conta
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nova Senha */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Nova Senha</Label>
                                <PasswordInput
                                    id="password"
                                    placeholder="Crie uma senha forte"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    autoFocus
                                />
                                {password.length > 0 && (
                                    <PasswordStrengthIndicator validation={passwordValidation} />
                                )}
                            </div>

                            {/* Confirmar Senha */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
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
                                {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Link
                            to="/login"
                            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar para login
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
