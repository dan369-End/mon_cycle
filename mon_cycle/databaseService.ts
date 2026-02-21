
import supabase from './supabaseClient';
import { CycleSettings, PeriodEntry, SymptomLog, ActivityLog, User, FirebaseUser, AppNotification, Period } from './types';

const ensureProfileExists = async (uid: string, email?: string | null, name?: string | null) => {
  if (!uid) return;
  try {
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', uid).maybeSingle();
    
    if (!profile) {
      const finalEmail = email || `${uid.substring(0, 8)}@moncycle.app`;
      const finalName = name || 'Utilisatrice';
      
      await supabase.from('profiles').upsert({
        id: uid, 
        email: finalEmail, 
        name: finalName, 
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      
      await supabase.from('settings').upsert({ 
        user_id: uid, 
        cycle_length: 28, 
        period_length: 5 
      }, { onConflict: 'user_id' });
    }
  } catch (err) {
    console.error("Erreur lors de la vérification du profil:", err);
  }
};

export const onAuthChange = (callback: (user: FirebaseUser | null, userData: User | null) => void) => {
  const handleAuth = async (session: any) => {
    if (session?.user) {
      const fbUser: FirebaseUser = {
        uid: session.user.id,
        email: session.user.email ?? null,
        displayName: session.user.user_metadata?.name ?? null,
        photoURL: session.user.user_metadata?.photoURL ?? null,
        emailVerified: !!session.user.email_confirmed_at,
      };

      try {
        await ensureProfileExists(session.user.id, session.user.email, session.user.user_metadata?.name);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        
        callback(fbUser, { 
          name: profile?.name || session.user.user_metadata?.name || 'Utilisatrice', 
          email: profile?.email || session.user.email || '', 
          photoURL: profile?.photo_url || session.user.user_metadata?.photoURL || null 
        });
      } catch (e) {
        callback(fbUser, { 
          name: session.user.user_metadata?.name || 'Utilisatrice', 
          email: session.user.email || '' 
        });
      }
    } else {
      callback(null, null);
    }
  };

  // OnAuthStateChange gère à la fois la session initiale et les changements futurs
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    handleAuth(session);
  });

  // Appel initial pour garantir que l'état est synchronisé immédiatement
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) handleAuth(session);
  });

  return () => {
    if (subscription) subscription.unsubscribe();
  };
};

export const apiLogin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const apiSignup = async (userData: { name: string, email: string, password: string }) => {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: { 
        data: { name: userData.name }, 
        emailRedirectTo: window.location.origin 
    }
  });
  if (error) throw error;
  if (data.user) await ensureProfileExists(data.user.id, userData.email, userData.name);
  return data;
};

export const apiLogout = async () => { await supabase.auth.signOut(); };

export const subscribeToSettings = (uid: string, cb: (s: CycleSettings | null) => void) => {
  const fetchSettings = async () => {
    try {
        const { data } = await supabase.from('settings').select('*').eq('user_id', uid).maybeSingle();
        if (data) {
          const defH = { pill: { enabled: false, time: '08:00' }, vitamins: { enabled: false, time: '09:00' } };
          const defN = { 
            period: true, 
            ovulation: true, 
            custom: { 
              beforePeriod: { enabled: true, days: 2 }, 
              beforeOvulation: { enabled: true, days: 1 } 
            } 
          };

          cb({
            cycleLength: data.cycle_length ?? 28,
            periodLength: data.period_length ?? 5,
            isPregnancyMode: data.is_pregnancy_mode ?? false,
            isTryingToConceive: data.is_trying_to_conceive ?? false,
            isDiscreetMode: data.is_discreet_mode ?? false,
            healthReminders: {
                pill: { ...defH.pill, ...(data.health_reminders?.pill || {}) },
                vitamins: { ...defH.vitamins, ...(data.health_reminders?.vitamins || {}) }
            },
            security: { pinEnabled: false, pinCode: '' },
            notifications: {
                ...defN,
                ...(data.notifications_config || {}),
                custom: {
                    beforePeriod: { ...defN.custom.beforePeriod, ...(data.notifications_config?.custom?.beforePeriod || {}) },
                    beforeOvulation: { ...defN.custom.beforeOvulation, ...(data.notifications_config?.custom?.beforeOvulation || {}) }
                }
            }
          });
        }
    } catch (e) {
        console.error("Erreur settings:", e);
    }
  };
  fetchSettings();
  const channel = supabase.channel(`st_${uid}`).on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: `user_id=eq.${uid}` }, fetchSettings).subscribe();
  return () => { if (channel) supabase.removeChannel(channel); };
};

export const saveSettings = async (uid: string, settings: CycleSettings) => {
  const { error } = await supabase.from('settings').upsert({
    user_id: uid,
    cycle_length: settings.cycleLength,
    period_length: settings.periodLength,
    is_pregnancy_mode: settings.isPregnancyMode,
    is_trying_to_conceive: settings.isTryingToConceive,
    is_discreet_mode: settings.isDiscreetMode,
    health_reminders: settings.healthReminders,
    notifications_config: settings.notifications,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });
  if (error) throw error;
};

export const getPeriods = async (uid: string): Promise<Period[] | null> => {
  const { data, error } = await supabase.from('periods').select('*').eq('user_id', uid).order('start_date', { ascending: false });
  if (error) throw error;
  return data;
};

export const subscribeToPeriods = (uid: string, callback: (p: PeriodEntry[]) => void) => {
  const fetch = async () => {
    try {
        const data = await getPeriods(uid);
        if (data) callback(data.map(p => ({ id: p.id, startDate: p.start_date, endDate: p.end_date || undefined, notes: p.notes || undefined })));
    } catch (e) { console.error(e); }
  };
  fetch();
  const channel = supabase.channel(`pd_${uid}`).on('postgres_changes', { event: '*', schema: 'public', table: 'periods', filter: `user_id=eq.${uid}` }, fetch).subscribe();
  return () => { if (channel) supabase.removeChannel(channel); };
};

export const addPeriod = async (uid: string, date: Date) => {
  const dateStr = date.toISOString().split('T')[0];
  const { error } = await supabase.from('periods').upsert({ user_id: uid, start_date: dateStr }, { onConflict: 'user_id,start_date' });
  if (error) throw error;
};

export const removePeriod = async (uid: string, id: string) => {
  const { error } = await supabase.from('periods').delete().eq('id', id);
  if (error) throw error;
};

export const subscribeToSymptoms = (uid: string, cb: (s: SymptomLog[]) => void) => {
  const fetch = async () => {
    const { data } = await supabase.from('symptoms').select('*').eq('user_id', uid).order('date', { ascending: false });
    if (data) cb(data.map(s => ({ id: s.id, date: s.date, mood: s.mood, pain: s.pain, flow: s.flow, water_intake: s.water_intake })));
  };
  fetch();
  const channel = supabase.channel(`sy_${uid}`).on('postgres_changes', { event: '*', schema: 'public', table: 'symptoms', filter: `user_id=eq.${uid}` }, fetch).subscribe();
  return () => { if (channel) supabase.removeChannel(channel); };
};

export const saveSymptom = async (uid: string, log: Omit<SymptomLog, 'id'>) => {
  const dateStr = typeof log.date === 'string' ? log.date.split('T')[0] : new Date(log.date).toISOString().split('T')[0];
  const { error } = await supabase.from('symptoms').upsert({
    user_id: uid, date: dateStr, mood: log.mood, pain: log.pain, flow: log.flow, water_intake: log.waterIntake ?? 0
  }, { onConflict: 'user_id,date' });
  if (error) throw error;
};

export const subscribeToActivity = (uid: string, cb: (a: ActivityLog[]) => void) => {
    const fetch = async () => {
        const { data } = await supabase.from('activity').select('*').eq('user_id', uid).order('date', { ascending: false });
        if (data) cb(data.map(a => ({ id: a.id, date: a.date, note: a.note })));
    };
    fetch();
    const channel = supabase.channel(`ac_${uid}`).on('postgres_changes', { event: '*', schema: 'public', table: 'activity', filter: `user_id=eq.${uid}` }, fetch).subscribe();
    return () => { if (channel) supabase.removeChannel(channel); };
};

export const addActivity = async (uid: string, date: Date, note?: string) => {
    const { data, error } = await supabase.from('activity').insert({ user_id: uid, date: date.toISOString(), note }).select().single();
    if (error) throw error;
    return data;
};

export const removeActivity = async (uid: string, id: string) => {
    const { error } = await supabase.from('activity').delete().eq('id', id);
    if (error) throw error;
};

export const subscribeToAppNotifications = (uid: string, cb: (n: AppNotification[]) => void) => {
    const fetch = async () => {
        const { data } = await supabase.from('notifications').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        if (data) cb(data.map(n => ({ id: n.id, message: n.message, date: n.created_at, read: n.is_read })));
    };
    fetch();
    const channel = supabase.channel(`nt_${uid}`).on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, fetch).subscribe();
    return () => { if (channel) supabase.removeChannel(channel); };
};

export const addAppNotification = async (uid: string, message: string) => {
    await supabase.from('notifications').insert({ user_id: uid, message });
};

export const markNotificationsAsRead = async (uid: string, notifications: AppNotification[]) => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', uid).eq('is_read', false);
};

export const updateUserProfile = async (uid: string, data: { name?: string }) => {
  await supabase.from('profiles').update({ name: data.name, updated_at: new Date().toISOString() }).eq('id', uid);
};

export const deleteUserAccount = async (uid: string) => { await apiLogout(); };
