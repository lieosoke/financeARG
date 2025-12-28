import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(({
    label,
    type = 'text',
    placeholder,
    error,
    helperText,
    required = false,
    disabled = false,
    className = '',
    icon,
    iconPosition = 'left',
    ...props
}, ref) => {
    const inputClasses = [
        'w-full px-4 py-3 rounded-xl',
        'bg-dark-tertiary/50 border border-surface-border text-gray-100',
        'placeholder-gray-500',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
        'transition-all duration-200',
        error && 'border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500',
        icon && iconPosition === 'left' && 'pl-11',
        icon && iconPosition === 'right' && 'pr-11',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label}
                    {required && <span className="text-rose-400 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {icon && iconPosition === 'left' && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                        {icon}
                    </div>
                )}

                <input
                    ref={ref}
                    type={type}
                    className={inputClasses}
                    placeholder={placeholder}
                    disabled={disabled}
                    {...props}
                />

                {icon && iconPosition === 'right' && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-500">
                        {icon}
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1.5 text-sm text-rose-400">{error}</p>
            )}

            {helperText && !error && (
                <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

Input.propTypes = {
    label: PropTypes.string,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    helperText: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    icon: PropTypes.node,
    iconPosition: PropTypes.oneOf(['left', 'right']),
};

export default Input;
