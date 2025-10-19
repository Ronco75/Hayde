interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    type?: 'button' | 'submit';
    onClick?: () => void;
    disabled?: boolean;
}

function Button({ children, variant = 'primary', type = 'button', onClick, disabled = false }: ButtonProps) {
    const variantClasses = {
        primary: "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 focus-visible:ring-purple-300",
        secondary: "bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 focus-visible:ring-gray-300",
        danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-300",
    };

    const buttonClass = `
        px-6 py-3
        rounded-lg
        font-semibold
        text-base
        transition-all
        duration-300
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
        shadow-md
        hover:shadow-lg
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