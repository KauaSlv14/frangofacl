/**
 * Utilitários de validação para segurança de autenticação
 * Implementa regras robustas de validação de senha e email
 */

export interface PasswordValidation {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'fair' | 'good' | 'strong';
    score: number;
    requirements: {
        minLength: boolean;
        hasUppercase: boolean;
        hasLowercase: boolean;
        hasNumber: boolean;
        hasSpecialChar: boolean;
    };
}

export interface EmailValidation {
    isValid: boolean;
    error?: string;
}

// Requisitos mínimos de senha
const MIN_PASSWORD_LENGTH = 8;
const SPECIAL_CHARS_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

/**
 * Valida uma senha e retorna informações detalhadas sobre sua força
 */
export function validatePassword(password: string): PasswordValidation {
    const errors: string[] = [];

    const requirements = {
        minLength: password.length >= MIN_PASSWORD_LENGTH,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: SPECIAL_CHARS_REGEX.test(password),
    };

    // Verificar cada requisito e adicionar erro se não atender
    if (!requirements.minLength) {
        errors.push(`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres`);
    }
    if (!requirements.hasUppercase) {
        errors.push('Pelo menos uma letra maiúscula');
    }
    if (!requirements.hasLowercase) {
        errors.push('Pelo menos uma letra minúscula');
    }
    if (!requirements.hasNumber) {
        errors.push('Pelo menos um número');
    }
    if (!requirements.hasSpecialChar) {
        errors.push('Pelo menos um caractere especial (!@#$%^&*...)');
    }

    // Calcular score (0-5)
    const score = Object.values(requirements).filter(Boolean).length;

    // Determinar força baseada no score
    let strength: PasswordValidation['strength'];
    if (score <= 2) {
        strength = 'weak';
    } else if (score === 3) {
        strength = 'fair';
    } else if (score === 4) {
        strength = 'good';
    } else {
        strength = 'strong';
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength,
        score,
        requirements,
    };
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): EmailValidation {
    // Trim e lowercase
    const sanitizedEmail = email.trim().toLowerCase();

    if (!sanitizedEmail) {
        return { isValid: false, error: 'Email é obrigatório' };
    }

    // Regex para validação de email (RFC 5322 simplificado)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(sanitizedEmail)) {
        return { isValid: false, error: 'Formato de email inválido' };
    }

    // Verificar domínio
    const parts = sanitizedEmail.split('@');
    if (parts.length !== 2 || !parts[1].includes('.')) {
        return { isValid: false, error: 'Domínio de email inválido' };
    }

    return { isValid: true };
}

/**
 * Sanitiza input de texto removendo caracteres potencialmente perigosos
 */
export function sanitizeInput(input: string): string {
    return input
        .trim()
        // Remove tags HTML
        .replace(/<[^>]*>/g, '')
        // Remove scripts inline
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
}

/**
 * Valida nome (para cadastro)
 */
export function validateName(name: string): { isValid: boolean; error?: string } {
    const sanitized = sanitizeInput(name);

    if (!sanitized) {
        return { isValid: false, error: 'Nome é obrigatório' };
    }

    if (sanitized.length < 2) {
        return { isValid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
    }

    if (sanitized.length > 100) {
        return { isValid: false, error: 'Nome deve ter no máximo 100 caracteres' };
    }

    return { isValid: true };
}

/**
 * Formata telefone brasileiro
 */
export function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
}

/**
 * Valida telefone brasileiro
 */
export function validatePhone(phone: string): { isValid: boolean; error?: string } {
    if (!phone) {
        return { isValid: true }; // Telefone é opcional
    }

    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length < 10 || cleaned.length > 11) {
        return { isValid: false, error: 'Telefone inválido' };
    }

    return { isValid: true };
}
