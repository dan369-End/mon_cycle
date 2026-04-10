import React, { useState, useMemo } from 'react';
import { useAppContext } from '../App';
import { DayType, ActivityLog, PeriodEntry } from '../types';
import { format, endOfMonth, eachDayOfInterval, addMonths, getDay, isSameDay, isToday, isWithinInterval, addDays, subDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { HeartIcon, XMarkIcon, DropIcon, SparklesIcon, CalendarIcon, ArrowPathIcon } from '../components/Icons';
import { ConfirmationModal } from '../components/ConfirmationModal';


const ActivityJournalPreview: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
    const { activityHistory } = useAppContext();
    const today = new Date();
    const thisMonth = activityHistory.filter(a => {
        const actDate = new Date(a.date);
        return actDate.getMonth() === today.getMonth() && actDate.getFullYear() === today.getFullYear();
    });

    return (
        <button
            onClick={onNavigate}
            className="w-full p-5 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-2xl shadow-lg flex items-center justify-between transform transition hover:scale-[1.02] active:scale-95 animate-fade-in"
        >
            <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl mr-4">
                    <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                    <p className="font-bold text-lg">Journal d'activité</p>
                    <p className="text-xs opacity-90">{thisMonth.length} rapports ce mois</p>
                </div>
            </div>
            <div className="p-2 bg-white/20 rounded-full">
                <SparklesIcon className="w-5 h-5" />
            </div>
        </button>
    );
};
// Utilitaire pour créer une date locale à partir de YYYY-MM-DD sans décalage UTC
const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0);
};

const DateActionModal: React.FC<{
    selectedDate: Date;
    onClose: () => void;
    periodEntry: PeriodEntry | undefined;
    activityLog: ActivityLog | undefined;
}> = ({ selectedDate, onClose, periodEntry, activityLog }) => {
    const { addActivityLog, removeActivityLog, addPeriodEntry, removePeriodEntry } = useAppContext();
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ action: () => void; message: string; title: string; confirmLabel: string; } | null>(null);
    const [note, setNote] = useState('');

    const handleAction = (action: () => void) => {
        action();
        onClose();
    };

    const confirmDeletion = (onConfirm: () => void, title: string, message: string, confirmLabel: string) => {
        setConfirmAction({ action: onConfirm, title, message, confirmLabel });
        setConfirmOpen(true);
    };

    const periodDeletionMessage = periodEntry
        ? `Voulez-vous vraiment annuler le cycle enregistré pour le ${format(parseLocalDate(periodEntry.startDate), 'd MMMM', { locale: fr })} ? Cette action supprimera les prévisions.`
        : "Voulez-vous annuler l'enregistrement de ce cycle ?";

    return (
        <>
            {isConfirmOpen && confirmAction && (
                <ConfirmationModal
                    title={confirmAction.title}
                    message={confirmAction.message}
                    confirmText={confirmAction.confirmLabel}
                    cancelText="Garder le cycle"
                    onConfirm={() => {
                        confirmAction.action();
                        setConfirmOpen(false);
                        onClose();
                    }}
                    onCancel={() => setConfirmOpen(false)}
                />
            )}
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-card-bg-light dark:bg-card-bg-dark rounded-2xl shadow-xl w-full max-w-xs p-6 relative animate-zoom-in">
                    <button onClick={onClose} className="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded-full hover:bg-gray-500/10">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                    <h3 className="text-lg font-bold text-center mb-6 text-text-heading-light dark:text-text-heading-dark">
                        {format(selectedDate, 'd MMMM', { locale: fr })}
                    </h3>
                    <div className="space-y-3">
                        {activityLog ? (
                            <button
                                onClick={() => confirmDeletion(() => removeActivityLog(activityLog.id), "Rapport sexuel", "Supprimer cet enregistrement ?", "Supprimer")}
                                className="w-full bg-gray-500 text-white py-3 px-4 rounded-xl shadow hover:opacity-90 transition-opacity font-bold text-sm">
                                Supprimer le rapport
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Note (facultatif)..."
                                    className="w-full p-3 bg-primary-bg-light dark:bg-primary-bg-dark rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark outline-none resize-none h-20 text-black dark:text-white"
                                />
                                <button
                                    onClick={() => handleAction(() => addActivityLog(selectedDate, note))}
                                    className="w-full bg-accent-light dark:bg-accent-dark text-white py-3 px-4 rounded-xl shadow hover:bg-accent-hover-light dark:hover:bg-accent-hover-dark transition-colors font-bold text-sm">
                                    Enregistrer un rapport
                                </button>
                            </div>
                        )}
                        {periodEntry ? (
                            <button
                                onClick={() => confirmDeletion(() => removePeriodEntry(periodEntry.id), "Annuler le cycle", periodDeletionMessage, "Confirmer l'annulation")}
                                className="w-full bg-red-500 text-white py-3 px-4 rounded-xl shadow hover:bg-red-600 transition-colors font-bold text-sm">
                                Annuler ce cycle
                            </button>
                        ) : (
                            <button
                                onClick={() => handleAction(() => addPeriodEntry(selectedDate))}
                                className="w-full bg-period-light dark:bg-period-dark text-white py-3 px-4 rounded-xl shadow hover:opacity-90 transition-opacity font-bold text-sm">
                                Début des règles
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const FutureCyclesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { settings, lastPeriod } = useAppContext();

    const futureCycles = useMemo(() => {
        if (!lastPeriod) return [];

        const cycles = [];
        let currentStartDate = parseLocalDate(lastPeriod.startDate);

        for (let i = 0; i < 6; i++) {
            currentStartDate = addDays(currentStartDate, settings.cycleLength);
            const periodEnd = addDays(currentStartDate, settings.periodLength - 1);
            const nextNextPeriodStart = addDays(currentStartDate, settings.cycleLength);
            const ovulationDate = subDays(nextNextPeriodStart, 14);

            cycles.push({
                startDate: currentStartDate,
                endDate: periodEnd,
                ovulationDate: ovulationDate
            });
        }
        return cycles;
    }, [lastPeriod, settings]);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-card-bg-light dark:bg-card-bg-dark rounded-2xl shadow-xl w-full max-w-sm max-h-[80vh] flex flex-col relative animate-zoom-in">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-primary-bg-light dark:bg-primary-bg-dark rounded-t-2xl">
                    <h3 className="text-lg font-bold text-text-heading-light dark:text-text-heading-dark flex items-center">
                        <ArrowPathIcon className="w-5 h-5 mr-2 text-accent-light dark:text-accent-dark" />
                        Prévisions des cycles
                    </h3>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded-full hover:bg-gray-500/10">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 space-y-4">
                    {futureCycles.length === 0 ? (
                        <p className="text-center text-text-muted-light dark:text-text-muted-dark py-8">
                            Entrez vos dernières règles pour voir les prévisions.
                        </p>
                    ) : (
                        futureCycles.map((cycle, index) => (
                            <div key={index} className="bg-primary-bg-light dark:bg-primary-bg-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                                <p className="text-sm font-semibold text-accent-light dark:text-accent-dark mb-2 uppercase tracking-wide">
                                    {format(cycle.startDate, 'MMMM yyyy', { locale: fr })}
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-start">
                                        <DropIcon className="w-5 h-5 text-period-light dark:text-period-dark mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark">Règles prévues</p>
                                            <p className="text-xs text-text-body-light dark:text-text-body-dark">
                                                {format(cycle.startDate, 'd MMM', { locale: fr })} - {format(cycle.endDate, 'd MMM', { locale: fr })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <SparklesIcon className="w-5 h-5 text-ovulation-light dark:text-ovulation-dark mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark">Ovulation estimée</p>
                                            <p className="text-xs text-text-body-light dark:text-text-body-dark">
                                                {format(cycle.ovulationDate, 'd MMMM', { locale: fr })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const CalendarScreen: React.FC = () => {
    const { settings, periodHistory, activityHistory, removePeriodEntry } = useAppContext();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showForecast, setShowForecast] = useState(false);
    const [selectedCycleForDeletion, setSelectedCycleForDeletion] = useState<PeriodEntry | null>(null); // ✅ NOUVEAU

    const today = new Date(new Date().setHours(0, 0, 0, 0));

    // ✅ NOUVEAU : Calcule le cycle courant (celui qui contient "aujourd'hui")
    const currentCycle = useMemo(() => {
        if (!periodHistory.length) return null;

        // 1. Cherche le cycle qui contient aujourd'hui
        for (const entry of periodHistory) {
            const periodStart = parseLocalDate(entry.startDate);
            const periodEnd = addDays(periodStart, settings.cycleLength - 1);
            if (isWithinInterval(today, { start: periodStart, end: periodEnd })) {
                return entry;
            }
        }

        // 2. Par défaut, retourne le cycle le plus récent (≤ aujourd'hui)
        const sortedByDate = [...periodHistory]
            .filter(p => parseLocalDate(p.startDate) <= today)
            .sort((a, b) => parseLocalDate(b.startDate).getTime() - parseLocalDate(a.startDate).getTime());

        return sortedByDate[0] || null;
    }, [periodHistory, settings.cycleLength]);

    const daysInMonth = useMemo(() => {
        const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const end = endOfMonth(currentMonth);
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const periodEntryForSelectedDate = useMemo(() => {
        if (!selectedDate) return undefined;
        return periodHistory.find(p => {
            const periodStart = parseLocalDate(p.startDate);
            const periodEnd = addDays(periodStart, settings.periodLength - 1);
            return isWithinInterval(startOfDay(selectedDate), { start: periodStart, end: periodEnd });
        });
    }, [selectedDate, periodHistory, settings.periodLength]);

    const getDayType = (day: Date): DayType => {
        const checkDay = startOfDay(day);

        // 1. Check recorded periods
        for (const entry of periodHistory) {
            const periodStart = parseLocalDate(entry.startDate);
            const periodEnd = addDays(periodStart, settings.periodLength - 1);
            if (isWithinInterval(checkDay, { start: periodStart, end: periodEnd })) {
                return DayType.Period;
            }
        }

        if (periodHistory.length === 0) return DayType.Safe;

        // 2. Predict future cycles (Periods, Ovulation, Fertile, EndCycle)
        const sortedHistory = [...periodHistory].sort((a, b) => a.startDate.localeCompare(b.startDate));
        const lastRecorded = sortedHistory[sortedHistory.length - 1];

        if (lastRecorded) {
            const lastStart = parseLocalDate(lastRecorded.startDate);

            // On projette sur 12 cycles pour le calendrier
            for (let i = 1; i <= 12; i++) {
                const projectedStart = addDays(lastStart, settings.cycleLength * i);
                const projectedEnd = addDays(projectedStart, settings.periodLength - 1);

                // Règles prévues
                if (isWithinInterval(checkDay, { start: projectedStart, end: projectedEnd })) {
                    return DayType.PredictedPeriod;
                }

                // Fin de cycle / Phase SPM (les 4 jours AVANT les règles prévues)
                const pmsStart = subDays(projectedStart, 4);
                if (isWithinInterval(checkDay, { start: pmsStart, end: subDays(projectedStart, 1) })) {
                    return DayType.EndCycle;
                }

                // Ovulation prévue
                const ovulationDate = subDays(addDays(projectedStart, settings.cycleLength), 14);
                if (isSameDay(checkDay, ovulationDate)) return DayType.Ovulation;

                // Fenêtre de fertilité prévue
                const fertileStart = subDays(ovulationDate, 5);
                const fertileEnd = addDays(ovulationDate, 1);
                if (isWithinInterval(checkDay, { start: fertileStart, end: fertileEnd })) {
                    return DayType.Fertile;
                }
            }
        }

        return DayType.Safe;
    };

    const dayStyles = (dayType: DayType, isCurrent: boolean) => {
        let styles = 'w-10 h-10 flex items-center justify-center rounded-full text-sm relative transition-all duration-200 transform hover:scale-110 ';
        if (isCurrent) styles += ' ring-2 ring-accent-light dark:ring-accent-dark ';

        switch (dayType) {
            case DayType.Period:
                styles += 'bg-period-light dark:bg-period-dark text-white font-semibold shadow-sm';
                break;
            case DayType.PredictedPeriod:
                // Même couleur que Period mais avec un indicateur visuel (bordure)
                styles += 'bg-period-light dark:bg-period-dark text-white font-semibold border-2 border-white/40 dark:border-black/20';
                break;
            case DayType.EndCycle:
                styles += 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800';
                break;
            case DayType.Fertile:
                styles += 'bg-fertile-light/30 dark:bg-fertile-dark/30 text-text-heading-light dark:text-text-heading-dark';
                break;
            case DayType.Ovulation:
                styles += 'bg-ovulation-light dark:bg-ovulation-dark text-white font-semibold shadow-sm';
                break;
            case DayType.Safe:
                styles += 'bg-gray-100 dark:bg-card-bg-dark/50 hover:bg-gray-200 dark:hover:bg-gray-700';
                break;
            default:
                styles += 'text-text-body-light dark:text-text-body-dark hover:bg-gray-200 dark:hover:bg-gray-700';
        }
        return styles;
    };

    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const firstDayOfMonth = getDay(monthStart) - 1 < 0 ? 6 : getDay(monthStart) - 1;

    const changeMonth = (amount: number) => {
        setCurrentMonth(addMonths(currentMonth, amount));
    };

    return (
        <div className="p-4">
            {showForecast && <FutureCyclesModal onClose={() => setShowForecast(false)} />}
            {selectedDate && (
                <DateActionModal
                    selectedDate={selectedDate}
                    onClose={() => setSelectedDate(null)}
                    periodEntry={periodEntryForSelectedDate}
                    activityLog={activityHistory.find(a => isSameDay(new Date(a.date), selectedDate))}
                />
            )}

            {/* ✅ NOUVEAU : Bouton pour annuler le cycle en cours */}
            {currentCycle && (
                <div className="mb-6 flex justify-center animate-fade-in">
                    <button
                        onClick={() => setSelectedCycleForDeletion(currentCycle)}
                        className="flex items-center px-6 py-3 bg-red-500 hover:bg-red-600 dark:hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg transition transform hover:scale-105 active:scale-95">
                        <XMarkIcon className="w-5 h-5 mr-2" />
                        Annuler le cycle en cours
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-500/10 transition-transform active:scale-90 text-text-body-light dark:text-text-body-dark">&lt;</button>
                <h2 className="text-xl font-bold capitalize text-text-heading-light dark:text-text-heading-dark transition-all">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h2>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-500/10 transition-transform active:scale-90 text-text-body-light dark:text-text-body-dark">&gt;</button>
            </div>

            <div className="animate-fade-in">
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-text-muted-light dark:text-text-muted-dark font-black uppercase mb-4 tracking-widest px-1">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => <div key={i}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-y-3">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                    {daysInMonth.map(day => {
                        const dayType = getDayType(day);
                        const hasActivity = activityHistory.some(a => isSameDay(new Date(a.date), day));
                        return (
                            <div key={day.toString()} className="flex items-center justify-center">
                                <button onClick={() => setSelectedDate(day)} className={dayStyles(dayType, isToday(day))}>
                                    {format(day, 'd')}
                                    {hasActivity && <HeartIcon className="w-2.5 h-2.5 absolute top-0.5 right-0.5 text-red-500" />}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    onClick={() => setShowForecast(true)}
                    className="flex items-center px-8 py-3.5 bg-accent-light dark:bg-accent-dark text-white rounded-2xl shadow-lg hover:shadow-accent-light/30 transform transition hover:scale-105 font-bold text-sm">
                    <CalendarIcon className="w-5 h-5 mr-3" />
                    Prévisions détaillées
                </button>
            </div>

            {/* ✅ JOURNAL D'ACTIVITÉ - À AJOUTER */}
            <div className="mt-8">
                <ActivityJournalPreview onNavigate={() => window.location.href = '/#/activity'} />
            </div>

            {/* ✅ NOUVEAU : Modal de confirmation pour annuler le cycle */}
            {selectedCycleForDeletion && (
                <ConfirmationModal
                    title="Annuler ce cycle ?"
                    message={`Voulez-vous vraiment annuler le cycle démarré le ${format(parseLocalDate(selectedCycleForDeletion.startDate), 'd MMMM yyyy', { locale: fr })} ? Cette action supprimera les prévisions associées à ce cycle.`}
                    confirmText="Oui, annuler"
                    cancelText="Non, garder"
                    onConfirm={() => {
                        removePeriodEntry(selectedCycleForDeletion.id);
                        setSelectedCycleForDeletion(null);
                    }}
                    onCancel={() => setSelectedCycleForDeletion(null)}
                />
            )}

            <div className="mt-8 p-5 bg-card-bg-light dark:bg-card-bg-dark rounded-3xl space-y-3 text-xs animate-fade-in border border-gray-100 dark:border-gray-800">
                <p className="font-bold text-[10px] uppercase text-text-muted-light tracking-widest mb-1">Légende</p>
                <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-period-light dark:bg-period-dark mr-3 shadow-sm"></div><span className="text-text-body-light dark:text-text-body-dark font-medium">Règles (enregistrées ou prévues)</span></div>
                <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 mr-3"></div><span className="text-text-body-light dark:text-text-body-dark font-medium">Fin de cycle / Phase SPM</span></div>
                <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-fertile-light/30 dark:bg-fertile-dark/30 mr-3"></div><span className="text-text-body-light dark:text-text-body-dark font-medium">Fenêtre de fertilité</span></div>
                <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-ovulation-light dark:bg-ovulation-dark mr-3 shadow-sm"></div><span className="text-text-body-light dark:text-text-body-dark font-medium">Jour d'ovulation estimé</span></div>
            </div>
        </div>
    );
};

export default CalendarScreen;