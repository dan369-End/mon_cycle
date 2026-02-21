
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { SymptomLog } from '../types';
// Fix: Re-typing date-fns imports and handling missing subMonths/parseISO via native Date
import { format, isSameDay, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ArrowPathIcon, ClockIcon, HeartIcon, SparklesIcon } from '../components/Icons';

const moodMapping: { [key in SymptomLog['mood']]: { emoji: string, value: number, label: string } } = {
  'heureuse': { emoji: '😊', value: 5, label: 'Heureuse' },
  'energique': { emoji: '⚡️', value: 4, label: 'Énergique' },
  'calme': { emoji: '😌', value: 3, label: 'Calme' },
  'irritable': { emoji: '😠', value: 2, label: 'Irritable' },
  'triste': { emoji: '😢', value: 1, label: 'Triste' },
};

const painMapping: { [key in SymptomLog['pain']]: { value: number, label: string } } = {
  'aucune': { value: 0, label: 'Aucune' },
  'légère': { value: 1, label: 'Légère' },
  'modérée': { value: 2, label: 'Modérée' },
  'forte': { value: 3, label: 'Forte' },
};

const flowMapping: { [key in SymptomLog['flow']]: { value: number, label: string } } = {
  'aucune': { value: 0, label: 'Aucun' },
  'léger': { value: 1, label: 'Léger' },
  'moyen': { value: 2, label: 'Moyen' },
  'abondant': { value: 3, label: 'Abondant' },
};

const CycleSummary: React.FC = () => {
    const { periodHistory, symptomHistory, settings } = useAppContext();

    const summary = useMemo(() => {
        let avgCycleLength = settings.cycleLength;
        if (periodHistory.length >= 2) {
            const cycleLengths = [];
            for (let i = 1; i < periodHistory.length; i++) {
                // Fix: parseISO replacement
                const prevDate = new Date(periodHistory[i-1].startDate);
                const currDate = new Date(periodHistory[i].startDate);
                cycleLengths.push(differenceInDays(currDate, prevDate));
            }
            const recentCycles = cycleLengths.slice(-3);
            if (recentCycles.length > 0) {
              avgCycleLength = Math.round(recentCycles.reduce((a, b) => a + b, 0) / recentCycles.length);
            }
        }

        let mostFrequentMood = 'N/A';
        // Fix: subMonths replacement
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        // Fix: parseISO replacement
        const recentSymptoms = symptomHistory.filter(s => new Date(s.date) >= threeMonthsAgo);
        if (recentSymptoms.length > 0) {
            const moodCounts = recentSymptoms.reduce((acc, log) => {
                acc[log.mood] = (acc[log.mood] || 0) + 1;
                return acc;
            }, {} as Record<SymptomLog['mood'], number>);
            mostFrequentMood = Object.entries(moodCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
        }

        return {
            avgCycleLength,
            avgPeriodLength: settings.periodLength,
            mostFrequentMood: moodMapping[mostFrequentMood as SymptomLog['mood']]?.label || 'Aucune donnée'
        }
    }, [periodHistory, symptomHistory, settings]);

    return (
        <div className="p-5 bg-card-bg-light dark:bg-card-bg-dark rounded-2xl shadow-md">
            <h3 className="font-semibold mb-4 text-text-heading-light dark:text-text-heading-dark">Résumé des 3 derniers cycles</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                    <div className="w-14 h-14 flex items-center justify-center bg-purple-100 dark:bg-accent-dark/20 rounded-full mb-2">
                        <ArrowPathIcon className="w-7 h-7 text-purple-600 dark:text-accent-dark"/>
                    </div>
                    <p className="font-bold text-lg text-text-heading-light dark:text-text-heading-dark">{summary.avgCycleLength} j</p>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Cycle moyen</p>
                </div>
                 <div className="flex flex-col items-center">
                    <div className="w-14 h-14 flex items-center justify-center bg-pink-100 dark:bg-period-dark/20 rounded-full mb-2">
                        <ClockIcon className="w-7 h-7 text-pink-600 dark:text-period-dark"/>
                    </div>
                    <p className="font-bold text-lg text-text-heading-light dark:text-text-heading-dark">{summary.avgPeriodLength} j</p>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Durée règles</p>
                </div>
                 <div className="flex flex-col items-center">
                    <div className="w-14 h-14 flex items-center justify-center bg-yellow-100 dark:bg-yellow-400/20 rounded-full mb-2">
                         <HeartIcon className="w-7 h-7 text-yellow-600 dark:text-yellow-400"/>
                    </div>
                    <p className="font-bold text-lg truncate text-text-heading-light dark:text-text-heading-dark">{summary.mostFrequentMood}</p>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Humeur fréq.</p>
                </div>
            </div>
        </div>
    );
};

const SymptomsScreen: React.FC = () => {
    const { symptomHistory, addSymptomLog, theme, activityHistory } = useAppContext();
    const navigate = useNavigate();
    const today = new Date();
    // Fix: parseISO replacement
    const todayLog = symptomHistory.find(log => isSameDay(new Date(log.date), today));

    const [mood, setMood] = useState<SymptomLog['mood']>(todayLog?.mood || 'calme');
    const [pain, setPain] = useState<SymptomLog['pain']>(todayLog?.pain || 'aucune');
    const [flow, setFlow] = useState<SymptomLog['flow']>(todayLog?.flow || 'aucune');

    const handleSave = () => {
        addSymptomLog({ date: today.toISOString(), mood, pain, flow });
        alert('Symptômes enregistrés !');
    };

    const chartData = useMemo(() => {
        return [...symptomHistory]
            // Fix: parseISO replacement
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(log => ({
                name: format(new Date(log.date), 'dd/MM'),
                Humeur: moodMapping[log.mood].value,
                Douleur: painMapping[log.pain].value,
                Flux: flowMapping[log.flow].value,
            }));
    }, [symptomHistory]);
    
    const chartColors = theme === 'dark' ? { mood: '#A78BFA', pain: '#F9A8D4', flow: '#6EE7B7' } : { mood: '#9370DB', pain: '#F472B6', flow: '#34D399' };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold text-text-heading-light dark:text-text-heading-dark">Rapports de santé</h1>
            
            {/* Nouveau Widget pour le Journal d'activité */}
            <button 
                onClick={() => navigate('/activity')}
                className="w-full p-5 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-2xl shadow-lg flex items-center justify-between transform transition hover:scale-[1.02] active:scale-95 animate-fade-in"
            >
                <div className="flex items-center">
                    <div className="p-3 bg-white/20 rounded-xl mr-4">
                        <HeartIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-lg">Journal d'activité</p>
                        <p className="text-xs opacity-90">{activityHistory.length} rapports enregistrés</p>
                    </div>
                </div>
                <div className="p-2 bg-white/20 rounded-full">
                    <SparklesIcon className="w-5 h-5" />
                </div>
            </button>

            <CycleSummary />

            <div className="space-y-6 p-5 bg-card-bg-light dark:bg-card-bg-dark rounded-2xl shadow-md">
                <p className="font-semibold text-lg text-text-heading-light dark:text-text-heading-dark">Aujourd'hui, {format(today, 'd MMMM yyyy', { locale: fr })}</p>
                <div>
                    <h3 className="font-semibold mb-3 text-text-body-light dark:text-text-body-dark">Comment te sens-tu ?</h3>
                    <div className="flex justify-around">
                        {Object.entries(moodMapping).map(([key, { emoji }]) => (
                            <button key={key} onClick={() => setMood(key as SymptomLog['mood'])} 
                                    className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 w-16 h-16 justify-center transform hover:scale-110 ${mood === key ? 'bg-accent-light/10 dark:bg-accent-dark/20 ring-2 ring-accent-light dark:ring-accent-dark' : ''}`}>
                                <span className="text-3xl">{emoji}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-3 text-text-body-light dark:text-text-body-dark">Douleurs</h3>
                    <div className="flex justify-around space-x-2">
                        {Object.entries(painMapping).map(([key, { label }]) => (
                            <button key={key} onClick={() => setPain(key as SymptomLog['pain'])} 
                                    className={`flex-1 py-3 px-1 text-sm font-semibold rounded-lg transition-colors ${pain === key ? 'bg-accent-light text-white dark:bg-accent-dark' : 'bg-gray-100 dark:bg-primary-bg-dark text-text-body-light dark:text-text-body-dark'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-3 text-text-body-light dark:text-text-body-dark">Flux menstruel</h3>
                    <div className="flex justify-around space-x-2">
                         {Object.entries(flowMapping).map(([key, { label }]) => (
                            <button key={key} onClick={() => setFlow(key as SymptomLog['flow'])} 
                                    className={`flex-1 py-3 px-1 text-sm font-semibold rounded-lg transition-colors ${flow === key ? 'bg-accent-light text-white dark:bg-accent-dark' : 'bg-gray-100 dark:bg-primary-bg-dark text-text-body-light dark:text-text-body-dark'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                 <button onClick={handleSave} className="w-full mt-4 bg-accent-light text-white font-bold py-3 px-4 rounded-xl shadow hover:bg-accent-hover-light transition-colors dark:bg-accent-dark dark:hover:bg-accent-hover-dark">
                    Enregistrer les symptômes
                </button>
            </div>
            
            <div className="p-4 bg-card-bg-light dark:bg-card-bg-dark rounded-2xl shadow-md">
                <h3 className="font-semibold mb-4 text-text-heading-light dark:text-text-heading-dark">Évolution des symptômes</h3>
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                        <LineChart data={chartData}>
                            <CartesianGrid stroke={theme === 'dark' ? '#4A4A6A' : '#E5E7EB'} strokeDasharray="3 3" strokeOpacity={0.5}/>
                            <XAxis dataKey="name" fontSize={12} tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }} />
                            <YAxis domain={[0, 5]} tickCount={6} fontSize={12} tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }} />
                            <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#2C2C54' : '#FFFFFF', border: '1px solid #4A4A6A' }} />
                            <Legend wrapperStyle={{fontSize: "12px"}}/>
                            <Line type="monotone" dataKey="Humeur" stroke={chartColors.mood} strokeWidth={2} dot={{r: 4}} />
                            <Line type="monotone" dataKey="Douleur" stroke={chartColors.pain} strokeWidth={2} dot={{r: 4}} />
                            <Line type="monotone" dataKey="Flux" stroke={chartColors.flow} strokeWidth={2} dot={{r: 4}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SymptomsScreen;