
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface User {
  name: string;
  email: string;
  photoURL?: string;
}

export interface CycleSettings {
  cycleLength: number;
  periodLength: number;
  isPregnancyMode: boolean;
  isTryingToConceive: boolean; 
  isDiscreetMode: boolean;
  healthReminders: {
    pill: { enabled: boolean; time: string };
    vitamins: { enabled: boolean; time: string };
  };
  security: {
    pinEnabled: boolean;
    pinCode: string;
  };
  notifications: {
    period: boolean;
    ovulation: boolean;
    custom: {
      beforePeriod: { enabled: boolean; days: number };
      beforeOvulation: { enabled: boolean; days: number };
    };
  };
}

export interface PeriodEntry {
  id: string;
  startDate: string; 
  endDate?: string;
  notes?: string;
  created_at?: string;
}

export interface Period {
  id: string;
  user_id: string;
  start_date: string;
  end_date?: string | null;
  notes?: string | null;
  created_at: string;
}

export type Mood = 'heureuse' | 'energique' | 'calme' | 'irritable' | 'triste';
export type Pain = 'aucune' | 'légère' | 'modérée' | 'forte';
export type Flow = 'aucune' | 'léger' | 'moyen' | 'abondant';

export interface SymptomLog {
  id: string;
  date: string; 
  mood: Mood;
  pain: Pain;
  flow: Flow;
  waterIntake?: number; 
}

export interface ActivityLog {
  id:string;
  date: string; 
  note?: string;
}

export enum DayType {
  Period,
  PredictedPeriod,
  Fertile,
  Ovulation,
  Safe,
  EndCycle, // Nouvelle phase : Fin de cycle / SPM
}

export interface Notification {
  id: string;
  message: string;
  onUndo?: () => void;
}

export interface AppNotification {
  id: string;
  message: string;
  date: string; 
  read: boolean;
}

export interface AppContextType {
  settings: CycleSettings;
  setSettings: (settings: CycleSettings) => void;
  periodHistory: PeriodEntry[];
  addPeriodEntry: (date: Date) => void;
  updatePeriodEntry: (id: string, endDate: Date) => void;
  removePeriodEntry: (id: string) => void;
  symptomHistory: SymptomLog[];
  addSymptomLog: (log: Omit<SymptomLog, 'id'>) => void;
  updateWaterIntake: (date: Date, glasses: number) => void;
  activityHistory: ActivityLog[];
  addActivityLog: (date: Date, note?: string) => void;
  removeActivityLog: (entry: ActivityLog | string) => void;
  isPregnancyMode: boolean;
  togglePregnancyMode: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  lastPeriod: PeriodEntry | null;
  nextPeriodDate: Date | null;
  nextPeriodWindow: { start: Date; end: Date } | null;
  ovulationDate: Date | null;
  fertileWindow: { start: Date, end: Date } | null;
  currentPeriodInfo: { start: Date, end: Date } | null;
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  signup: (userData: { name: string, email: string, password: string, photo?: File | null }) => Promise<any>;
  logout: () => void;
  updateUser: (name: string, photo?: File | null) => Promise<void>;
  deleteAccount: () => Promise<void>;
  predictionAccuracy: number;
  toastNotifications: Notification[];
  addToastNotification: (notification: Omit<Notification, 'id'>) => void;
  removeToastNotification: (id: string) => void;
  appNotifications: AppNotification[];
  markNotificationsAsRead: () => void;
}
