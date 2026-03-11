'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface TourStep {
    targetId: string;
    title: string;
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    href?: string; // navegar antes de mostrar esse passo
}

const TOUR_STEPS: TourStep[] = [
    {
        targetId: 'tour-hero-banner',
        title: '👋 Bem-vindo ao Preço Afiado!',
        text: 'Aqui é sua central de comando. Clique neste banner para criar uma nova precificação a qualquer momento.',
        position: 'bottom',
    },
    {
        targetId: 'tour-quick-ajustes',
        title: '⚙️ Configure antes de calcular',
        text: 'Em Ajustes, você informa seu custo fixo mensal (aluguel, luz, salários) e suas margens (impostos, comissões, lucro desejado). Esses dados alimentam todos os cálculos.',
        position: 'bottom',
    },
    {
        targetId: 'tour-quick-produtos',
        title: '🧴 Cadastre seus produtos',
        text: 'Informe os insumos que você usa em cada serviço (óleos, cremes, shampoos). O sistema calcula automaticamente o custo por uso.',
        position: 'bottom',
    },
    {
        targetId: 'tour-stat-total',
        title: '📈 Acompanhe sua evolução',
        text: 'Aqui você vê quantas precificações já criou e seu ticket médio. Quanto mais serviços você precificar, mais controle você terá do seu negócio.',
        position: 'bottom',
    },
    {
        targetId: 'tour-recent-section',
        title: '📋 Histórico de Precificações',
        text: 'Seus últimos cálculos ficam aqui para consulta rápida. Você pode editar ou excluir qualquer precificação a qualquer momento. Pronto para começar!',
        position: 'top',
    },
];

const TOUR_KEY = 'precafiado_tour_visto';

interface Props {
    forceShow?: boolean;
    onClose?: () => void;
}

export default function OnboardingTour({ forceShow, onClose }: Props) {
    const [active, setActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const router = useRouter();

    const step = TOUR_STEPS[currentStep];

    const updateRect = useCallback(() => {
        if (!step) return;
        const el = document.getElementById(step.targetId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => setRect(el.getBoundingClientRect()), 300);
        } else {
            setRect(null);
        }
    }, [step]);

    useEffect(() => {
        if (!active) return;
        updateRect();
        window.addEventListener('resize', updateRect);
        return () => window.removeEventListener('resize', updateRect);
    }, [active, currentStep, updateRect]);

    useEffect(() => {
        const visto = localStorage.getItem(TOUR_KEY);
        if (forceShow || !visto) {
            setTimeout(() => setActive(true), 800);
        }
    }, [forceShow]);

    function fechar() {
        setActive(false);
        localStorage.setItem(TOUR_KEY, '1');
        onClose?.();
    }

    function avancar() {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(s => s + 1);
        } else {
            fechar();
        }
    }

    function voltar() {
        if (currentStep > 0) setCurrentStep(s => s - 1);
    }

    if (!active || !step) return null;

    const PAD = 8;
    const spotStyle = rect ? {
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
    } : null;

    // Tooltip position relative to spotlight
    const tooltipTop = rect
        ? (step.position === 'top' ? rect.top - PAD - 160 : rect.bottom + PAD + 16)
        : '50%';
    const tooltipLeft = rect
        ? Math.min(Math.max(rect.left, 12), window.innerWidth - 316)
        : '50%';

    return (
        <>
            {/* Overlay escuro com buraco */}
            <div className="tour-overlay" onClick={fechar} aria-hidden="true" />

            {/* Spotlight */}
            {spotStyle && (
                <div
                    className="tour-spotlight"
                    style={spotStyle}
                    aria-hidden="true"
                />
            )}

            {/* Tooltip do passo atual */}
            <div
                className="tour-tooltip animate-fadeIn"
                style={{
                    position: 'fixed',
                    top: tooltipTop,
                    left: tooltipLeft,
                    zIndex: 10002,
                    width: 304,
                }}
                role="dialog"
                aria-label="Tour guiado"
            >
                <div className="tour-step-badge">
                    {currentStep + 1} / {TOUR_STEPS.length}
                </div>
                <h4 className="tour-title">{step.title}</h4>
                <p className="tour-text">{step.text}</p>
                <div className="tour-actions">
                    <button className="tour-skip" onClick={fechar}>Pular tour</button>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {currentStep > 0 && (
                            <button className="tour-btn-secondary" onClick={voltar}>← Voltar</button>
                        )}
                        <button className="tour-btn-primary" onClick={avancar}>
                            {currentStep < TOUR_STEPS.length - 1 ? 'Próximo →' : '🎉 Começar!'}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .tour-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.75);
                    z-index: 10000;
                    pointer-events: all;
                }
                .tour-spotlight {
                    position: fixed;
                    z-index: 10001;
                    border-radius: 12px;
                    box-shadow:
                        0 0 0 4px rgba(212, 175, 55, 0.6),
                        0 0 0 9999px rgba(0, 0, 0, 0.75);
                    pointer-events: none;
                    transition: all 0.35s ease;
                    background: transparent;
                }
                .tour-tooltip {
                    background: var(--surface-1);
                    border: 1px solid var(--amber);
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: var(--shadow-premium);
                }
                .tour-step-badge {
                    display: inline-block;
                    font-size: 0.625rem;
                    font-weight: 800;
                    letter-spacing: 0.15em;
                    color: var(--amber);
                    background: rgba(212,175,55,0.1);
                    border: 1px solid rgba(212,175,55,0.3);
                    border-radius: 99px;
                    padding: 3px 10px;
                    margin-bottom: 10px;
                }
                .tour-title {
                    font-size: 1rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }
                .tour-text {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin-bottom: 16px;
                }
                .tour-actions {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .tour-skip {
                    background: none;
                    border: none;
                    color: var(--text-disabled);
                    font-size: 0.75rem;
                    cursor: pointer;
                    padding: 0;
                    transition: color 0.2s;
                }
                .tour-skip:hover { color: var(--text-secondary); }
                .tour-btn-primary {
                    background: var(--amber);
                    color: #111;
                    border: none;
                    border-radius: 8px;
                    padding: 8px 16px;
                    font-weight: 700;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                .tour-btn-primary:hover { opacity: 0.85; }
                .tour-btn-secondary {
                    background: var(--surface-3);
                    color: var(--text-secondary);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .tour-btn-secondary:hover { background: var(--surface-2); }
            `}</style>
        </>
    );
}
