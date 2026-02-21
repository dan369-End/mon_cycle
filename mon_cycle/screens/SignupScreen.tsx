
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { AppLogo } from '../components/Logo';
import { UserCircleIcon, EnvelopeIcon, LockClosedIcon, PlusIcon, LoadingSpinner, EyeIcon, EyeSlashIcon } from '../components/Icons';

const SignupScreen: React.FC = () => {
    const { signup } = useAppContext();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (password.length < 6) {
            setError("Le mot de passe doit faire au moins 6 caractères.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await signup({ name, email, password, photo });
            
            // Si Supabase renvoie une session, l'utilisateur est déjà connecté (auto-confirmé)
            if (result.session) {
                navigate('/');
            } else if (result.user) {
                // Si pas de session, l'email de confirmation est requis
                navigate('/verify-email', { state: { email } });
            } else {
                throw new Error("Réponse inattendue du serveur.");
            }
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'inscription.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-primary-bg-light dark:bg-primary-bg-dark p-4">
            <div className="w-full max-w-sm mx-auto relative">
                {isLoading && (
                    <div className="absolute -top-4 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden z-20">
                        <div className="h-full bg-accent-light dark:bg-accent-dark animate-[progress_1.5s_infinite_linear]" style={{width: '30%'}}></div>
                    </div>
                )}

                <div className="flex flex-col items-center mb-8 animate-fade-in">
                    <AppLogo className={`w-20 h-20 transition-transform ${isLoading ? 'scale-90' : ''}`} />
                    <h1 className="text-2xl font-bold text-text-heading-light dark:text-text-heading-dark mt-2">Rejoindre Mon Cycle</h1>
                </div>

                <div className={`bg-card-bg-light dark:bg-card-bg-dark p-8 rounded-3xl shadow-2xl transition-all duration-300 ${isLoading ? 'opacity-70' : 'animate-fade-in'}`}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg border border-red-200">{error}</p>}
                        
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-card-bg-dark shadow-lg">
                                    {photoPreview ? <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" /> : <UserCircleIcon className="w-12 h-12 text-gray-300" />}
                                </div>
                                <label htmlFor="photo-upload" className="absolute bottom-0 right-0 w-8 h-8 bg-accent-light text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-110 transition-transform">
                                    <PlusIcon className="w-5 h-5" />
                                </label>
                                <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={isLoading} />
                            </div>
                        </div>

                        <div className="relative">
                            <UserCircleIcon className="w-5 h-5 absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Nom complet"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isLoading}
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 focus:border-accent-light text-black dark:text-white font-medium rounded-2xl outline-none transition disabled:opacity-50 shadow-sm"
                            />
                        </div>

                        <div className="relative">
                            <EnvelopeIcon className="w-5 h-5 absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 focus:border-accent-light text-black dark:text-white font-medium rounded-2xl outline-none transition disabled:opacity-50 shadow-sm"
                            />
                        </div>

                        <div className="relative">
                            <LockClosedIcon className="w-5 h-5 absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 focus:border-accent-light text-black dark:text-white font-medium rounded-2xl outline-none transition disabled:opacity-50 shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full h-14 flex items-center justify-center bg-accent-light text-white font-bold rounded-2xl shadow-lg hover:shadow-accent-light/30 transition-all active:scale-95 disabled:bg-gray-400 dark:bg-accent-dark mt-2"
                        >
                            {isLoading ? <LoadingSpinner className="w-6 h-6" /> : "S'inscrire"}
                        </button>
                    </form>
                    
                    <p className="text-center text-sm text-text-body-light dark:text-text-body-dark mt-6 opacity-80">
                        Déjà un compte ?{' '}
                        <Link to="/login" className="font-bold text-accent-light dark:text-accent-dark hover:underline">Se connecter</Link>
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

export default SignupScreen;
