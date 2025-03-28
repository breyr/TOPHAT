import { Checkbox, Typography } from '@material-tailwind/react';
import { useTopology } from '../hooks/useTopology';

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
    const { isReinintializingLinks } = useTopology();
    const handleCheckboxChange = (option: Option) => {
        onChange(option);
    };

    return (
        <div className="w-full min-h-32 p-4">
            {options.map(option => (
                <div key={option.value} className="flex items-center">
                    <Checkbox
                        id={`checkbox-${option.value}`}
                        color="error"
                        onChange={() => handleCheckboxChange(option)}
                        disabled={isDeleting || isReinintializingLinks}
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