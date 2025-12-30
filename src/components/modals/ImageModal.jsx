import React, { useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import Button from '../atoms/Button';

const ImageModal = ({ isOpen, onClose, imageUrl, title = "Bukti Pembayaran" }) => {
    // Lock body scroll
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

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Content */}
            <div
                className="relative w-full h-full flex flex-col items-center justify-center"
                onClick={e => e.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    alt={title}
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />

                {/* Toolbar */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                    <span className="text-white text-sm font-medium mr-2">{title}</span>
                    <div className="h-4 w-px bg-white/20"></div>
                    <a
                        href={imageUrl}
                        download="bukti-pembayaran.png"
                        className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Download</span>
                    </a>
                    <button
                        className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(imageUrl, '_blank');
                        }}
                    >
                        <ZoomIn className="w-4 h-4" />
                        <span className="text-sm">Tab Baru</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageModal;
