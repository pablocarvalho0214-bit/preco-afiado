'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle, Send } from 'lucide-react';
import { salvarFeedback, getUsuarioAtual } from '../lib/storage';

interface FeedbackModalProps {
    onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
    const [step, setStep] = useState(1);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [answers, setAnswers] = useState({
        q1: '', // O app ajudou com os custos?
        q2: '', // Interface fácil?
        q3: '', // Recomendaria?
        q4: '', // Chatbot útil?
        q5: ''  // Comentário livre
    });
    const [submitting, setSubmitting] = useState(false);
    const [enviado, setEnviado] = useState(false);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const user = await getUsuarioAtual();
            if (!user) return;

            await salvarFeedback({
                userId: user.id,
                rating,
                q1: answers.q1,
                q2: answers.q2,
                q3: answers.q3,
                q4: answers.q4,
                q5: answers.q5
            });
            setEnviado(true);
            setTimeout(onClose, 3000);
        } catch (error) {
            console.error('Erro ao enviar feedback:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const questions = [
        { id: 'q1', text: 'O aplicativo ajudou você a entender melhor seus custos?', options: ['Sim', 'Não', 'Mais ou menos'] },
        { id: 'q2', text: 'A interface é fácil de usar?', options: ['Sim', 'Não', 'Pode melhorar'] },
        { id: 'q3', text: 'Você recomendaria o Preço Afiado para outros profissionais?', options: ['Sim', 'Talvez', 'Não'] },
        { id: 'q4', text: 'O chatbot de ajuda foi útil para tirar suas dúvidas?', options: ['Sim', 'Não usei', 'Não foi útil'] },
    ];

    if (enviado) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full"
                >
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600 dark:text-green-400" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Obrigado!</h2>
                    <p className="text-zinc-600 dark:text-zinc-400">Seu feedback é fundamental para evoluirmos o Preço Afiado.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8">
                        {step === 1 && (
                            <div className="text-center">
                                <h2 className="text-2xl font-bold mb-6">Como está sua experiência?</h2>
                                <div className="flex justify-center gap-2 mb-8">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            onMouseEnter={() => setHoverRating(s)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(s)}
                                            className="transition-transform active:scale-90"
                                        >
                                            <Star
                                                size={40}
                                                className={`transition-colors ${(hoverRating || rating) >= s ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <button
                                    disabled={rating === 0}
                                    onClick={handleNext}
                                    className="btn btn-primary w-full py-4 text-lg"
                                >
                                    Continuar
                                </button>
                            </div>
                        )}

                        {step >= 2 && step <= 5 && (
                            <div>
                                <div className="mb-6">
                                    <span className="text-sm font-medium text-amber-500 mb-1 block">Pergunta {step - 1} de 5</span>
                                    <h3 className="text-xl font-bold text-zinc-800 dark:text-white leading-tight">
                                        {questions[step - 2].text}
                                    </h3>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {questions[step - 2].options.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                setAnswers({ ...answers, [questions[step - 2].id]: opt });
                                                handleNext();
                                            }}
                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all font-medium ${answers[questions[step - 2].id as keyof typeof answers] === opt
                                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400'
                                                    : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center">
                                    <button onClick={handleBack} className="text-zinc-500 font-medium">Voltar</button>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className={`h-1.5 rounded-full transition-all ${step - 1 === i ? 'w-6 bg-amber-500' : 'w-2 bg-zinc-200 dark:bg-zinc-800'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-zinc-800 dark:text-white mb-2">
                                        Algo mais que gostaria de nos dizer?
                                    </h3>
                                    <p className="text-zinc-500 text-sm">Sua opinião ajuda a moldar o futuro do app.</p>
                                </div>

                                <textarea
                                    className="w-full h-32 p-4 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 bg-transparent mb-6 focus:border-amber-500 outline-none resize-none transition-colors"
                                    placeholder="Sugestões, críticas ou elogios..."
                                    value={answers.q5}
                                    onChange={(e) => setAnswers({ ...answers, q5: e.target.value })}
                                />

                                <div className="flex gap-4">
                                    <button onClick={handleBack} className="px-6 py-4 font-bold text-zinc-500">Voltar</button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="btn btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-2"
                                    >
                                        {submitting ? 'Enviando...' : (
                                            <>
                                                Enviar Feedback <Send size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
