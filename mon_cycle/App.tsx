
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import * as db from './databaseService';
import { addDays, subDays, isSameDay, isWithinInterval, differenceInDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import SymptomsScreen from './screens/SymptomsScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileDetailScreen from './screens/ProfileDetailScreen';
import NotificationCenterScreen from './screens/NotificationCenterScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import AssistantScreen from './screens/AssistantScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import { HomeIcon, CalendarIcon, ReportsIcon, SettingsIcon, BellIcon, UserCircleIcon, XMarkIcon, ChatBubbleLeftRightIcon, ArrowRightOnRectangleIcon, BellAlertIcon, LoadingSpinner } from './components/Icons';
import { AppLogo } from './components/Logo';
import { ProfileMenu } from './components/ProfileMenu';
import { CycleSettings, PeriodEntry, SymptomLog, ActivityLog, User, Notification, AppNotification, AppContextType, FirebaseUser } from './types';

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
};

const App: React.FC = () => {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Un minuteur de sécurité pour ne pas rester bloqué sur le spinner
        const safetyTimer = setTimeout(() => {
            setIsLoading(false);
        }, 6000);

        const unsubscribe = db.onAuthChange((fbUser, userData) => {
            setFirebaseUser(fbUser);
            setUser(userData);
            setIsLoading(false);
            // On ne clearTimeout pas ici pour laisser handleAuth se terminer si plusieurs événements arrivent
        });

        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
            clearTimeout(safetyTimer);
        };
    }, []);
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-primary-bg-light dark:bg-primary-bg-dark">
                <div className="relative">
                    <AppLogo className="w-24 h-24 animate-pulse text-accent-light" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <LoadingSpinner className="w-8 h-8 text-accent-light/30" />
                    </div>
                </div>
                <p className="mt-6 text-xs text-accent-light font-bold uppercase tracking-widest animate-pulse">Initialisation Supabase...</p>
                <p className="mt-2 text-[10px] text-text-muted-light">Vérification de la session sécurisée</p>
            </div>
        );
    }

    return (
        <HashRouter>
            {firebaseUser ? (
                <LoggedInApp user={user} firebaseUser={firebaseUser} />
            ) : (
                <AuthRoutes />
            )}
        </HashRouter>
    );
};

const AuthRoutes: React.FC = () => {
    const authContextValue = { login: db.apiLogin, signup: db.apiSignup } as any; 
    return (
        <AppContext.Provider value={authContextValue}>
            <Routes>
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/signup" element={<SignupScreen />} />
                <Route path="/verify-email" element={<EmailVerificationScreen />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </AppContext.Provider>
    );
};

const LoggedInApp: React.FC<{ user: User | null; firebaseUser: FirebaseUser; }> = ({ user, firebaseUser }) => {
    const [settings, setSettings] = useState<CycleSettings>({ 
        cycleLength: 28, 
        periodLength: 5, 
        isPregnancyMode: false,
        isTryingToConceive: false,
        isDiscreetMode: false,
        healthReminders: {
            pill: { enabled: false, time: '08:00' },
            vitamins: { enabled: false, time: '09:00' }
        },
        security: { pinEnabled: false, pinCode: '' },
        notifications: { 
            period: true, 
            ovulation: true, 
            custom: { 
                beforePeriod: { enabled: true, days: 2 }, 
                beforeOvulation: { enabled: true, days: 1 } 
            } 
        } 
    });
    const [periodHistory, setPeriodHistory] = useState<PeriodEntry[]>([]);
    const [symptomHistory, setSymptomHistory] = useState<SymptomLog[]>([]);
    const [activityHistory, setActivityHistory] = useState<ActivityLog[]>([]);
    const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);
    const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); 

    useEffect(() => {
        if (!firebaseUser.uid) return;
        const unsubSettings = db.subscribeToSettings(firebaseUser.uid, (data) => { if (data) setSettings(data); });
        const unsubPeriod = db.subscribeToPeriods(firebaseUser.uid, setPeriodHistory);
        const unsubSymptoms = db.subscribeToSymptoms(firebaseUser.uid, setSymptomHistory);
        const unsubActivity = db.subscribeToActivity(firebaseUser.uid, setActivityHistory);
        const unsubNotifications = db.subscribeToAppNotifications(firebaseUser.uid, setAppNotifications);
        return () => {
            [unsubSettings, unsubPeriod, unsubSymptoms, unsubActivity, unsubNotifications].forEach(u => {
                if (typeof u === 'function') try { u(); } catch(e){}
            });
        };
    }, [firebaseUser.uid]);

    const updateSettings = async (newSettings: CycleSettings) => {
        setIsSubmitting(true);
        try {
            await db.saveSettings(firebaseUser.uid, newSettings);
            setSettings(newSettings); 
        } catch (e: any) {
            addToastNotification({ message: `Erreur : ${e.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const addToastNotification = (notif: Omit<Notification, 'id'>) => {
        const id = Math.random().toString();
        setToastNotifications(prev => [...prev, { id, ...notif }]);
        setTimeout(() => setToastNotifications(prev => prev.filter(n => n.id !== id)), 4000);
    };

    const addPeriodEntry = async (date: Date) => {
        if (periodHistory.length > 0) {
            addToastNotification({ 
                message: "Vous avez déjà un cycle enregistré. Pour en ajouter un nouveau, vous devez d'abord supprimer le cycle actuel." 
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await db.addPeriod(firebaseUser.uid, date);
            addToastNotification({ message: "Cycle enregistré avec succès !" });
            await db.addAppNotification(firebaseUser.uid, "Nouveau cycle enregistré.");
            
            const updated = await db.getPeriods(firebaseUser.uid);
            if (updated) {
                setPeriodHistory(updated.map(p => ({
                    id: p.id,
                    startDate: p.start_date,
                    endDate: p.end_date || undefined,
                    notes: p.notes || undefined
                })));
            }
        } catch (e: any) {
            addToastNotification({ message: `Échec : ${e.message}` });
        } finally {
            setTimeout(() => setIsSubmitting(false), 300);
        }
    };

    const removePeriodEntry = async (id: string) => {
        setIsSubmitting(true);
        try {
            await db.removePeriod(firebaseUser.uid, id);
            addToastNotification({ message: "Cycle supprimé." });
            setPeriodHistory(prev => prev.filter(p => p.id !== id));
        } catch (e: any) {
            addToastNotification({ message: "Erreur lors de la suppression." });
        } finally {
            setTimeout(() => setIsSubmitting(false), 300);
        }
    };

    const addActivityLog = async (date: Date, note?: string) => {
        setIsSubmitting(true);
        try {
            await db.addActivity(firebaseUser.uid, date, note);
            addToastNotification({ message: "Activité synchronisée." });
        } catch (e: any) {
            addToastNotification({ message: `Erreur : ${e.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const addSymptomLog = async (log: Omit<SymptomLog, 'id'>) => {
        setIsSubmitting(true);
        try {
            await db.saveSymptom(firebaseUser.uid, log);
            addToastNotification({ message: "Symptômes enregistrés." });
        } catch (e: any) {
            addToastNotification({ message: `Erreur : ${e.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateWaterIntake = async (date: Date, glasses: number) => {
        const dateStr = date.toISOString().split('T')[0];
        const existing = symptomHistory.find(s => s.date === dateStr);
        const log = existing ? { ...existing, waterIntake: glasses } : { date: dateStr, mood: 'calme' as const, pain: 'aucune' as const, flow: 'aucune' as const, waterIntake: glasses };
        try { await db.saveSymptom(firebaseUser.uid, log); } catch (e) {}
    };

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        document.documentElement.classList.toggle('dark');
    };

    const lastPeriod = useMemo(() => {
        if (periodHistory.length === 0) return null;
        return [...periodHistory].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
    }, [periodHistory]);

    const predictions = useMemo(() => {
        if (!lastPeriod) return { nextPeriodDate: null, ovulationDate: null, fertileWindow: null, nextPeriodWindow: null };
        const start = new Date(lastPeriod.startDate);
        const next = addDays(start, settings.cycleLength);
        const ovulation = subDays(next, 14);
        return {
            nextPeriodDate: next, ovulationDate: ovulation,
            fertileWindow: { start: subDays(ovulation, 5), end: addDays(ovulation, 1) },
            nextPeriodWindow: { start: next, end: addDays(next, settings.periodLength - 1) }
        };
    }, [lastPeriod, settings]);

    const unreadCount = useMemo(() => appNotifications.filter(n => !n.read).length, [appNotifications]);

    return (
        <AppContext.Provider value={{
            settings, setSettings: updateSettings, periodHistory, addPeriodEntry, removePeriodEntry, updatePeriodEntry: () => {},
            symptomHistory, addSymptomLog, updateWaterIntake, activityHistory, addActivityLog, removeActivityLog: (entry) => db.removeActivity(firebaseUser.uid, typeof entry === 'string' ? entry : entry.id),
            isPregnancyMode: settings.isPregnancyMode, togglePregnancyMode: () => updateSettings({ ...settings, isPregnancyMode: !settings.isPregnancyMode }),
            theme, toggleTheme, user, logout: db.apiLogout, updateUser: (name, _photo) => db.updateUserProfile(firebaseUser.uid, { name }), deleteAccount: () => db.deleteUserAccount(firebaseUser.uid),
            predictionAccuracy: 92, lastPeriod, ...predictions, currentPeriodInfo: null, toastNotifications,
            removeToastNotification: (id) => setToastNotifications(prev => prev.filter(t => t.id !== id)),
            addToastNotification, appNotifications, markNotificationsAsRead: () => db.markNotificationsAsRead(firebaseUser.uid, appNotifications),
            login: db.apiLogin, signup: db.apiSignup
        }}>
            <div className="flex flex-col h-screen max-w-sm mx-auto bg-primary-bg-light dark:bg-primary-bg-dark text-text-body-light dark:text-text-body-dark shadow-2xl relative overflow-hidden">
                {isSubmitting && (
                    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/60 dark:bg-primary-bg-dark/60 backdrop-blur-sm animate-fade-in">
                        <div className="p-8 bg-white dark:bg-card-bg-dark rounded-3xl shadow-2xl flex flex-col items-center border border-gray-100 dark:border-gray-800">
                            <LoadingSpinner className="w-12 h-12 text-accent-light mb-4" />
                            <p className="text-sm font-bold text-accent-light">Actualisation...</p>
                        </div>
                    </div>
                )}
                <header className="h-16 flex items-center justify-between px-5 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-card-bg-dark/80 backdrop-blur-md z-10">
                    <div className="flex items-center space-x-2">
                        <AppLogo className="w-8 h-8" />
                        <span className="font-bold text-lg text-accent-light dark:text-accent-dark">Mon Cycle</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <NavLink to="/notifications" className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                            <BellIcon className={`w-6 h-6 ${unreadCount > 0 ? 'text-accent-light' : 'text-gray-400'}`} />
                            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-card-bg-dark animate-bounce">{unreadCount}</span>}
                        </NavLink>
                        <button onClick={() => setMenuOpen(true)} className="relative group">
                            <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}`} className="w-8 h-8 rounded-full border-2 border-accent-light group-hover:scale-110 transition-transform cursor-pointer" alt="P" />
                        </button>
                    </div>
                </header>
                <main className="flex-grow overflow-y-auto pb-20 p-4">
                    <Routes>
                        <Route path="/" element={<HomeScreen />} />
                        <Route path="/calendar" element={<CalendarScreen />} />
                        <Route path="/reports" element={<SymptomsScreen />} />
                        <Route path="/assistant" element={<AssistantScreen />} />
                        <Route path="/settings" element={<SettingsScreen />} />
                        <Route path="/activity" element={<ProfileDetailScreen />} />
                        <Route path="/notifications" element={<NotificationCenterScreen />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
                <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-card-bg-dark/90 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 flex justify-around items-center px-2">
                    <NavLink to="/" className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-accent-light' : 'text-gray-400'}`}><HomeIcon className="w-6 h-6" /><span className="text-[10px]">Accueil</span></NavLink>
                    <NavLink to="/calendar" className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-accent-light' : 'text-gray-400'}`}><CalendarIcon className="w-6 h-6" /><span className="text-[10px]">Calendrier</span></NavLink>
                    <NavLink to="/reports" className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-accent-light' : 'text-gray-400'}`}><ReportsIcon className="w-6 h-6" /><span className="text-[10px]">Santé</span></NavLink>
                    <NavLink to="/assistant" className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-accent-light' : 'text-gray-400'}`}><ChatBubbleLeftRightIcon className="w-6 h-6" /><span className="text-[10px]">IA</span></NavLink>
                    <NavLink to="/settings" className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-accent-light' : 'text-gray-400'}`}><SettingsIcon className="w-6 h-6" /><span className="text-[10px]">Paramètres</span></NavLink>
                </nav>
                <ProfileMenu isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} />
                <div className="fixed top-20 left-4 right-4 z-[150] space-y-2 pointer-events-none">
                    {toastNotifications.map(n => (
                        <div key={n.id} className="bg-card-bg-light dark:bg-card-bg-dark p-3 rounded-xl shadow-2xl border-l-4 border-accent-light flex justify-between items-center animate-fade-in pointer-events-auto">
                            <span className="text-xs font-bold">{n.message}</span>
                            <button onClick={() => useAppContext().removeToastNotification(n.id)} className="p-1"><XMarkIcon className="w-4 h-4 text-gray-400" /></button>
                        </div>
                    ))}
                </div>
            </div>
        </AppContext.Provider>
    );
};

export default App;
