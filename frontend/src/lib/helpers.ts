import { GetSpecialPathParams } from "../components/reactflow/edges/CustomEdge";

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

// function to create a special curved path
export const getCurvedPath = (
    { sourceX, sourceY, targetX, targetY }: GetSpecialPathParams,
    offset: number
) => {
    // Calculate midpoint between source and target
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    // Calculate the direction vector perpendicular to the line
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Normalize and create perpendicular vector
    const normX = dx / length;
    const normY = dy / length;
    const perpX = -normY;
    const perpY = normX;

    // Single control point offset from the midpoint in the perpendicular direction
    const cpX = midX + perpX * offset;
    const cpY = midY + perpY * offset;

    // Create a quadratic Bezier curve with one control point for a simple, smooth arc
    return `M ${sourceX} ${sourceY} Q ${cpX} ${cpY}, ${targetX} ${targetY}`;
};

export function substringFromFirstNumber(port: string) {
    // match up to the first 3 alphabetic characters followed by any numbers
    const match = port.match(/^([a-zA-Z]{1,3})\D*(\d.*)$/);

    if (match) {
        const prefix = match[1]; // up to the first 3 alphabetic characters
        const numbers = match[2]; // all numbers after the prefix
        return prefix + numbers;
    }

    // if no match, return an empty string
    return "";
}

// validate email format
export function validateEmail(email: string) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};