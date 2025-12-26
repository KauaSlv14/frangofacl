import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PasswordValidation } from '@/lib/validation';

interface PasswordStrengthIndicatorProps {
    validation: PasswordValidation;
    showRequirements?: boolean;
}

const strengthConfig = {
    weak: { label: 'Fraca', color: 'bg-red-500', width: 'w-1/4' },
    fair: { label: 'Regular', color: 'bg-yellow-500', width: 'w-2/4' },
    good: { label: 'Boa', color: 'bg-blue-500', width: 'w-3/4' },
    strong: { label: 'Forte', color: 'bg-green-500', width: 'w-full' },
};

export function PasswordStrengthIndicator({
    validation,
    showRequirements = true
}: PasswordStrengthIndicatorProps) {
    const config = strengthConfig[validation.strength];

    return (
        <div className="space-y-3">
            {/* Barra de força */}
            <div className="space-y-1">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full transition-all duration-300 rounded-full",
                            config.color,
                            config.width
                        )}
                    />
                </div>
                <p className={cn(
                    "text-xs font-medium",
                    validation.strength === 'weak' && "text-red-500",
                    validation.strength === 'fair' && "text-yellow-600",
                    validation.strength === 'good' && "text-blue-500",
                    validation.strength === 'strong' && "text-green-500"
                )}>
                    Força da senha: {config.label}
                </p>
            </div>

            {/* Lista de requisitos */}
            {showRequirements && (
                <ul className="space-y-1 text-xs">
                    <RequirementItem
                        met={validation.requirements.minLength}
                        text="Mínimo 8 caracteres"
                    />
                    <RequirementItem
                        met={validation.requirements.hasUppercase}
                        text="Uma letra maiúscula"
                    />
                    <RequirementItem
                        met={validation.requirements.hasLowercase}
                        text="Uma letra minúscula"
                    />
                    <RequirementItem
                        met={validation.requirements.hasNumber}
                        text="Um número"
                    />
                    <RequirementItem
                        met={validation.requirements.hasSpecialChar}
                        text="Um caractere especial (!@#$%...)"
                    />
                </ul>
            )}
        </div>
    );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (
        <li className={cn(
            "flex items-center gap-2 transition-colors",
            met ? "text-green-600" : "text-muted-foreground"
        )}>
            {met ? (
                <Check className="h-3 w-3" />
            ) : (
                <X className="h-3 w-3" />
            )}
            {text}
        </li>
    );
}
