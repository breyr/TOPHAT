// generating temporary passwords for user creation
export function generateTempPassword(length: number = 12): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}

// debounce calls
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    return function (...args: any[]) {
        // @ts-expect-error `this` needs a type
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    }
}

export function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

export const generatePorts = (portDefinition: string): string[] => {
    const [prefix, range] = portDefinition.split('|');
    if (!range) return [];
    const [start, end] = range.split('-').map(Number);
    if (isNaN(start) || isNaN(end)) return [];
    return Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${start + i}`);
};