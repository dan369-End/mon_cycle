
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppLogo } from '../components/Logo';
import { EnvelopeIcon, ArrowRightOnRectangleIcon } from '../components/Icons';

const EmailVerificationScreen: React.FC = () => {
    const location = useLocation();
    const email = location.state?.email || "votre adresse email";

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-primary-bg-light dark:bg-primary-bg-dark p-4">
            <div className="w-full max-w-sm mx-auto text-center">
                <div className="flex flex-col items-center mb-8 animate-fade-in">
                    <AppLogo className="w-24 h-24" />
                    <h1 className="text-2xl font-bold text-text-heading-light dark:text-text-heading-dark mt-4">Vérifiez votre email</h1>
                </div>

                <div className="bg-card-bg-light dark:bg-card-bg-dark p-8 rounded-3xl shadow-xl animate-fade-in" style={{animationDelay: '100ms'}}>
                    <div className="w-20 h-20 bg-accent-light/10 dark:bg-accent-dark/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <EnvelopeIcon className="w-10 h-10 text-accent-light dark:text-accent-dark" />
                    </div>
                    
                    <h2 className="text-lg font-bold text-text-heading-light dark:text-text-heading-dark mb-2">Presque terminé !</h2>
                    
                    <p className="text-text-body-light dark:text-text-body-dark mb-6">
                        Un lien de confirmation a été envoyé à :<br/>
                        <span className="font-bold text-accent-light break-all">{email}</span>
                    </p>
                    
                    <div className="text-left space-y-4 mb-8">
                        <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-1">1</div>
                            <p className="text-xs text-text-muted-light">Ouvrez le mail et cliquez sur le lien.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-1">2</div>
                            <p className="text-xs text-text-muted-light">Vous serez redirigée automatiquement vers l'application.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-1">3</div>
                            <p className="text-xs text-text-muted-light">Si la page ne s'actualise pas, cliquez sur le bouton ci-dessous.</p>
                        </div>
                    </div>

                    <Link to="/login" className="flex items-center justify-center w-full py-4 bg-accent-light text-white font-bold rounded-2xl shadow-lg hover:bg-accent-hover-light transition-all dark:bg-accent-dark dark:hover:bg-accent-hover-dark transform hover:scale-[1.02] active:scale-95">
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                        Retour à la connexion
                    </Link>
                </div>
                
                <p className="mt-8 text-xs text-text-muted-light">
                    Vous ne trouvez pas le mail ? Vérifiez vos spams ou réessayez l'inscription.
                </p>
            </div>
        </div>
    );
};

export default EmailVerificationScreen;
