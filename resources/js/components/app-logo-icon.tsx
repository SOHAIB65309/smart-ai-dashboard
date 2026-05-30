import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

export default function AppLogoIcon({ className, ...props }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            {/* Background Shield / Logic Gate Node */}
            <path
                d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z"
                className="fill-indigo-600 dark:fill-indigo-500"
                opacity="0.15"
            />
            
            {/* Neural Network Node Connections (Left Side) */}
            <circle cx="6" cy="8" r="1.5" className="fill-current" />
            <circle cx="6" cy="16" r="1.5" className="fill-current" />
            <circle cx="11" cy="12" r="1.5" className="fill-current" />
            
            {/* Synaptic Pathway Vectors */}
            <line x1="6" y1="8" x2="11" y2="12" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
            <line x1="6" y1="16" x2="11" y2="12" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
            <line x1="6" y1="8" x2="6" y2="16" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.3" />
            
            {/* The Verification Constraint Bound (Z3 Logic Center) */}
            <line x1="11" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1 1" />
            
            {/* Formal Verification Check Checkmark (Right Shield Edge) */}
            <path
                d="M14 12l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-500 dark:text-emerald-400"
                fill="none"
            />
        </svg>
    );
}