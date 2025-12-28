import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
    children,
    title,
    subtitle,
    headerAction,
    className = '',
    noPadding = false,
    hoverable = true,
    glow = false,
    ...props
}) => {
    const cardClasses = [
        glow ? 'card-glow' : 'card',
        !hoverable && 'hover:shadow-card',
        noPadding && '!p-0',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={cardClasses} {...props}>
            {(title || headerAction) && (
                <div className={`flex items-center justify-between ${!noPadding ? 'mb-4' : 'p-6 pb-4'}`}>
                    <div>
                        {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
                        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                    </div>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}
            <div className={noPadding && title ? 'px-6 pb-6' : ''}>
                {children}
            </div>
        </div>
    );
};

Card.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    headerAction: PropTypes.node,
    className: PropTypes.string,
    noPadding: PropTypes.bool,
    hoverable: PropTypes.bool,
    glow: PropTypes.bool,
};

export default Card;
