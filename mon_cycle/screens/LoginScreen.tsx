
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { AppLogo } from '../components/Logo';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, LoadingSpinner } from '../components/Icons';

const LoginScreen: React.FC = () => {
    const { login } = useAppContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message || "Erreur de connexion PostgreSQL.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-primary-bg-light dark:bg-primary-bg-dark p-4 overflow-hidden">
            <div className="w-full max-w-sm mx-auto relative">
                {isLoading && (
                    <div className="absolute -top-4 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden z-20">
                        <div className="h-full bg-accent-light dark:bg-accent-dark animate-[progress_1.5s_infinite_linear]" style={{width: '30%'}}></div>
                    </div>
                )}
                
                <div className="flex flex-col items-center mb-10 animate-fade-in">
                    <AppLogo className={`w-24 h-24 transition-transform duration-700 ${isLoading ? 'scale-90 opacity-50' : ''}`} />
                    <h1 className="text-3xl font-bold text-text-heading-light dark:text-text-heading-dark mt-4">Mon Cycle</h1>
                    <p className="text-text-body-light dark:text-text-body-dark opacity-70">Accès sécurisé Supabase</p>
                </div>
                
                <div className={`bg-card-bg-light dark:bg-card-bg-dark p-8 rounded-3xl shadow-2xl transition-all duration-300 ${isLoading ? 'opacity-70 scale-[0.98]' : 'animate-fade-in'}`}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && <div className="text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20"><p className="text-red-500 text-xs font-bold">{error}</p></div>}
                        
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted-light uppercase ml-2">Email</label>
                            <div className="relative">
                                <EnvelopeIcon className="w-5 h-5 absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="nom@exemple.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 focus:border-accent-light dark:focus:border-accent-dark text-black dark:text-white font-medium rounded-2xl outline-none transition disabled:cursor-not-allowed shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted-light uppercase ml-2">Mot de passe</label>
                            <div className="relative">
                                <LockClosedIcon className="w-5 h-5 absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 focus:border-accent-light dark:focus:border-accent-dark text-black dark:text-white font-medium rounded-2xl outline-none transition disabled:cursor-not-allowed shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400"
                                >
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full h-14 flex items-center justify-center bg-accent-light text-white font-bold rounded-2xl shadow-lg hover:shadow-accent-light/30 transition-all active:scale-95 disabled:bg-gray-400 dark:bg-accent-dark"
                        >
                            {isLoading ? <LoadingSpinner className="w-6 h-6" /> : 'Se connecter'}
                        </button>
                    </form>
                    
                    <p className="text-center text-sm text-text-body-light dark:text-text-body-dark mt-8 opacity-80">
                        Nouveau ici ?{' '}
                        <Link to="/signup" className="font-bold text-accent-light dark:text-accent-dark hover:underline">Créer un compte</Link>
                    </p>
                </div>
            </div>
            
            <style>{`
                @keyframes progress {
                    0% { left: -30%; width: 30%; }
                    100% { left: 100%; width: 30%; }
                }
            `}</style>
        </div>
    );
};

export default LoginScreen;
