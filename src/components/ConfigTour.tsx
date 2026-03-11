'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Info } from 'lucide-react';

const TOUR_STEPS = [
    {
        target: 'custo-fixo-total',
        title: 'Custos Fixos Totais',
        content: 'Informe a soma de todas as suas despesas mensais (aluguel, luz, água, internet, etc). Isso é usado para calcular quanto custa cada minuto da sua barbearia aberta.'
    },
    {
        target: 'horas-diarias',
        title: 'Jornada de Trabalho',
        content: 'Quantas horas por dia você (ou seus profissionais) trabalham? Isso define a capacidade produtiva da sua barbearia.'
    },
    {
        target: 'perc-produtividade',
        title: 'Produtividade (%)',
        content: 'Nem todo o tempo é produtivo (limpeza, atrasos, vácuos na agenda). Recomendamos deixar entre 70% e 90% para um cálculo mais seguro.'
    },
    {
        target: 'perc-comissoes',
        title: 'Comissões sobre Serviço',
        content: 'Qual a porcentagem média que você paga aos profissionais? Se você for o único e quiser retirar um lucro total, coloque 0% aqui e defina no seu Lucro Desejado.'
    },
    {
        target: 'perc-lucro-desejado',
        title: 'Lucro Desejado',
        content: 'Quanto você quer ganhar líquido sobre o serviço after pagar tudo? Para barbearias, margens saudáveis ficam entre 30% e 50%.'
    }
];

export default function ConfigTour() {
    const [activeStep, setActiveStep] = useState<number | null>(null);
    const [hasSeenTour, setHasSeenTour] = useState(true);

    useEffect(() => {
        const seen = localStorage.getItem('seen_config_tour');
        if (!seen) {
            setHasSeenTour(false);
        }
    }, []);

    if (hasSeenTour && activeStep === null) return null;

    const currentStep = TOUR_STEPS[activeStep || 0];

    function handleNext() {
        if (activeStep === null) setActiveStep(0);
        else if (activeStep < TOUR_STEPS.length - 1) setActiveStep(activeStep + 1);
        else handleClose();
    }

    function handleClose() {
        setActiveStep(null);
        setHasSeenTour(true);
        localStorage.setItem('seen_config_tour', 'true');
    }

    return (
        <div className="tour-overlay">
            {!hasSeenTour && activeStep === null && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="tour-welcome card glass">
                    <Info className="text-amber" size={32} />
                    <h3>Bem-vindo às Configurações!</h3>
                    <p>Gostaria de um tour rápido para entender o que preencher em cada campo?</p>
                    <div className="tour-actions">
                        <button className="btn btn-ghost" onClick={handleClose}>Pular</button>
                        <button className="btn btn-primary" onClick={() => setActiveStep(0)}>Iniciar Tour</button>
                    </div>
                </motion.div>
            )}

            {activeStep !== null && (
                <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="tour-popup card glass"
                >
                    <div className="tour-header">
                        <span className="step-indicator">Passo {activeStep + 1} de {TOUR_STEPS.length}</span>
                        <button onClick={handleClose} className="close-btn"><X size={18} /></button>
                    </div>
                    <h4>{currentStep.title}</h4>
                    <p>{currentStep.content}</p>
                    <div className="tour-footer">
                        <button
                            className="btn btn-mini btn-ghost"
                            onClick={() => activeStep > 0 && setActiveStep(activeStep - 1)}
                            disabled={activeStep === 0}
                        >
                            <ChevronLeft size={16} /> Voltar
                        </button>
                        <button className="btn btn-mini btn-primary" onClick={handleNext}>
                            {activeStep === TOUR_STEPS.length - 1 ? 'Finalizar' : 'Próximo'} <ChevronRight size={16} />
                        </button>
                    </div>
                </motion.div>
            )}

            <style jsx>{`
            .tour-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.6);
                backdrop-filter: blur(4px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
            }
            .tour-welcome {
                max-width: 400px;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
                padding: 32px;
                border: 1px solid var(--amber-dim) !important;
            }
            .tour-actions { display: flex; gap: 12px; margin-top: 8px; }
            
            .tour-popup {
                max-width: 320px;
                padding: 24px;
                border: 1px solid var(--amber) !important;
                box-shadow: 0 0 30px rgba(212, 175, 55, 0.2);
            }
            .tour-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
            .step-indicator { font-size: 0.65rem; font-weight: 800; color: var(--text-disabled); text-transform: uppercase; }
            .close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; }
            
            h3 { font-size: 1.25rem; font-weight: 900; color: var(--text-primary); }
            h4 { font-size: 1rem; font-weight: 800; color: var(--amber); margin-bottom: 8px; }
            p { font-size: 0.9rem; line-height: 1.5; color: var(--text-secondary); margin-bottom: 20px; }
            
            .tour-footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
            .btn-mini { padding: 8px 12px; font-size: 0.75rem; }
            
            :global(.btn:disabled) { opacity: 0.5; cursor: not-allowed; }
        `}</style>
        </div>
    );
}
