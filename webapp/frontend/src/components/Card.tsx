import React from 'react';

interface CardProps {
    title: string;
    description: string;
    benefits: string[];
    icon: React.ReactNode;
    isSelected: boolean;
    onSelect: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, benefits, icon, isSelected, onSelect }) => {
    return (
        <div className={`bg-white shadow-md rounded-lg overflow-hidden w-1/4 border-2 ${isSelected ? "border-blue-500" : ""}`}>
            <div className="flex flex-col justify-center items-center py-6">
                {icon}
                <h2 className="text-2xl font-bold mt-4">{title}</h2>
                <p className="mt-2 text-gray-600 text-center px-4">{description}</p>
            </div>
            <div className="p-6">
                <ul className="space-y-2 mb-8">
                    {
                        benefits.map(benefit => (
                            <li key={benefit} className="flex items-center">
                                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                {benefit}
                            </li>
                        ))
                    }
                </ul>
                <button
                    className={`r-btn w-full ${isSelected ? "bg-blue-500 text-white" : "secondary"}`}
                    onClick={onSelect}
                >
                    {isSelected ? "Selected" : "Select"}
                </button>
            </div>
        </div>
    )
}

export default Card;