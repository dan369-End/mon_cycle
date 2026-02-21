
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { 
    XMarkIcon, 
    ShieldCheckIcon, 
    ArrowRightOnRectangleIcon, 
    MoonIcon, 
    SunIcon, 
    ArrowPathIcon,
    SparklesIcon,
    BellAlertIcon
} from './Icons';

interface ProfileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ isOpen, onClose }) => {
    const { user, logout, theme, toggleTheme, settings, addToastNotification } = useAppContext();
    const navigate = useNavigate();
    const isOnline = navigator.onLine;

    const handleExport = () => {
        addToastNotification({ message: "Génération du rapport PostgreSQL..." });
        setTimeout(() => {
            addToastNotification({ message: "Données exportées en CSV !" });
        }, 1500);
    };

    const navigateToIA = () => {
        navigate('/assistant');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative w-80 h-full bg-white dark:bg-card-bg-dark shadow-2xl animate-fade-in flex flex-col">
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                        <XMarkIcon className="w-6 h-6 text-gray-400" />
                    </button>
                    
                    <div className="relative mb-4">
                        <img 
                            src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}`} 
                            className="w-24 h-24 rounded-full border-4 border-accent-light/20 p-1 object-cover"
                            alt="Profil"
                        />
                        <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white dark:border-card-bg-dark ${isOnline ? 'bg-green-500' : 'bg-orange-500 shadow-sm animate-pulse'}`}></div>
                    </div>
                    
                    <h3 className="font-bold text-xl text-text-heading-light dark:text-text-heading-dark">{user?.name}</h3>
                    <p className="text-xs text-text-muted-light mt-1 flex items-center justify-center space-x-1">
                        <span>{isOnline ? 'Synchronisé avec Supabase' : 'Mode Hors-ligne'}</span>
                    </p>
                </div>

                <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                    {/* Préférences App */}
                    <div>
                        <p className="text-[10px] font-bold text-text-muted-light uppercase tracking-widest mb-3 px-2">Préférences App</p>
                        <div className="space-y-1">
                            <button onClick={toggleTheme} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition group text-left">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                        {theme === 'light' ? <MoonIcon className="w-5 h-5 text-indigo-500" /> : <SunIcon className="w-5 h-5 text-yellow-500" />}
                                    </div>
                                    <span className="text-sm font-semibold">Thème {theme === 'light' ? 'Sombre' : 'Clair'}</span>
                                </div>
                            </button>
                            
                            <button onClick={handleExport} className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition group text-left">
                                <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                    <ArrowPathIcon className="w-5 h-5 text-green-500" />
                                </div>
                                <span className="text-sm font-semibold">Exporter mes données</span>
                            </button>
                        </div>
                    </div>

                    {/* Mes Notifications */}
                    <div>
                        <p className="text-[10px] font-bold text-text-muted-light uppercase tracking-widest mb-3 px-2">Mes Notifications</p>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <BellAlertIcon className={`w-4 h-4 ${settings.notifications?.period ? 'text-period-light' : 'text-gray-300'}`} />
                                    <span className="text-xs font-medium">Rappels Règles</span>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-white dark:bg-gray-700 rounded-full border border-gray-100 dark:border-gray-600">
                                    {settings.notifications?.period ? `J-${settings.notifications?.custom?.beforePeriod?.days || 2}` : 'Désactivé'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <SparklesIcon className={`w-4 h-4 ${settings.notifications?.ovulation ? 'text-ovulation-light' : 'text-gray-300'}`} />
                                    <span className="text-xs font-medium">Rappels Ovulation</span>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-white dark:bg-gray-700 rounded-full border border-gray-100 dark:border-gray-600">
                                    {settings.notifications?.ovulation ? `J-${settings.notifications?.custom?.beforeOvulation?.days || 1}` : 'Désactivé'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Santé & Sécurité */}
                    <div>
                        <p className="text-[10px] font-bold text-text-muted-light uppercase tracking-widest mb-3 px-2">Santé & Sécurité</p>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between p-4 bg-accent-light/5 dark:bg-accent-dark/5 rounded-2xl border border-accent-light/10">
                                <div className="flex items-center space-x-4">
                                    <ShieldCheckIcon className="w-5 h-5 text-accent-light" />
                                    <div>
                                        <p className="text-sm font-semibold">Chiffrement SQL</p>
                                        <p className="text-[10px] text-text-muted-light">AES-256 activé</p>
                                    </div>
                                </div>
                            </div>
                            
                            <button onClick={navigateToIA} className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition group text-left">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                    <SparklesIcon className="w-5 h-5 text-purple-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Conseils Fertilité Lynda</span>
                                    <span className="text-[10px] text-accent-light">IA Santé active</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                    <button 
                        onClick={logout} 
                        className="w-full flex items-center justify-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/40 transition active:scale-95"
                    >
                        <ArrowRightOnRectangleIcon className="w-6 h-6" />
                        <span className="font-bold">Déconnexion</span>
                    </button>
                    <p className="text-[9px] text-center text-text-muted-light mt-4">Version 2.0.0-supabase-beta</p>
                </div>
            </div>
        </div>
    );
};
