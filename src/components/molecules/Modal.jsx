import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from '../atoms/Button';

/**
 * Modal Component - Reusable modal dialog
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    size = 'md', // sm, md, lg, xl
    showCloseButton = true,
    closeOnOverlayClick = true,
}) => {
    const modalRef = useRef(null);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={handleOverlayClick}
        >
            <div
                ref={modalRef}
                className={`w-full ${sizeClasses[size]} bg-dark-secondary border border-surface-border rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col`}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-surface-border flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold text-white">{title}</h2>
                        {subtitle && (
                            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                        )}
                    </div>
                    {showCloseButton && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="!p-2 -mr-2 -mt-2"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
