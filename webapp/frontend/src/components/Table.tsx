import { ReactNode } from 'react';

interface TableCellProps {
    children: ReactNode;
    className?: string;
}

export const TableCell = ({ children, className }: TableCellProps) => (
    <td className={`w-1/4 px-2 py-4 border-b ${className || ''}`}>{children}</td>
);

interface TableInputProps {
    value: string;
    name: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

export const TableInput = ({ value, name, onChange, placeholder }: TableInputProps) => (
    <input
        type="text"
        className="w-full focus:outline-none"
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
    />
);

interface TableSelectProps {
    value: string;
    name: string;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
}

export const TableSelect = ({ value, name, onChange, options }: TableSelectProps) => (
    <select
        className="w-full rounded bg-white"
        name={name}
        value={value}
        onChange={onChange}
    >
        <option value="" disabled>
            Select a user type
        </option>
        {options.map((option, index) => (
            <option key={index} value={option}>
                {option}
            </option>
        ))}
    </select>
);