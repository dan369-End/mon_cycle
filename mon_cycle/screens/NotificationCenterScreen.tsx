
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
// Fix: Re-typing date-fns imports and handling parseISO natively
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
// Fix: Removed non-existent TrashIcon and CheckCircleIcon as they are not exported by components/Icons.tsx and are not used in the component.
import { XMarkIcon, BellIcon, SparklesIcon, ClockIcon } from '../components/Icons';

// Add a simple Trash icon locally since it's missing in main Icons.tsx
const LocalTrashIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const NotificationCenterScreen: React.FC = () => {
    const { appNotifications, markNotificationsAsRead } = useAppContext();
    const navigate = useNavigate();

    const handleMarkAllRead = () => {
        markNotificationsAsRead();
    };

    return (
        <div className="p-4 space-y-6 animate-fade-in pb-24">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-text-heading-light dark:text-text-heading-dark">Notifications</h1>
                <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="flex justify-between items-center px-2">
                <span className="text-xs text-text-muted-light font-bold uppercase tracking-widest">
                    {appNotifications.filter(n => !n.read).length} nouvelles
                </span>
                {appNotifications.length > 0 && (
                    <button 
                        onClick={handleMarkAllRead}
                        className="text-xs text-accent-light dark:text-accent-dark font-bold hover:underline"
                    >
                        Tout marquer comme lu
                    </button>
                )}
            </div>

            {appNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <BellIcon className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-text-muted-light font-medium">Aucune notification pour le moment.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {appNotifications.map((notif) => (
                        <div 
                            key={notif.id} 
                            className={`p-4 rounded-2xl border transition-all ${notif.read ? 'bg-white dark:bg-card-bg-dark border-gray-100 dark:border-gray-800 opacity-70' : 'bg-white dark:bg-card-bg-dark border-accent-light/30 shadow-md scale-[1.02]'}`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`p-2 rounded-xl flex-shrink-0 ${notif.message.includes('Lynda') ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600' : 'bg-accent-light/10 text-accent-light'}`}>
                                    {notif.message.includes('Lynda') ? <SparklesIcon className="w-5 h-5" /> : <ClockIcon className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className={`text-sm leading-tight ${notif.read ? 'text-text-body-light dark:text-text-body-dark' : 'text-text-heading-light dark:text-text-heading-dark font-bold'}`}>
                                        {notif.message}
                                    </p>
                                    <p className="text-[10px] text-text-muted-light font-medium">
                                        {/* Fix: parseISO replacement */}
                                        {format(new Date(notif.date), "d MMM 'à' HH:mm", { locale: fr })}
                                    </p>
                                </div>
                                {!notif.read && (
                                    <div className="w-2 h-2 bg-accent-light rounded-full mt-2"></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800">
                <div className="flex items-center space-x-3 mb-2">
                    <ClockIcon className="w-4 h-4 text-blue-500" />
                    <h4 className="text-xs font-bold text-blue-600 uppercase">Astuce Rappels</h4>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                    Les notifications s'effacent automatiquement après 30 jours pour garder votre centre de contrôle propre.
                </p>
            </div>
        </div>
    );
};

export default NotificationCenterScreen;