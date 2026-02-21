
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { DayType, ActivityLog } from '../types';
// Fix: Re-typing date-fns imports and handling missing parseISO via native Date
import { format, addDays, subDays, isSameDay, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { HeartIcon, ShieldCheckIcon, SparklesIcon, XMarkIcon } from '../components/Icons';
import { ConfirmationModal } from '../components/ConfirmationModal';

const getPhaseForDate = (date: Date, periodHistory: any[], settings: any): DayType => {
    // Fix: parseISO replacement
    const anchorPeriod = [...periodHistory]
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .find(p => new Date(p.startDate) <= date);

    if (!anchorPeriod) return DayType.Safe;

    // Fix: parseISO replacement
    const cycleStartDate = new Date(anchorPeriod.startDate);
    const periodEnd = addDays(cycleStartDate, settings.periodLength - 1);
    if (isWithinInterval(date, { start: cycleStartDate, end: periodEnd })) return DayType.Period;

    const nextPeriodDate = addDays(cycleStartDate, settings.cycleLength);
    const ovulationDate = subDays(nextPeriodDate, 14);

    if (isSameDay(date, ovulationDate)) return DayType.Ovulation;
    
    const fertileWindowStart = subDays(ovulationDate, 5);
    const fertileWindowEnd = addDays(ovulationDate, 1);
    if (isWithinInterval(date, { start: fertileWindowStart, end: fertileWindowEnd })) return DayType.Fertile;

    return DayType.Safe;
};

const ProfileDetailScreen: React.FC = () => {
    const { activityHistory, periodHistory, settings, removeActivityLog } = useAppContext();
    const navigate = useNavigate();
    const [confirmDelete, setConfirmDelete] = useState<ActivityLog | null>(null);

    const sortedActivities = useMemo(() => {
        return [...activityHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [activityHistory]);

    const getRiskInfo = (dayType: DayType) => {
        switch (dayType) {
            case DayType.Ovulation:
                return { text: "Risque de grossesse : Très élevé", color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", icon: <SparklesIcon className="w-5 h-5 mr-2 text-red-500" /> };
            case DayType.Fertile:
                return { text: "Risque de grossesse : Élevé", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", icon: <SparklesIcon className="w-5 h-5 mr-2 text-orange-500" /> };
            case DayType.Period:
                return { text: "Risque de grossesse : Très faible", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", icon: <ShieldCheckIcon className="w-5 h-5 mr-2 text-blue-500" /> };
            case DayType.Safe:
            default:
                return { text: "Risque de grossesse : Faible", color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20", icon: <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-500" /> };
        }
    };

    return (
        <div className="p-4 space-y-4 animate-fade-in">
            {confirmDelete && (
                <ConfirmationModal 
                    title="Supprimer le rapport"
                    message="Voulez-vous vraiment supprimer cet enregistrement ?"
                    onConfirm={() => {
                        removeActivityLog(confirmDelete);
                        setConfirmDelete(null);
                    }}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-text-heading-light dark:text-text-heading-dark">Journal d'activité</h1>
                <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
            
            <p className="text-sm text-text-body-light dark:text-text-body-dark opacity-70">
                Retrouvez ici vos rapports sexuels enregistrés et l'analyse du risque de conception à ces dates.
            </p>
            
            {sortedActivities.length === 0 ? (
                <div className="text-center py-20 bg-card-bg-light dark:bg-card-bg-dark rounded-3xl shadow-sm border border-dashed border-gray-200 dark:border-gray-700">
                    <HeartIcon className="w-16 h-16 mx-auto text-gray-200 dark:text-gray-700 mb-4" />
                    <p className="text-text-muted-light font-medium">Aucun rapport enregistré.</p>
                    <p className="text-xs text-text-muted-light mt-1">Ajoutez-les depuis le calendrier.</p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {sortedActivities.map(activity => {
                        // Fix: parseISO replacement
                        const activityDate = new Date(activity.date);
                        const dayType = getPhaseForDate(activityDate, periodHistory, settings);
                        const riskInfo = getRiskInfo(dayType);

                        return (
                            <li key={activity.id} className="bg-card-bg-light dark:bg-card-bg-dark p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 animate-zoom-in overflow-hidden relative">
                                <button 
                                    onClick={() => setConfirmDelete(activity)}
                                    className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>

                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 flex items-center justify-center bg-red-100 dark:bg-red-900/40 rounded-full mr-3">
                                        <HeartIcon className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-text-heading-light dark:text-text-heading-dark capitalize block">
                                            {format(activityDate, 'eeee d MMMM', { locale: fr })}
                                        </span>
                                        <span className="text-[10px] text-text-muted-light uppercase font-bold tracking-wider">
                                            {format(activityDate, 'yyyy', { locale: fr })}
                                        </span>
                                    </div>
                                </div>

                                <div className={`flex items-center text-xs p-3 rounded-xl mb-3 font-semibold ${riskInfo.bg} ${riskInfo.color}`}>
                                    {riskInfo.icon}
                                    <span>{riskInfo.text}</span>
                                </div>

                                {activity.note ? (
                                    <div className="bg-primary-bg-light dark:bg-primary-bg-dark/50 p-3 rounded-xl border-l-4 border-accent-light">
                                        <p className="text-sm italic text-text-body-light dark:text-text-body-dark">
                                            "{activity.note}"
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs italic text-text-muted-light">Aucune note ajoutée.</p>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    );
};

export default ProfileDetailScreen;