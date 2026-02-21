
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon, UserCircleIcon } from '../components/Icons';
import { useAppContext } from '../App';
// Fix: Re-typing date-fns imports and handling missing parseISO natively
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const AssistantScreen: React.FC = () => {
    const { settings, lastPeriod, nextPeriodDate, ovulationDate, symptomHistory } = useAppContext();
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: "Bonjour ! Je suis Lynda, votre assistante santé dédiée. Je connais vos réglages actuels et je peux vous aider à comprendre votre cycle ou votre grossesse. Comment puis-je vous aider ?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userText = input;
        setMessages(prev => [...prev, { sender: 'user', text: userText }]);
        setInput('');
        setIsLoading(true);

        // Contexte local sécurisé incluant les modes
        let context = "CONTEXTE UTILISATRICE :\n";
        context += `- Mode actuel : ${settings.isPregnancyMode ? 'GROSSESSE' : settings.isTryingToConceive ? 'ESSAI BÉBÉ' : 'SUIVI CLASSIQUE'}\n`;
        context += `- Mode Discret : ${settings.isDiscreetMode ? 'OUI' : 'NON'}\n`;
        context += `- Cycle moyen : ${settings.cycleLength} jours, Durée des règles : ${settings.periodLength} jours\n`;
        // Fix: parseISO replacement
        if (lastPeriod) context += `- Dernier début des règles : ${format(new Date(lastPeriod.startDate), 'd MMMM yyyy', { locale: fr })}\n`;
        if (nextPeriodDate) context += `- Prochaines règles estimées : ${format(nextPeriodDate, 'd MMMM yyyy', { locale: fr })}\n`;
        if (ovulationDate) context += `- Date d'ovulation prévue : ${format(ovulationDate, 'd MMMM yyyy', { locale: fr })}\n`;
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `${context}\nQuestion de l'utilisatrice: ${userText}`,
                config: {
                    systemInstruction: "Tu es Lynda, une assistante experte en santé féminine. \nREGLÉS STRICTES :\n1. Présente-toi comme 'Lynda'.\n2. Si l'utilisatrice est en MODE GROSSESSE, adapte tes conseils au suivi prénatal et au bien-être de la femme enceinte.\n3. Si elle est en MODE ESSAI BÉBÉ, focalise sur la fenêtre fertile et l'optimisation des chances de conception.\n4. Si le MODE DISCRET est activé, évite les termes trop crus et utilise un langage codé subtil si nécessaire.\n5. Réponds EXCLUSIVEMENT à la santé féminine et au cycle.\n6. DISCLAIMER OBLIGATOIRE : 'Consultez un professionnel de santé pour tout diagnostic médical.'"
                }
            });

            const aiText = response.text || "Je suis désolée, je n'ai pas pu analyser votre demande.";
            setMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
        } catch (err) {
            setMessages(prev => [...prev, { sender: 'ai', text: "Désolée, une erreur technique empêche Lynda de répondre. Vérifiez votre connexion." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-primary-bg-dark rounded-2xl shadow-inner">
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start max-w-[85%] gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'ai' ? 'bg-accent-light/20' : 'bg-gray-100'}`}>
                                {msg.sender === 'ai' ? <SparklesIcon className="w-5 h-5 text-accent-light" /> : <UserCircleIcon className="w-5 h-5 text-gray-500" />}
                            </div>
                            <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-accent-light text-white rounded-tr-none' : 'bg-gray-100 dark:bg-card-bg-dark text-text-body-light dark:text-text-body-dark rounded-tl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-gray-100 dark:bg-card-bg-dark p-3 rounded-2xl text-xs text-text-muted-light">Lynda réfléchit...</div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>
            
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2 items-center">
                <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Posez une question à Lynda..."
                    className="flex-grow bg-gray-50 dark:bg-card-bg-dark p-3 rounded-full text-sm outline-none border border-transparent focus:border-accent-light transition"
                />
                <button type="submit" disabled={isLoading} className="bg-accent-light text-white p-3 rounded-full shadow-md hover:scale-110 active:scale-95 transition disabled:opacity-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
            </form>
        </div>
    );
};

export default AssistantScreen;