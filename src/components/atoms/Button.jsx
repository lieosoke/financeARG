import React from 'react';
import PropTypes from 'prop-types';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    loading = false,
    onClick,
    className = '',
    icon,
    fullWidth = false,
    ...restProps
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-primary';

    const variantClasses = {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-400 hover:to-primary-500 hover:shadow-glow-emerald focus:ring-primary-500',
        secondary: 'bg-surface-glass text-gray-200 border border-surface-border hover:bg-surface-glass-hover hover:border-surface-border-hover hover:text-white focus:ring-gray-500',
        success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 hover:shadow-glow-emerald focus:ring-emerald-500',
        danger: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-400 hover:to-rose-500 focus:ring-rose-500',
        outline: 'border-2 border-surface-border text-gray-300 hover:bg-surface-glass hover:border-surface-border-hover hover:text-white focus:ring-gray-500',
        ghost: 'text-gray-400 hover:text-white hover:bg-surface-glass',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const classes = [
        baseClasses,
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size],
        fullWidth && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
    ].filter(Boolean).join(' ');

    // Only spread valid HTML button attributes
    const {
        ...validButtonProps
    } = restProps;

    return (
        <button
            type={type}
            className={classes}
            onClick={onClick}
            disabled={disabled || loading}
            {...validButtonProps}
        >
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {icon && !loading && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'outline', 'ghost']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    onClick: PropTypes.func,
    className: PropTypes.string,
    icon: PropTypes.node,
    fullWidth: PropTypes.bool,
};

export default Button;
