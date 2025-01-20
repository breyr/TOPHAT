import { RotateCcw, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface DeviceDescriptionTextAreaProps {
    deviceId: number | undefined;
    descriptionText: string;
    isEditable: boolean;
    onUpdateDescription: (deviceId: number, updatedDescription: string) => void;
}

const DeviceDescriptionTextArea: React.FC<DeviceDescriptionTextAreaProps> = ({ deviceId, descriptionText, isEditable, onUpdateDescription }) => {

    const [deviceDesc, setDeviceDesc] = useState<string>();
    const [initialDeviceDesc, setInitialDeviceDesc] = useState<string>();
    const [areButtonsDisabled, setAreButtonsDisabled] = useState<boolean>(true);

    useEffect(() => {
        setDeviceDesc(descriptionText ?? '');
        setInitialDeviceDesc(descriptionText ?? '');
    }, [descriptionText]);

    useEffect(() => {
        setAreButtonsDisabled(deviceDesc === initialDeviceDesc);
    }, [deviceDesc, initialDeviceDesc]);

    const save = () => {
        if (deviceId) {
            onUpdateDescription(deviceId, deviceDesc ?? '');
        }
    };

    const revert = () => {
        setDeviceDesc(initialDeviceDesc);
    };

    return (
        <div className='flex flex-col justify-end pt-6'>
            {isEditable ? (
                <>
                    <textarea
                        className="r-input w-full h-64 mt-4 p-4 resize-none"
                        placeholder="Console: ssh://admin@10.100.2.6/"
                        value={deviceDesc}
                        onChange={(e) => setDeviceDesc(e.target.value)}
                    ></textarea>
                    <div className='flex flex-row justify-end gap-1 mt-4'>
                        <button
                            onClick={revert}
                            disabled={areButtonsDisabled}
                            className={`r-btn tertiary flex flex-row items-center gap-1 ${areButtonsDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <RotateCcw /> Revert
                        </button>
                        <button
                            onClick={save}
                            disabled={areButtonsDisabled}
                            className={`r-btn text-green-600 hover:text-green-700 flex flex-row items-center gap-1 ${areButtonsDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Save /> Save
                        </button>
                    </div>
                </>
            ) : (
                <div className="r-input w-full h-64 mt-4 p-4 resize-none">
                    {deviceDesc || 'No description available'}
                </div>
            )}
        </div>
    )
}

export default DeviceDescriptionTextArea;