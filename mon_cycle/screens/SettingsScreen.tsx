
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';
import { CycleSettings } from '../types';
import { SunIcon, MoonIcon, XMarkIcon, UserCircleIcon, PlusIcon, ArrowRightOnRectangleIcon, ShieldCheckIcon, SparklesIcon, EyeSlashIcon, BellAlertIcon, ClockIcon, CalendarIcon } from '../components/Icons';

const SettingsScreen: React.FC = () => {
    const { settings, setSettings, togglePregnancyMode, theme, toggleTheme, user, updateUser, logout, addToastNotification } = useAppContext();
    const [editName, setEditName] = useState(user?.name || '');
    const [photoPreview, setPhotoPreview] = useState<string | null>(user?.photoURL || null);

    useEffect(() => {
        if (user) {
            setEditName(user.name);
            setPhotoPreview(user.photoURL || null);
        }
    }, [user]);

    const handleFieldChange = (field: keyof CycleSettings, value: any) => {
        setSettings({ ...settings, [field]: value });
        addToastNotification({ message: "Paramètre mis à jour" });
    };

    const handleNotificationToggle = (type: 'period' | 'ovulation') => {
        const currentNotifs = settings.notifications || { 
            period: true, 
            ovulation: true, 
            custom: { 
                beforePeriod: { enabled: true, days: 2 }, 
                beforeOvulation: { enabled: true, days: 1 } 
            } 
        };
        
        const newNotifications = { ...currentNotifs, [type]: !currentNotifs[type] };
        
        if (type === 'period') {
            newNotifications.custom.beforePeriod.enabled = newNotifications.period;
        } else {
            newNotifications.custom.beforeOvulation.enabled = newNotifications.ovulation;
        }
        
        setSettings({
            ...settings,
            notifications: newNotifications
        });
        addToastNotification({ message: "Préférence de rappel mise à jour" });
    };

    const handleCustomDaysChange = (type: 'period' | 'ovulation', days: number) => {
        const currentNotifs = settings.notifications || { 
            period: true, 
            ovulation: true, 
            custom: { 
                beforePeriod: { enabled: true, days: 2 }, 
                beforeOvulation: { enabled: true, days: 1 } 
            } 
        };
        const newNotifications = { ...currentNotifs };
        if (type === 'period') {
            newNotifications.custom.beforePeriod.days = days;
        } else {
            newNotifications.custom.beforeOvulation.days = days;
        }
        setSettings({ ...settings, notifications: newNotifications });
    };

    const handleReminderChange = (field: 'pill' | 'vitamins', key: 'enabled' | 'time', value: any) => {
        setSettings({
            ...settings,
            healthReminders: {
                ...settings.healthReminders,
                [field]: { ...settings.healthReminders[field], [key]: value }
            }
        });
    };

    return (
        <div className="p-4 space-y-6 pb-24 animate-fade-in">
            <h1 className="text-2xl font-bold text-text-heading-light dark:text-text-heading-dark">Paramètres</h1>

            {/* Profil */}
            <div className="p-5 bg-card-bg-light dark:bg-card-bg-dark rounded-3xl shadow-md border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center space-y-4">
                    <img src={photoPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}`} className="w-20 h-20 rounded-full border-4 border-accent-light/20 object-cover" alt="Profil" />
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-primary-bg-dark rounded-xl border border-gray-200 text-center font-bold" />
                    <button onClick={() => updateUser(editName)} className="w-full py-2 bg-accent-light text-white rounded-xl text-sm font-bold">Mettre à jour le nom</button>
                </div>
            </div>

            {/* Configuration du Cycle (Base de l'application) */}
            <div className="p-5 bg-card-bg-light dark:bg-card-bg-dark rounded-3xl shadow-md border border-gray-100 dark:border-gray-800 space-y-4">
                <h2 className="font-bold text-sm uppercase text-text-muted-light px-2 tracking-widest flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Configuration du Cycle
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted-light uppercase ml-2">Cycle (jours)</label>
                        <input 
                            type="number" 
                            min="20"
                            max="45"
                            value={settings.cycleLength} 
                            onChange={(e) => handleFieldChange('cycleLength', parseInt(e.target.value) || 28)}
                            className="w-full p-3 bg-gray-50 dark:bg-primary-bg-dark rounded-xl border border-gray-200 dark:border-gray-700 text-center font-bold text-accent-light" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted-light uppercase ml-2">Règles (jours)</label>
                        <input 
                            type="number" 
                            min="2"
                            max="10"
                            value={settings.periodLength} 
                            onChange={(e) => handleFieldChange('periodLength', parseInt(e.target.value) || 5)}
                            className="w-full p-3 bg-gray-50 dark:bg-primary-bg-dark rounded-xl border border-gray-200 dark:border-gray-700 text-center font-bold text-period-light" 
                        />
                    </div>
                </div>
                <p className="text-[10px] text-text-muted-light px-2 italic text-center leading-tight">
                    Ces valeurs personnalisent les prévisions de votre calendrier et les analyses de Lynda.
                </p>
            </div>

            {/* Modes */}
            <div className="p-5 bg-card-bg-light dark:bg-card-bg-dark rounded-3xl shadow-md border border-gray-100 dark:border-gray-800 space-y-2">
                <h2 className="font-bold text-sm uppercase text-text-muted-light px-2 tracking-widest">Modes</h2>
                
                <div className="flex justify-between items-center p-3">
                    <div className="flex items-center space-x-3">
                        <ShieldCheckIcon className="w-5 h-5 text-pink-500" />
                        <span className="text-sm font-semibold">Mode Grossesse</span>
                    </div>
                    <button onClick={togglePregnancyMode} className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.isPregnancyMode ? 'bg-accent-light' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.isPregnancyMode ? 'translate-x-6' : ''}`} />
                    </button>
                </div>

                <div className="flex justify-between items-center p-3">
                    <div className="flex items-center space-x-3">
                        <SparklesIcon className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-semibold">Mode Essai Bébé</span>
                    </div>
                    <button onClick={() => handleFieldChange('isTryingToConceive', !settings.isTryingToConceive)} className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.isTryingToConceive ? 'bg-purple-500' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.isTryingToConceive ? 'translate-x-6' : ''}`} />
                    </button>
                </div>

                <div className="flex justify-between items-center p-3">
                    <div className="flex items-center space-x-3">
                        <EyeSlashIcon className="w-5 h-5 text-indigo-500" />
                        <span className="text-sm font-semibold">Mode Discret</span>
                    </div>
                    <button onClick={() => handleFieldChange('isDiscreetMode', !settings.isDiscreetMode)} className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.isDiscreetMode ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.isDiscreetMode ? 'translate-x-6' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Rappels de Cycle */}
            <div className="p-5 bg-card-bg-light dark:bg-card-bg-dark rounded-3xl shadow-md border border-gray-100 dark:border-gray-800 space-y-4">
                <h2 className="font-bold text-sm uppercase text-text-muted-light px-2 tracking-widest">Rappels de Cycle</h2>
                
                <div className="space-y-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center space-x-3">
                                <BellAlertIcon className="w-5 h-5 text-period-light" />
                                <span className="text-sm font-semibold">Règles à venir</span>
                            </div>
                            <button onClick={() => handleNotificationToggle('period')} className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.notifications?.period ? 'bg-period-light' : 'bg-gray-300'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.notifications?.period ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>
                        {settings.notifications?.period && settings.notifications?.custom?.beforePeriod && (
                            <div className="flex items-center justify-between pl-8 animate-fade-in">
                                <label className="text-xs text-text-body-light dark:text-text-body-dark">Combien de jours avant ?</label>
                                <select 
                                    value={settings.notifications.custom.beforePeriod.days} 
                                    onChange={(e) => handleCustomDaysChange('period', parseInt(e.target.value))}
                                    className="bg-white dark:bg-gray-700 text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-600 outline-none"
                                >
                                    {[1, 2, 3, 4, 5, 7].map(d => <option key={d} value={d}>{d} {d === 1 ? 'jour' : 'jours'}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center space-x-3">
                                <SparklesIcon className="w-5 h-5 text-ovulation-light" />
                                <span className="text-sm font-semibold">Ovulation estimée</span>
                            </div>
                            <button onClick={() => handleNotificationToggle('ovulation')} className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.notifications?.ovulation ? 'bg-ovulation-light' : 'bg-gray-300'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.notifications?.ovulation ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>
                        {settings.notifications?.ovulation && settings.notifications?.custom?.beforeOvulation && (
                            <div className="flex items-center justify-between pl-8 animate-fade-in">
                                <label className="text-xs text-text-body-light dark:text-text-body-dark">Combien de jours avant ?</label>
                                <select 
                                    value={settings.notifications.custom.beforeOvulation.days} 
                                    onChange={(e) => handleCustomDaysChange('ovulation', parseInt(e.target.value))}
                                    className="bg-white dark:bg-gray-700 text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-600 outline-none"
                                >
                                    {[0, 1, 2, 3].map(d => <option key={d} value={d}>{d === 0 ? 'Le jour même' : `${d} ${d === 1 ? 'jour' : 'jours'} avant`}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Rappels Santé */}
            <div className="p-5 bg-card-bg-light dark:bg-card-bg-dark rounded-3xl shadow-md border border-gray-100 dark:border-gray-800 space-y-4">
                <h2 className="font-bold text-sm uppercase text-text-muted-light px-2 tracking-widest">Suivi Santé</h2>
                
                <div className="space-y-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-3">
                                <ClockIcon className="w-5 h-5 text-green-500" />
                                <span className="text-sm font-semibold">Rappel Pilule</span>
                            </div>
                            <button onClick={() => handleReminderChange('pill', 'enabled', !settings.healthReminders.pill.enabled)} className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.healthReminders.pill.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.healthReminders.pill.enabled ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>
                        {settings.healthReminders.pill.enabled && (
                            <input type="time" value={settings.healthReminders.pill.time} onChange={(e) => handleReminderChange('pill', 'time', e.target.value)} className="w-full mt-2 p-3 bg-white dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600" />
                        )}
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-3">
                                <ClockIcon className="w-5 h-5 text-blue-500" />
                                <span className="text-sm font-semibold">Rappel Vitamines</span>
                            </div>
                            <button onClick={() => handleReminderChange('vitamins', 'enabled', !settings.healthReminders.vitamins.enabled)} className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.healthReminders.vitamins.enabled ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.healthReminders.vitamins.enabled ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>
                        {settings.healthReminders.vitamins.enabled && (
                            <input type="time" value={settings.healthReminders.vitamins.time} onChange={(e) => handleReminderChange('vitamins', 'time', e.target.value)} className="w-full mt-2 p-3 bg-white dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600" />
                        )}
                    </div>
                </div>
            </div>

            <button onClick={logout} className="w-full py-4 text-red-500 font-bold bg-red-50 dark:bg-red-900/20 rounded-2xl transform active:scale-95 transition">Déconnexion</button>
        </div>
    );
};

export default SettingsScreen;
