
import React from 'react';

interface ConfirmationModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    title, 
    message, 
    onConfirm, 
    onCancel,
    confirmText = "Confirmer",
    cancelText = "Retour"
}) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-card-bg-light dark:bg-card-bg-dark rounded-2xl shadow-2xl w-full max-w-xs p-6 relative animate-zoom-in border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-center mb-2 text-text-heading-light dark:text-text-heading-dark">{title}</h3>
                <p className="text-sm text-center text-text-body-light dark:text-text-body-dark mb-6 leading-relaxed">{message}</p>
                <div className="flex flex-col space-y-3">
                    <button
                        onClick={onConfirm}
                        className="w-full bg-red-500 text-white py-3 px-4 rounded-xl shadow-md hover:bg-red-600 transition-colors font-bold text-sm">
                        {confirmText}
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full bg-gray-100 dark:bg-gray-700 text-text-body-light dark:text-text-body-dark py-3 px-4 rounded-xl shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-bold text-sm">
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};
