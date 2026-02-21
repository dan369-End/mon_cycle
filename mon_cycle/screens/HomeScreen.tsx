
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { differenceInDays, format, isSameDay, isBefore, addDays, differenceInWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DropIcon, ClockIcon, SparklesIcon, ShieldCheckIcon, LightBulbIcon, CalendarIcon, HeartIcon, ChatBubbleLeftRightIcon, SettingsIcon } from '../components/Icons';
import { getPersonalizedAdvice, CyclePhase } from '../utils/advice';

const HomeScreen: React.FC = () => {
  const { lastPeriod, nextPeriodDate, ovulationDate, settings, symptomHistory, updateWaterIntake } = useAppContext();
  const navigate = useNavigate();
  const today = new Date(new Date().setHours(0, 0, 0, 0));

  const todayWater = useMemo(() => {
    const log = symptomHistory.find(s => isSameDay(new Date(s.date), today));
    return log?.waterIntake || 0;
  }, [symptomHistory, today]);

  const pregnancyData = useMemo(() => {
    if (!settings.isPregnancyMode || !lastPeriod) return null;
    const start = new Date(lastPeriod.startDate);
    const weeks = differenceInWeeks(today, start);
    const fruit = weeks < 4 ? "Graine de pavot" : weeks < 8 ? "Framboise" : weeks < 12 ? "Citron" : weeks < 16 ? "Avocat" : "Mangue";
    return { weeks, fruit };
  }, [settings.isPregnancyMode, lastPeriod, today]);

  const cycleInfo = useMemo(() => {
    if (!lastPeriod || settings.isPregnancyMode) return null;
    const start = new Date(new Date(lastPeriod.startDate).setHours(0, 0, 0, 0));
    const dayOfCycle = differenceInDays(today, start) + 1;
    
    let phase = settings.isDiscreetMode ? "Phase A" : "Règles";
    let phaseKey = CyclePhase.Menstrual;
    let color = "#F472B6"; 
    
    if (dayOfCycle > settings.periodLength) {
        if (ovulationDate && isSameDay(today, ovulationDate)) {
            phase = settings.isDiscreetMode ? "Pic" : "Ovulation";
            phaseKey = CyclePhase.Ovulation;
            color = "#EF4444"; 
        } else if (ovulationDate && isBefore(today, ovulationDate)) {
            phase = settings.isDiscreetMode ? "Phase B" : "Phase Folliculaire";
            phaseKey = CyclePhase.Follicular;
            color = "#60A5FA"; 
        } else {
            phase = settings.isDiscreetMode ? "Phase C" : "Phase Lutéale";
            phaseKey = CyclePhase.Luteal;
            color = "#9370DB"; 
        }
    }

    const progress = Math.min((dayOfCycle / settings.cycleLength) * 100, 100);
    return { dayOfCycle, phase, phaseKey, color, progress };
  }, [lastPeriod, settings, today, ovulationDate]);

  const lyndaAdvice = useMemo(() => {
      if (settings.isPregnancyMode) return { wellness: "Félicitations ! Pensez à bien vous hydrater et à prendre vos vitamines prénatales." };
      if (!cycleInfo) return null;
      const todayLog = symptomHistory.find(s => isSameDay(new Date(s.date), today));
      return getPersonalizedAdvice(cycleInfo.phaseKey, todayLog);
  }, [cycleInfo, symptomHistory, today, settings.isPregnancyMode]);

  const handleWaterClick = (glasses: number) => {
    updateWaterIntake(today, glasses);
  };

  if (!lastPeriod && !settings.isPregnancyMode) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 text-center p-6 animate-fade-in">
        <div className="w-24 h-24 bg-accent-light/10 rounded-full flex items-center justify-center">
            <DropIcon className="w-12 h-12 text-accent-light animate-bounce" />
        </div>
        <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-heading-light dark:text-text-heading-dark">Bienvenue sur Mon Cycle</h1>
            <p className="text-sm text-text-muted-light max-w-[280px]">
                Pour que Lynda puisse vous conseiller, commencez par configurer votre cycle habituel et enregistrer vos dernières règles.
            </p>
        </div>
        
        <div className="w-full space-y-3">
            <button onClick={() => navigate('/settings')} className="w-full flex items-center justify-center px-8 py-4 bg-white dark:bg-card-bg-dark text-accent-light rounded-2xl shadow-md border border-accent-light/20 font-bold">
                <SettingsIcon className="w-5 h-5 mr-3" /> Configurer mon cycle
            </button>
            <button onClick={() => navigate('/calendar')} className="w-full flex items-center justify-center px-8 py-4 bg-accent-light text-white rounded-2xl shadow-lg font-bold">
                <CalendarIcon className="w-5 h-5 mr-3" /> Noter mes dernières règles
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6 animate-fade-in">
      <div className="relative flex flex-col items-center justify-center py-6 bg-white dark:bg-card-bg-dark rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800">
          {settings.isPregnancyMode && pregnancyData ? (
              <div className="text-center animate-zoom-in py-4">
                  <div className="w-40 h-40 bg-pink-50 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-pink-200">
                      <HeartIcon className="w-16 h-16 text-pink-500 animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-black text-text-heading-light dark:text-text-heading-dark">Semaine {pregnancyData.weeks}</h2>
                  <p className="text-sm text-accent-light font-bold">Bébé a la taille d'une {pregnancyData.fruit}</p>
              </div>
          ) : cycleInfo && (
              <>
                  <svg className="w-72 h-72 transform -rotate-90">
                      <circle cx="144" cy="144" r="100" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-gray-800/50" />
                      <circle 
                        cx="144" 
                        cy="144" 
                        r="100" 
                        stroke={cycleInfo.color} 
                        strokeWidth="14" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 100} 
                        style={{ 
                            strokeDashoffset: (2 * Math.PI * 100) - (cycleInfo.progress / 100) * (2 * Math.PI * 100), 
                            transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease' 
                        }} 
                        strokeLinecap="round" 
                      />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1" style={{ color: cycleInfo.color }}>
                        {cycleInfo.phase}
                      </span>
                      <div className="flex flex-col items-center mb-1">
                          <span className="text-5xl font-black text-text-heading-light dark:text-text-heading-dark">
                            Jour {cycleInfo.dayOfCycle}
                          </span>
                      </div>
                      <span className="text-sm text-text-muted-light font-bold capitalize">
                        {format(today, 'd MMMM', { locale: fr })}
                      </span>
                  </div>
              </>
          )}
      </div>

      <div className="bg-gradient-to-r from-accent-light/10 to-pink-500/10 dark:from-accent-dark/10 dark:to-pink-400/10 p-5 rounded-3xl border border-accent-light/20 flex flex-col space-y-3">
        <div className="flex items-start space-x-4">
            <div className="p-3 bg-white dark:bg-card-bg-dark rounded-2xl shadow-sm"><SparklesIcon className="w-6 h-6 text-accent-light animate-pulse" /></div>
            <div className="flex-1">
                <h3 className="font-bold text-sm text-accent-light">Conseil de Lynda</h3>
                <p className="text-xs text-text-body-light dark:text-text-body-dark mt-1 leading-relaxed">{lyndaAdvice?.wellness}</p>
            </div>
        </div>
        <button 
            onClick={() => navigate('/assistant')}
            className="w-full py-2 px-4 bg-white/50 dark:bg-card-bg-dark/50 hover:bg-white dark:hover:bg-card-bg-dark rounded-xl border border-accent-light/10 flex items-center justify-center text-xs font-bold text-accent-light transition-all"
        >
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
            Demander conseil à Lynda
        </button>
      </div>

      {!settings.isPregnancyMode && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card-bg-light dark:bg-card-bg-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center space-x-3">
                <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg"><DropIcon className="w-6 h-6 text-period-light" /></div>
                <div>
                    <p className="text-[10px] text-text-muted-light uppercase font-bold">{settings.isDiscreetMode ? "Prochain A" : "Prochaines règles"}</p>
                    <p className="font-bold text-sm">{nextPeriodDate ? format(nextPeriodDate, 'd MMM', { locale: fr }) : '-'}</p>
                </div>
            </div>
            <div className="bg-card-bg-light dark:bg-card-bg-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center space-x-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg"><SparklesIcon className="w-6 h-6 text-accent-light" /></div>
                <div>
                    <p className="text-[10px] text-text-muted-light uppercase font-bold">{settings.isTryingToConceive ? "Chance Max" : (settings.isDiscreetMode ? "Pic" : "Ovulation")}</p>
                    <p className="font-bold text-sm">{ovulationDate ? format(ovulationDate, 'd MMM', { locale: fr }) : '-'}</p>
                </div>
            </div>
          </div>
      )}

      <div className="bg-card-bg-light dark:bg-card-bg-dark p-5 rounded-3xl shadow-md border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-text-heading-light dark:text-text-heading-dark uppercase">Hydratation</h3>
            <span className="text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-full font-bold">{todayWater}/8 verres</span>
        </div>
        <div className="flex justify-between items-center px-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <button key={i} onClick={() => handleWaterClick(i)} className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${i <= todayWater ? 'bg-blue-500 text-white scale-110 shadow-lg -translate-y-1' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-300'}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" /></svg>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
