export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError'
    }
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}