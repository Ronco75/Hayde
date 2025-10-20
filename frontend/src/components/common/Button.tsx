interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    type?: 'button' | 'submit';
    onClick?: () => void;
    disabled?: boolean;
}

function Button({ children, variant = 'primary', size = 'md', type = 'button', onClick, disabled = false }: ButtonProps) {
    const variantClasses: Record<string, string> = {
        primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-300",
        secondary: "bg-slate-700 text-white hover:bg-slate-600 active:bg-slate-800 focus-visible:ring-slate-500",
        ghost: "bg-transparent text-primary-300 hover:bg-slate-800/60 focus-visible:ring-primary-400",
        danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-300",
    };

    const sizeClasses: Record<string, string> = {
        sm: "px-3 py-2 text-sm",
        md: "px-5 py-3 text-base",
        lg: "px-6 py-4 text-base",
        icon: "p-2",
    };

    const buttonClass = `
        ${sizeClasses[size]}
        rounded-lg
        font-semibold
        transition-all
        duration-200
        ease-in-out
        cursor-pointer
        transform
        hover:scale-102
        active:scale-100
        focus-visible:outline-none
        focus-visible:ring-4
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:transform-none
        shadow-elev-2
        hover:shadow-elev-3
        ${variantClasses[variant]}
    `.trim().replace(/\s+/g, ' ');

    return (
        <button
            className={buttonClass}
            onClick={onClick}
            type={type}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export default Button;