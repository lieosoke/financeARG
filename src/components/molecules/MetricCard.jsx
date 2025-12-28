import React from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const MetricCard = ({
    title,
    value,
    subtitle,
    trend,
    trendValue,
    icon,
    iconBgColor = 'bg-primary-500/20',
    iconColor = 'text-primary-400',
    currency = false,
    className = '',
}) => {
    const isPositiveTrend = trend === 'up';
    const displayValue = currency ? formatCurrency(value) : value;

    return (
        <div className={`card group ${className}`}>
            {/* Gradient accent line at top */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"></div>

            <div className="flex items-start justify-between relative">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mt-2 font-tabular truncate">
                        {displayValue}
                    </h3>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                    {trendValue && (
                        <div className="flex items-center mt-3">
                            <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-medium ${isPositiveTrend
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}>
                                {isPositiveTrend ? (
                                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                                ) : (
                                    <TrendingDown className="w-3.5 h-3.5 mr-1" />
                                )}
                                {trendValue}
                            </div>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={`p-3 rounded-xl ${iconBgColor} transition-transform duration-300 group-hover:scale-110`}>
                        <div className={iconColor}>
                            {icon}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

MetricCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    subtitle: PropTypes.string,
    trend: PropTypes.oneOf(['up', 'down']),
    trendValue: PropTypes.string,
    icon: PropTypes.node,
    iconBgColor: PropTypes.string,
    iconColor: PropTypes.string,
    currency: PropTypes.bool,
    className: PropTypes.string,
};

export default MetricCard;
