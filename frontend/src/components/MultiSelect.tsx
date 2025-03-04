import { Checkbox, Typography } from '@material-tailwind/react';

export interface Option {
    value: string;
    label: string;
    firstLabDevice: string;
    firstLabDevicePort: string;
    secondLabDevice: string;
    secondLabDevicePort: string;
}

interface MultiSelectProps {
    options: Option[];
    isDeleting: boolean;
    onChange: (selectedOption: Option) => void;
}

export function MultiSelect({ options, isDeleting, onChange }: MultiSelectProps) {
    const handleCheckboxChange = (option: Option) => {
        onChange(option);
    };

    return (
        <div className="w-full min-h-32 overflow-y-auto flex flex-wrap items-start">
            {options.map(option => (
                <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                        id={`checkbox-${option.value}`}
                        color="error"
                        onChange={() => handleCheckboxChange(option)}
                        disabled={isDeleting}
                    >
                        <Checkbox.Indicator />
                    </Checkbox>
                    <Typography
                        as="label"
                        htmlFor={`checkbox-${option.value}`}
                        className="cursor-pointer text-foreground ml-2"
                    >
                        {option.label}
                    </Typography>
                </div>
            ))}
        </div>
    );
};