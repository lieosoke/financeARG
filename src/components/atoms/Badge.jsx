import React from 'react';
import PropTypes from 'prop-types';

const Badge = ({
    children,
    variant = 'info',
    size = 'md',
    className = '',
    icon,
    dot = false,
    ...props
}) => {
    const baseClasses = 'inline-flex items-center font-semibold rounded-lg border backdrop-blur-sm';

    const variantClasses = {
        success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        danger: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        primary: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
    };

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
    };

    const dotColors = {
        success: 'bg-emerald-400',
        warning: 'bg-amber-400',
        danger: 'bg-rose-400',
        info: 'bg-blue-400',
        neutral: 'bg-gray-400',
        primary: 'bg-primary-400',
    };

    const classes = [
        baseClasses,
        variantClasses[variant] || variantClasses.info,
        sizeClasses[size],
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={classes} {...props}>
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant] || dotColors.info}`}></span>
            )}
            {icon && <span className="mr-1.5">{icon}</span>}
            {children}
        </span>
    );
};

Badge.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'neutral', 'primary']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    className: PropTypes.string,
    icon: PropTypes.node,
    dot: PropTypes.bool,
};

export default Badge;
