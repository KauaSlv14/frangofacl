import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { validateEmail } from '@/lib/validation';
import logo from '@/assets/logo-frango-facil.png';

export function ForgotPasswordPage() {
    const { resetPassword } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            toast.error(emailValidation.error);
            return;
        }

        setIsLoading(true);

        const { error } = await resetPassword(email);

        if (error) {
            // Mensagem genérica por segurança (não revelar se email existe)
            console.error('Reset password error:', error);
        }

        // Sempre mostrar sucesso (segurança - não revelar se email existe)
        setEmailSent(true);

        setIsLoading(false);
    };

    if (emailSent) {
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
                                Email Enviado!
                            </CardTitle>
                            <CardDescription className="text-base">
                                Se existe uma conta com o email <strong>{email}</strong>, você receberá um link para redefinir sua senha.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    <strong>Dica:</strong> Verifique também sua pasta de spam ou lixo eletrônico.
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setEmailSent(false);
                                    setEmail('');
                                }}
                            >
                                Enviar para outro email
                            </Button>
                        </CardContent>

                        <CardFooter>
                            <Link to="/login" className="w-full">
                                <Button variant="default" className="w-full gradient-primary">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
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
                            Recuperar Senha
                        </CardTitle>
                        <CardDescription>
                            Digite seu email para receber um link de recuperação
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full gradient-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
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
